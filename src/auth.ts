import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { strapiGet, strapiPost } from "./lib/apis/strapi"
import { normalizeEmail } from "./lib/authz/assigners"
import { batchFromEmail, claimsAreStale, readClaims, resolveClaimsSafe } from "./lib/authz/claims"
import { fetchStrapiUser } from "./lib/authz/loaders"
import { DEFAULT_ROLE, accessFor } from "./lib/authz/roles"
import type { StrapiUser } from "./lib/authz/types"

// Who gets which role lives in src/lib/authz/roles.ts.

/**
 * Returns the user's Strapi record, creating it first if there isn't one.
 * Called once during sign-in, not on every request. Returns null if Strapi
 * could not be reached — sign-in still goes ahead.
 */
async function ensureStrapiUser(user: { email: string; name?: string | null; image?: string | null }): Promise<StrapiUser | null> {
  const userEmail = user.email
  const userName = user.name || ''

  try {
    const existing = await fetchStrapiUser(userEmail)
    if (existing) return existing

    let finalUsername = userName

    // Check if username already exists
    if (userName) {
      const usernameResponse = await strapiGet('/users', {
        filters: {
          username: {
            $eq: userName
          }
        }
      })

      // If username exists, append random number
      if (usernameResponse && usernameResponse.length > 0) {
        finalUsername = `${userName} ${Math.floor(Math.random() * 100) + 1}`
      }
    }

    // Create new user in Strapi
    const userData = {
      email: userEmail,
      username: finalUsername,
      profile_url: user.image || '',
      password: Math.random().toString(36).slice(-8), // Random password
      role: 1,
      confirmed: true,
      blocked: false,
      batch: batchFromEmail(userEmail) ?? ''
    }

    platform.log('Creating new user in Strapi:', userEmail)
    await strapiPost('/users', userData)
    platform.log('Successfully created user in Strapi:', userEmail)
    return await fetchStrapiUser(userEmail)
  } catch (error) {
    // Log error but don't block sign-in - user can still use the app
    // They just won't have a Strapi record until next login attempt
    platform.error('Error checking/creating user in Strapi:', error)
    return null
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_CLIENT_ID!,
      clientSecret: process.env.AUTH_CLIENT_SECRET!,
      // Suggest Google limit accounts shown to the allowed hosted domain.
      // This is a UI hint and should NOT be relied on for security — see server-side check in `signIn` below.
      authorization: {
        params: {
          hd: process.env.ALLOWED_EMAIL_DOMAIN || 'ashoka.edu.in',
          prompt: 'select_account',
        },
      },
    })
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 2 * 24 * 60 * 60, // 48 hours
  },
  trustHost: true, // Important for NextAuth v5
  secret: process.env.NEXTAUTH_SECRET, // Add explicit secret
  callbacks: {
    async signIn({ user }) {
      const email = user.email ? normalizeEmail(user.email) : null

      // Only allow @ashoka.edu.in emails
      if (!email?.endsWith('@ashoka.edu.in')) {
        platform.log(`Rejected sign-in attempt from: ${user.email}`);
        return false;
      }

      // Create user in Strapi if they don't exist (runs once at login)
      const strapiUser = await ensureStrapiUser({
        email,
        name: user.name,
        image: user.image
      });

      if (strapiUser?.blocked) {
        platform.log(`Rejected sign-in from blocked user: ${email}`);
        return false;
      }

      platform.log(`Successful sign-in: ${email}`);
      return true;
    },

    /**
     * Resolves role, leagues, org memberships and Strapi id into the token on
     * sign-in, then again whenever they go stale (see CLAIMS_TTL_MS) or the
     * client calls `update()`. A user blocked in Strapi is signed out on the
     * next refresh.
     */
    async jwt({ token, user, trigger }) {
      const signingIn = Boolean(user?.email)

      if (user?.email) {
        token.email = normalizeEmail(user.email)
        token.name = user.name ?? null
        token.picture = user.image ?? null
      }

      if (!token.email) return token

      const previous = readClaims(token)
      if (!signingIn && trigger !== 'update' && !claimsAreStale(previous)) {
        return token
      }

      const result = await resolveClaimsSafe(token.email, token.name ?? null, signingIn ? null : previous)
      if (result.kind === 'blocked') {
        platform.log(`Signing out blocked user: ${token.email}`)
        return null
      }

      if (signingIn) {
        platform.log(`JWT created for ${token.email} with role: ${result.claims.role}`)
      }

      // `access` was stored on v1 tokens; it is now derived in `session` below.
      const { access: _legacyAccess, ...rest } = token
      return { ...rest, ...result.claims }
    },

    async session({ session, token }) {
      const claims = readClaims(token)
      const role = claims?.role ?? DEFAULT_ROLE
      const sports = claims?.sports ?? []

      session.user.uid = claims?.uid ?? null
      session.user.role = role
      session.user.access = accessFor(role, sports)
      session.user.batch = claims?.batch ?? null
      session.user.sports = sports
      session.user.orgs = claims?.orgs ?? []
      session.user.email = token.email ?? session.user.email
      session.user.name = token.name ?? session.user.name ?? ''
      session.user.image = token.picture ?? ''

      return session
    }
  },

  pages: {
    signIn: '/api/auth/signin',
    error: '/api/auth/error',
  },

  events: {
    async signIn(message: any) {
      platform.log('Sign in event:', message.user?.email);
    },
    async signOut(message: any) {
      platform.log('Sign out event:', message.token?.email);
    }
  }
})
