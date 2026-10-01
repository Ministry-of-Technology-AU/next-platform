# Auth & Access Blueprint

NextAuth v5 with Google sign-in and a JWT session. Only `@ashoka.edu.in` accounts get in.
Who someone is (their role, leagues and organisations) is worked out from Strapi and the
environment, stored in the session cookie, and refreshed every 10 minutes.

**Gate on `access`, not `role`.** A role is one label; `access` is the list of grants that role
carries plus any grants from leagues the user runs. Checking `access` keeps working when a new
role is added.

---

## 1. Where things live

| File | Owns |
|---|---|
| `src/auth.ts` | NextAuth config: Google provider, `signIn` / `jwt` / `session` callbacks, creating the Strapi user on first sign-in |
| `src/lib/authz/roles.ts` | **The role registry.** Every role, its access grants and who gets it. Also the league (sport) registry, `accessFor()`, `STUDENT_EMAIL`, `YSP_EMAIL` |
| `src/lib/authz/assigners.ts` | Ready-made "who gets this" functions (`byEnvList`, `byEmailPattern`, `byOrgTier`, `anyOf` …), `normalizeEmail`, `envEmailList` |
| `src/lib/authz/claims.ts` | Turns an email into session claims, decides when they are stale, handles Strapi being down |
| `src/lib/authz/loaders.ts` | The Strapi reads behind the claims (user record, org memberships, collection lookups) |
| `src/lib/authz/types.ts` | Shared shapes: `Sport`, `OrgTier`, `OrgMembership`, `AssignContext`, `RoleDefinition` |
| `src/types/auth.d.ts` | The typed `session.user` |
| `src/lib/auth.ts` | What app code uses: `getAuthenticatedUser`, `requireAuth`, and the check helpers |
| `src/middleware.ts` | Page gating: sign-in redirect, `ROUTE_ACCESS`, per-page special cases |
| `src/components/sidebar/*.ts` | What each role sees in the sidebar (display only, not security) |
| `src/lib/<feature>/access.ts` | Feature guards with their own sharing rules. `src/lib/inductions/access.ts` is the reference. |
| `src/app/admin/layout.tsx` | The `/admin` gate |

---

## 2. How a session is built

```
Google sign-in
  └─ signIn callback
       ├─ reject unless the email ends in @ashoka.edu.in
       ├─ create the Strapi user if missing (only here, never per request)
       └─ reject if the Strapi user is blocked
  └─ jwt callback: resolve claims ──► stored in the session cookie
       uid, batch, role, sports, orgs, authzAt, v
  └─ session callback, on every read
       access = accessFor(role, sports)       ← derived, never stored
```

### 2.1 Resolving claims (`claims.ts`)

1. Load the Strapi user (`/users` by email) and, if there is one, their org memberships
   (`/organisations` where they are `profile`, circle 1 or circle 2). Two Strapi calls.
2. Resolve **leagues** first: every sport in `SPORT_POCS` is checked, so one person can run
   several.
3. Resolve the **role**: roles in `ROLES` are tried top to bottom, and the first one whose
   `assign` returns true wins. `user` at the bottom always matches.
4. An assigner that throws is treated as "no". It never breaks sign-in.

### 2.2 Keeping claims fresh

| Trigger | What happens |
|---|---|
| Claims older than `CLAIMS_TTL_MS` (10 minutes) | Re-resolved on the next request. Role and org changes reach signed-in users without a re-login. |
| `CLAIMS_VERSION` bumped | Every token re-resolves on its next request. Bump it when the claim shape changes. |
| Client calls `update()` from `useSession` | Re-resolved immediately. Use after changing the current user's own role or org. |
| User blocked in Strapi | Signed out at the next refresh. |
| Strapi unreachable | Keeps the previous claims (or, with none, resolves from the email alone, so env and email-pattern roles still work) and retries after 60 seconds. |

A stale cookie is seen by middleware and every `auth()` call in the same request, so resolves
for one email are shared for 5 seconds. One refresh costs one pair of Strapi calls, not one per
`auth()` call.

Middleware runs on the **Node runtime** (`runtime: 'nodejs'`), because refreshing claims calls
Strapi through axios, which does not run on the edge.

### 2.3 What the session holds

