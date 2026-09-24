# Auth & Access Blueprint

NextAuth v5, Google provider, JWT strategy, gated to `ALLOWED_EMAIL_DOMAIN`. Every session
carries a `role` (one string) and an `access` list. **Gate on `access`, not `role`** — access is
additive (e.g. `apl_admin` is appended to any role).

## Where things live

| File | Owns |
|------|------|
| `src/auth.ts` | NextAuth config. The `jwt` callback assigns `role` + `access` from email lists/env |
| `src/lib/auth.ts` | `getAuthenticatedUser`, `requireAuth`, `hasAccess`, `isStudent`, `isOrganizationMember` |
| `src/lib/userid.ts` | `getUserIdByEmail`, `getOrganisationIdByUserId` — session email → Strapi ids |
| `src/middleware.ts` | Page gating: sign-in redirect, `ROUTE_ACCESS` prefix map, per-page special cases |
| `src/lib/inductions/access.ts` | Feature-specific guards (inductions) — the pattern for any feature needing finer control |
| `src/app/admin/layout.tsx` | `/admin` gate (`ashoka_admin`) |

Current roles and access values: read the `jwt` callback in `src/auth.ts` — it is the only
source of truth; don't copy the list elsewhere.

## Rules

1. **Pages** are gated by `src/middleware.ts`. New area or restricted tool → add it to
   `ROUTE_ACCESS` (or a special case) there, and hide it in the sidebar to match.
2. **API routes gate themselves.** Middleware only ensures sign-in; it does not role-check
   `/api/*`. Every handler, every method:
   - access-gated → `requireAuth([...access])`; returns the user or a ready 401/403 `NextResponse`.
   - identity only → `auth()` from `@/auth` (the common pattern in existing routes) or
     `getAuthenticatedUser()`; no session → 401.
3. **Never trust client-supplied user or organisation ids.** Resolve from the session email via
   `src/lib/userid.ts`.
4. Unauthenticated → 401. Authenticated but not allowed → 403. Resource exists but not theirs →
   404 when revealing existence would leak.
5. A feature with its own sharing model (per-cycle, per-role…) gets a guard module under
   `src/lib/<feature>/access.ts`, modelled on inductions. Don't inline those checks per route.
6. Never read `.env`; env lists (admins, testers, reps) are referenced by key name only.
