import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { strapiGet, strapiPost } from "./lib/apis/strapi"

// Special admin emails list for organization access
const ORGANIZATION_EMAILS = [
  "technology.ministry@ashoka.edu.in",
  "sg@ashoka.edu.in",
  // Add more organization emails as needed
]

// Department Representative emails for trajectory planner management
const REP_EMAILS = [
  "cs.rep@ashoka.edu.in",
  // "vansh.bothra_ug25@ashoka.edu.in",
  "physics.rep@ashoka.edu.in",
  "math.rep@ashoka.edu.in",
  "biology_ugrep@ashoka.edu.in",
  "econreps@ashoka.edu.in",
  "english.rep@ashoka.edu.in",
  "history.rep@ashoka.edu.in",
  "psy.rep@ashoka.edu.in",
  "socanth.rep@ashoka.edu.in",
  "polsci.rep@ashoka.edu.in",
  "chem.rep@ashoka.edu.in",
  "philosophy.rep@ashoka.edu.in",
  "soham.tulsyan_ug2023@ashoka.edu.in",
]

/**
 * Creates a user in Strapi if they don't already exist.
 * Called once during sign-in, not on every request.
 */
async function createUserInStrapiIfNotExists(user: { email: string; name?: string | null; image?: string | null }) {
  const userEmail = user.email
  const userName = user.name || ''

  try {
    // Check if a user with the same email exists
    const emailResponse = await strapiGet('/users', {
      filters: {
        email: {
          $eq: userEmail
        }
      }
    })

    if (!emailResponse || emailResponse.length === 0) {
      // User doesn't exist, need to create them
      let finalUsername = userName
      const batch = (userEmail.match(/_([^@]+)@/) || [])[1]?.toUpperCase() || ""

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
        batch: batch
      }

      console.log('Creating new user in Strapi:', userEmail)
      await strapiPost('/users', userData)
      console.log('Successfully created user in Strapi:', userEmail)
    }
  } catch (error) {
    // Log error but don't block sign-in - user can still use the app
    // They just won't have a Strapi record until next login attempt
    console.error('Error checking/creating user in Strapi:', error)
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
    async signIn({ user }: any) {
      // Only allow @ashoka.edu.in emails
      if (!user.email?.endsWith('@ashoka.edu.in')) {
        console.log(`Rejected sign-in attempt from: ${user.email}`);
        return false;
      }

      // Create user in Strapi if they don't exist (runs once at login)
      await createUserInStrapiIfNotExists({
        email: user.email,
        name: user.name,
        image: user.image
      });

      console.log(`Successful sign-in: ${user.email}`);
      return true;
    },

    async jwt({ token, user }: any) {
      // Initial sign in
      if (user) {
        const email = user.email!;

        // Determine user role based on email patterns
        // if (ORGANIZATION_EMAILS.includes(email)) {
        //   token.role = 'organization';
        //   token.access = ['platform', 'organization'];
        // } else if (process.env.BETA_TESTERS?.split(',').includes(email)) {
        //   token.role = 'beta_tester';
        //   token.access = ['platform', 'beta_features'];
        // } else if (email.includes('_ug')) {
        //   token.role = 'student';
        //   token.access = ['platform'];
        // } else {
        //   token.role = 'user';
        //   token.access = ['platform']; // Default access
        // }
        // Only for beta launch TODO: Change this before full launch
        if (ORGANIZATION_EMAILS.includes(email)) {
          token.role = 'organization';
          token.access = ['platform', 'organization'];
        } else if (process.env.BETA_TESTERS?.split(',').includes(email)) {
          token.role = 'beta_tester';
          token.access = ['platform', 'beta_features'];
        } else if (process.env.HOR_MEMBERS?.split(',').includes(email)) {
          token.role = 'hor_member';
          token.access = ['platform'];
        } else if (REP_EMAILS.includes(email)) {
          token.role = 'rep';
          token.access = ['platform', 'rep_dashboard'];
        } else if (email.includes('_ug') || email.includes('_asp') || email.includes('_yif') || email.includes('_phd') || email.includes('_msc') || email.includes('_ma')) {
          token.role = 'student';
          token.access = ['platform'];
        } else {
          token.role = 'user';
          token.access = ['none']; // Default access
        }

        token.email = email;
        token.name = user.name;
        token.picture = user.image;

        console.log(`JWT created for ${email} with role: ${token.role}`);
      }

      return token;
    },

    async session({ session, token }: any) {
      if (session.user && token) {
        session.user.role = token.role as string;
        session.user.access = token.access as string[];
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }

      return session;
    }
  },

  pages: {
    signIn: '/api/auth/signin',
    error: '/api/auth/error',
  },

  events: {
    async signIn(message: any) {
      console.log('Sign in event:', message.user?.email);
    },
    async signOut(message: any) {
      console.log('Sign out event:', message.token?.email);
    }
  }
})