| Field | Type | Meaning |
|---|---|---|
| `uid` | `number \| null` | Strapi user id. Null only if the user has no Strapi record. |
| `role` | `PlatformRole` | One role from the registry |
| `access` | `string[]` | Grants from the role plus grants from leagues. Derived on every read. |
| `batch` | `string \| null` | `UG2023`, `YIF2024` … From Strapi, or parsed from the email. |
| `sports` | `Sport[]` | Leagues the user is a point of contact for (`apl`, `aba`, `rsl`) |
| `orgs` | `OrgMembership[]` | `[orgId, tier, sport?]`. Tier 0 is the org account, 1 circle 1, 2 circle 2. |
| `email`, `name`, `image` | `string` | From Google. Email is trimmed and lowercased. |

The cookie rides on every request, which is why `orgs` is a tuple and not an object. **Keep new
claims small.** Anything large or per-feature is looked up when needed, not stored in the token.

---

## 3. Roles, leagues and access

`src/lib/authz/roles.ts` is the only source of truth for roles, their grants and who gets them.
Don't copy the list into other files or docs; link to it.

Things worth knowing about the registry:

- **Order is priority.** A super admin who is also a student gets `superadmin`, because it is
  higher up.
- **Leagues add access on top of the role.** An APL point of contact gets `apl_admin` whatever
  their role is. Their leagues are in `session.user.sports`.
- **Students** are any address with an underscore in the local part (`name_ug2023@`). Every
  programme is the one `student` role; tell them apart with `batch` and `hasProgramme()`.
- **YSP** addresses (`_ysp`) are checked before `student` and get their own role.
- **Organisation account** means the org's own Strapi `profile` (tier 0) or a governance account.
  Circle 1 and circle 2 leads do **not** get the `organization` role for being leads.

### 3.1 Adding a role

1. Add a `defineRole({...})` entry to `ROLES` in `roles.ts`, at the right priority.
2. Give it `access` grants and an `assign` function. Use one from `assigners.ts`, combine them
   with `anyOf` / `allOf`, or write your own. It can be async and read `ctx.user`, `ctx.orgs`,
   `ctx.batch`, `ctx.sports`.
3. If it needs its own sidebar entries, add it to the `roles` map in the right file under
   `src/components/sidebar/`.
4. If it gates pages, update `ROUTE_ACCESS` in `src/middleware.ts` (section 5.1).

Assigners that read the shared context cost nothing extra. An assigner that fetches (like
`byStrapiCollection`) adds a Strapi call to every refresh that reaches it, so put those roles
below the cheap ones.

### 3.2 Adding a league

Add it to `SPORTS` in `types.ts` and to `SPORT_POCS` in `roles.ts` with its label, extra `access`
and `assign`.

### 3.3 Adding an access grant

Add the string to the `access` list of each role (or league) that should have it. Then gate on
it with `requireAuth(['your_grant'])` or `hasAccess()`.

---

## 4. Reading the user in code

### 4.1 Server (pages, layouts, route handlers)

```ts
import { getAuthenticatedUser, requireAuth } from '@/lib/auth'

// Identity only
const user = await getAuthenticatedUser()          // AuthenticatedUser | null
if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })

// Access-gated: returns { user } or a ready 401/403 NextResponse
const result = await requireAuth(['rep_dashboard'])
if (result instanceof NextResponse) return result
const { user } = result
```

`getAuthenticatedUser()` is wrapped in `React.cache`, so a layout, page and components calling it
in one render share a single session read.

| Helper (`src/lib/auth.ts`) | Answers |
|---|---|
| `hasAccess(user, ['a', 'b'])` | Has any of these grants |
| `orgTier(user, orgId)` | Their tier in that org, or null |
| `hasOrgTier(user, orgId, 1)` | Org account or circle 1 in that org (lower is more senior) |
| `hasProgramme(user, ['UG'])` / `programmeOf(batch)` | Batch-restricted tools |
| `isSportPoc(user, 'apl')` | Runs that league |
| `isOrganizationMember(user)` | Has the `organization` grant |
| `isStudent(user)` | Student role, or a student-pattern email that is not YSP |

**The user's Strapi id is `user.uid`.** Don't call `getUserIdByEmail` for the signed-in user; it
costs a Strapi query and the id is already in the session. `getUserIdByEmail` is only for looking
up someone else.

### 4.2 Client components

Prefer passing what the client needs as props from the server component. The platform and admin
layouts already resolve `role` and `access` once and pass them down. Use `useSession()` only when
a client component needs the session and has no server parent to get it from.

---

## 5. Gating

Four layers. Each does one job.

### 5.1 Pages: `src/middleware.ts`

