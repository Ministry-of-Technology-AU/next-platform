import { DefaultSession } from "next-auth"
import type { PlatformRole } from "@/lib/authz/roles"
import type { OrgMembership, Sport } from "@/lib/authz/types"

declare module "next-auth" {
  interface Session {
    user: {
      /** Strapi user id. Null only when the user has no Strapi record. */
      uid: number | null
      role: PlatformRole
      /** Derived from `role` + `sports` on every read — see `accessFor`. */
      access: string[]
      batch: string | null
      /** Leagues this user is a point of contact for. */
      sports: Sport[]
      /** `[orgId, tier, sport]` — tier 0 is the org account, 1 circle 1, 2 circle 2. */
      orgs: OrgMembership[]
      email: string
      name: string
      image: string
    } & DefaultSession["user"]
  }

  interface User {
    role?: string
    access?: string[]
  }
}

// JWT fields are not augmented here: `next-auth/jwt` re-exports a nested copy of
// `@auth/core`, so an augmentation never reaches the real type. Token claims are
// validated at runtime instead — see `readClaims` in src/lib/authz/claims.ts.