- Not signed in → redirect to `/login?callbackUrl=…`.
- `ROUTE_ACCESS` maps a path prefix to the grants it needs. A new restricted area goes here.
- Special cases (HOR dashboard, APL admin, rep dashboard, `ashoka_admin` blocked routes, shared
  induction roles) sit above the prefix loop.
- Middleware does **not** role-check `/api/*`. It only makes sure the user is signed in.

### 5.2 Sidebar: `src/components/sidebar/*.ts`

Controls what a role **sees**, not what it can reach. Always pair a hidden sidebar item with a
middleware rule. Visibility, in order: no `roles` and no `hideFor` means everyone; `roles` limits
to those roles; `hideFor` hides from those roles; `requiresAccess` also needs that grant.

### 5.3 API routes: every handler gates itself

Every method in every route handler:

- access-gated → `requireAuth([...])`
- identity only → `getAuthenticatedUser()`, 401 when null
- ownership → compare the resource's owner with `user.uid` or `user.orgs`, never with an id the
  client sent

### 5.4 Features with their own sharing model: `src/lib/<feature>/access.ts`

When access depends on the specific record (this cycle, this role, this form), write guard
functions in one module and call them from every route. Don't repeat the checks inline.
`src/lib/inductions/access.ts` is the reference: it lets in the organisation account and people
the org added to a specific role, and re-checks the caller against the org's `profile` rather
than trusting a circle membership.

**Session claims can be up to 10 minutes old.** They are fine for showing and hiding things.
For a destructive or ownership-critical action (deleting, transferring, granting access), check
membership against Strapi at the time of the action, as the inductions guards do.

---

## 6. Status codes

| Situation | Status |
|---|---|
| Not signed in | 401 |
| Signed in, lacks the grant | 403 |
| The record exists but is not theirs, and saying so would reveal it exists | 404 |

---

## 7. Rules

1. **Gate on `access`,** not `role`. `role` is for display and for picking a sidebar.
2. **Roles live in `src/lib/authz/roles.ts` only.** No email lists or role checks copied into
   routes or components. Read env lists with `envEmailList()` when you must.
3. **Every API handler gates itself.** Middleware does not protect `/api/*` beyond sign-in.
4. **Never trust ids from the client.** The user's id is `user.uid`; their organisations are
   `user.orgs`.
5. **Recheck against Strapi before destructive or ownership-critical actions.** Session claims
   can be 10 minutes old.
6. **Keep the token small.** New claims are ids and short strings, never lists that grow.
7. **A hidden sidebar item still needs a middleware rule.**
8. **Don't create Strapi users anywhere but the `signIn` callback.**
9. **Never read `.env`.** Refer to env keys by name only.

---

## 8. Environment keys

| Key | Used for |
|---|---|
| `AUTH_CLIENT_ID`, `AUTH_CLIENT_SECRET` | Google OAuth client |
| `NEXTAUTH_SECRET` | Signing the session token |
| `ALLOWED_EMAIL_DOMAIN` | Google's account-picker hint only (`hd`). The real check is in `signIn`. |
| `SUPERADMIN_EMAILS`, `ADMIN_EMAILS`, `BETA_TESTERS`, `HOR_MEMBERS` | Role lists |
| `APL_ADMIN_EMAILS`, `ABA_ADMIN_EMAILS`, `RSL_ADMIN_EMAILS` | League points of contact |
| `AUTHORIZED_EMAILS` | Middleware override that lets these emails past `ROUTE_ACCESS` |
| `BYPASS_AUTH` | Skips the `/admin` layout gate when `true`. Never set in production. |

---

## 9. Known gaps

Older code that predates the rewrite. Fix these when you work on the file; don't copy the
pattern.

| Where | Gap | Fix |
|---|---|---|
| About 40 API routes | `auth()` from `@/auth` plus `getUserIdByEmail` | `getAuthenticatedUser()` and `user.uid` |
| `src/auth.ts` `signIn` | Domain is hardcoded to `@ashoka.edu.in`; `ALLOWED_EMAIL_DOMAIN` only feeds the `hd` hint | Read the domain from one place |
| `src/app/admin/layout.tsx` | Reads `ADMIN_EMAILS` directly and honours `BYPASS_AUTH` | `hasAccess(user, ['ashoka_admin'])` |
| `src/middleware.ts` HOR dashboard | Reads `HOR_MEMBERS` directly instead of using the role | Give `hor_member` a grant (e.g. `hor_dashboard`) and gate on it |
| `src/lib/userid.ts` | `getOrganisationIdByUserId` queries Strapi | Use `user.orgs` |
