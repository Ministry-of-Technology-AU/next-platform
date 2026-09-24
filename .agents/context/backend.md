# BACKEND GUIDELINES

Scope: **backend only.** Codebase orientation, page/UI work, typechecks, build checks, graphify
re-indexing and deploy steps are handled by the orchestrator instruction set — not here.
Do not do them from this file.

This file covers: which skills to load, where things live, how a route is designed, the rules
every handler follows, and the practices that keep a shared EC2 box and its bill healthy.

`context/` = guidelines (this file). `blueprints/` = templates you copy.

---

## 1. Skills

### Always
| Skill | Why |
|-------|-----|
| `/nextjs-app-router-patterns` | Route handlers, server components, `revalidateTag`, streaming — the Next 15 way to do it |

### By task
| If you are... | Load |
|---------------|------|
| Adding **auth, uploads, webhooks, mail sends** or anything a stranger could hit | `/security-review` before handoff |
| Building anything that **calls an LLM** | `/claude-api` |
| Writing **email bodies** or any error string a user reads | `.agents/context/writing.md`, then `/humanizer` |
| **Reviewing** a route before handoff | `/code-review` |
| **Documenting** a shipped feature's API | `/platform docs` |

Skills live in `.agents/skills/<name>/SKILL.md`. Read the `SKILL.md` only — go into
`references/` or `workflows/` only when that skill tells you to.

---

## 2. Where things live

Read only what the current task needs. Do not preload all of these.

| Path | Read when |
|------|-----------|
| `.agents/blueprints/route.md` | **Always.** The route contract and folder shape. `api/platform/semester-planner/` is its reference. |
| `.agents/blueprints/auth.md` | **Always.** Roles, `access` grants, `requireAuth`, ownership, status codes. |
| `.agents/blueprints/strapi.md` + `src/lib/apis/strapi.ts` | Any Strapi read or write — filters, populate, fields, pagination. |
| `.agents/blueprints/caching.md` | Any fetch, Strapi call, route response or image. §2 decides the tier, §8 is the rules. |
| `.agents/blueprints/realtime.md` | Anything live. §7 (rules) is a gate, not advice. |
| `.agents/blueprints/google-workspace.md` | Drive, Calendar, mail, or a Google token outside NextAuth. |
| `src/lib/apis/CLOUDINARY-API-GUIDE.md` | Uploading, deleting or serving an image or file. |
| `src/lib/` + `.agents/context/libraries.md` | Before writing any helper. `ls src/lib` — the doc can lag the folder. |
| `src/lib/forms/api-helpers.ts` | You need `jsonOk`, `jsonError`, `rateLimit` or `csvEscape`. |
| `src/lib/rate-limit.ts` | Adding a route that sends mail, a public endpoint, or a per-route limit. §7. |
| `src/lib/cache/` | `createLru`, `sharedCache`, `CACHE_TAGS`, `STRAPI_MODEL_TAGS`, `withCacheControl`. |
| `src/lib/inductions/access.ts` | Access depends on the specific record — this is the reference guard module. |
| `src/app/api/uploads/route.ts` | Unsure how to validate untrusted input — the reference for zod, size, type and signature checks, rate limit. |
| `src/app/api/revalidate/route.ts` | Building a webhook — the reference for bearer auth that fails closed. |
| `src/lib/forms/strapi-forms.ts` | Writing to Strapi data that is cached — the reference for `revalidateTag` after a write. |
| `src/middleware.ts` | Adding a restricted page area, or a public endpoint (webhook, SSE) that must skip the sign-in check. |
| `.agents/context/architecture.md` → environment | You need an env key. **By name only — never open `.env`.** |

---

## 3. Contract first

Before any handler code. The PRD's data section is the input; ask if it is missing.

1. **Collection types first.** List every Strapi collection type the feature reads or writes,
   with exact fields and relations. The user creates them in Strapi — you never do, and you
   never touch SQLite. Confirm the list before writing a query against it.
2. **Endpoint list.** Every route, its methods, and who may call each method (the `access`
   grant, identity only, or a record-level guard). Paths mirror the page: the route for
   `platform/<tool>` is `api/platform/<tool>`.
3. **Types in the page's `types.ts`.** Request body, query params, response `data` shape.
   The route and the page import the same types — never redeclare them in the route.
4. **Pick the cache tier per endpoint** with `caching.md` §2. Write it next to the endpoint
   in the plan: `private`, `privateShort`, `shared` + L2 tag, or none.
5. **Decide where the logic goes.** Used only by this route → `helper.ts` beside it. Also
   needed by a server component → `src/lib/<feature>/` (the page calls the function, it does
   not fetch the route). See §4.4.
6. **Confirm with the user**, then write the handler.

---

## 4. Rules

### 4.1 Never touch the database
Strapi owns SQLite. Every read and write goes through `src/lib/apis/strapi.ts`.

```ts
// NO
import Database from 'better-sqlite3'
await axios.get(`${process.env.STRAPI_URL}/pools`, { headers: { Authorization: `Bearer ${token}` } })

// YES
import { strapiGet } from '@/lib/apis/strapi'
const res = await strapiGet('/pools', { filters: { owner: { id: { $eq: user.uid } } }, fields: ['title'] })
```

Same for every other service: Cloudinary through `src/lib/apis/cloudinary.ts`, Google through
the `src/lib/apis/` wrappers. Need something a wrapper doesn't do? Extend the wrapper, flag it
to the user. Never inline a second client.

### 4.2 Every handler gates itself
Middleware only checks sign-in on `/api/*`. It never checks roles. So every method, in every
route, starts with one of:

```ts
// access-gated
const result = await requireAuth(['rep_dashboard'])
if (result instanceof NextResponse) return result
const { user } = result

// identity only
const user = await getAuthenticatedUser()
if (!user) return jsonError('Sign in to continue', 401)
```

- Gate on `access`, never `role`.
- The caller's Strapi id is `user.uid`; their orgs are `user.orgs`. **Never trust an id,
  email or org id from the body, query or path** for ownership — compare the record's owner to
  the session.
- Record-level rules (this cycle, this form, this role) live in `src/lib/<feature>/access.ts`
  and every route calls them. No inline copies.
- Destructive or ownership-critical actions recheck against Strapi at the time of the action.
  Session claims can be 10 minutes old.

Full detail: `.agents/blueprints/auth.md`.

### 4.3 Reuse before you build
1. `src/lib/apis/` — a service wrapper already does this?
2. `src/lib/<feature>/`, `src/lib/cache/`, `src/lib/auth.ts` — a helper already does this?
3. `src/lib/forms/api-helpers.ts` — response, rate-limit or CSV helper?
4. Only then write new, in `helper.ts` or `src/lib/<feature>/`.

Package needs installing? **Ask the user to run the install command.** Never add `googleapis`
(use the per-API `@googleapis/*` package), and flag anything that adds weight to the shared box.

### 4.4 Thin routes
Routes orchestrate, they don't compute. A handler reads: gate → validate → call helpers →
respond. Query building, mapping Strapi's `attributes` into the page's types, and business
rules go in `helper.ts`. Used by one route → `helper.ts`. Used by 2+ routes or by a server
component → `src/lib/<feature>/`.

**No server component fetches our own route.** It calls the `src/lib/<feature>/` function the
route calls. A self-fetch with a Cookie header and a `revalidate` is the 3–5 GB disk bug in
`caching.md` §0.2.

### 4.5 Server boundary
- Any module holding a secret or calling a service gets `import 'server-only'` at the top, so
  a client import fails the build instead of shipping the secret.
- Route files never carry `'use server'`. That directive is for Server Actions; a route
  handler is already server-only.
- Secrets never get a `NEXT_PUBLIC_` prefix. Anything with that prefix ships to the browser.
- `export const dynamic = 'force-dynamic'` on any route that reads the session or cookies.

### 4.6 Basics
- `platform.log()` / `platform.error()`, never `console.*`.
- No `any`. Handle nulls explicitly — never `data!.field`, never `authHeader!.slice()`.
- Strapi responses are untyped at the edge. Narrow them into the page's types in the helper,
  with defaults for every nullable field, before they reach the handler.
- Env keys by name only. Read them once at module top, and fail closed when a required one is
  missing.

### 4.7 Known gaps
Older code breaks these rules. Fix them when you work in the file; never copy the pattern.

| Where | Gap | Fix |
|-------|-----|-----|
| ~41 route files | `auth()` from `@/auth` plus `getUserIdByEmail` | `requireAuth()` / `getAuthenticatedUser()` and `user.uid` |
| `src/lib/auth.ts` `requireAuth` | 401/403 bodies are `{ error }` with no `success: false` | Return the §5 envelope |
| `api/platform/rti`, `courses`, `events`, `events/preferences` | `'use server'` on route files | Delete the directive |
| `api/platform/sports/{apl,aba}/webhook` | Accept every call when `WEBHOOK_SECRET_TOKEN` is unset; plain `!==` compare | Copy `api/revalidate`: fail closed, `timingSafeEqual` |
| ~190 lines across `src/app/api` | `console.*` | `platform.*` |
| `api/platform/courses/route.ts` and others | `filters: any`, `populate` with no `fields` | Typed filters, `fields` on every populate |
| `jsonOk` / `jsonError` / `rateLimit` | Live in `src/lib/forms/` though every route needs them | Use them from there for now; a move to a shared module is a separate task |

---

## 5. Responses & errors

Every response has **one shape**. The page's `{ data, error }` contract depends on it.

```ts
{ success: true,  data: T }
{ success: false, error: string }
```

Use `jsonOk(data, status?)` and `jsonError(message, status)` from `src/lib/forms/api-helpers.ts`.
Never `NextResponse.json(strapiResponse)` straight through — map it to the page's type first.

### Status codes
| Situation | Status |
|-----------|--------|
| Read or update succeeded | 200 |
| Created | 201 |
| Body, query or params fail validation | 400 |
| Not signed in | 401 |
| Signed in, lacks the grant | 403 |
| Record doesn't exist — **or** it isn't theirs and saying so would reveal it exists | 404 |
| Duplicate, or state changed underneath (already applied, slot taken) | 409 |
| Upload too large | 413 |
| File type not allowed | 415 |
| Rate limit hit | 429 |
| Strapi, Google or Cloudinary failed; anything unexpected | 500 |

### Validate everything that crosses the boundary
- Body, query params and dynamic path params go through a **zod schema with `safeParse`**.
  Never `await request.json()` straight into a Strapi write.
- Parse JSON defensively: `await request.json().catch(() => null)`, then 400 on null.
- Numbers from the path are strings — `z.coerce.number().int().positive()`.
- Strip to known fields. The client does not get to set `owner`, `organisation`, `status` or
  any relation the server should decide.
- Reference: `src/app/api/uploads/route.ts`.

### Error messages
- Say what happened and what to do next: *"Too many uploads in a short time — wait a minute
  and try again."* Never bare "Error" or "Something went wrong".
- **Never leak internals**: no stack traces, no Strapi error bodies, no axios messages, no
  query strings, no env names. Log the detail with `platform.error`, send the human sentence.
- One `try/catch` around the whole handler, with a 500 fallback. Expected failures (not found,
  forbidden) return early; they are not exceptions.
- Messages a user reads follow `.agents/context/writing.md`.

---

## 6. Load & cost

### The box
One EC2 `t3a.medium` runs this app, Strapi + SQLite, and two other apps. RAM, CPU and disk are
shared; egress is billed. Every handler is written as if 500 students hit it in the same
minute, because during inductions or a live APL match they do.

### Ask Strapi for less — native, not optional
Over-fetching is the single most expensive habit in this repo. An APL participant row reached
11 KB because of one loose populate.

- **No `populate: '*'`** in anything that reaches the browser.
- **`fields: [...]` on the root and on every populate,** listing only what the page renders.
- **Filter in Strapi, not in JS.** Pulling 2,000 rows to `.filter()` five of them is a bug.
- **Count, don't download.** `pagination: { pageSize: 1 }` + `meta.pagination.total`;
  `/users/count` for users-permissions.
- **Cap every list.** Explicit `pageSize`. `limit: -1` needs a comment saying why the set is
  bounded.
- **No N+1.** A `strapiGet` inside a loop is one `$in` filter. Independent calls run in
  `Promise.all`, not in sequence.
- **Never send other users' emails** to the browser unless the UI shows them to someone
  allowed to see them.

### Caching
Pick the tier with `caching.md` §2 before writing the fetch. The short form:

- Per-user data is **never** cached on the server. `withCacheControl(res, 'private')` or
  `'privateShort'`.
- Same-for-everyone data with a countable key set → `sharedCache` with a tag and a comment
  stating key cardinality.
- Every write that changes cached data calls `revalidateTag` right after. Edits in the Strapi
  admin reach `/api/revalidate` — map new models in `STRAPI_MODEL_TAGS`.
- A response containing viewer data is never `public`.

### Realtime
SSE only where the data is genuinely live, and only after `realtime.md` §7 is satisfied. The
event carries the change, broadcasts are scoped, cleanup binds to `request.signal`, and the
PR states `clients × events × payload`. If that number is not bounded by construction, it is
not ready.

---

## 7. Security & abuse

### Rate limiting
Two layers, each with one job. The nginx flood guard sits in front, per IP, and is loose on
purpose because of campus NAT (see `architecture.md` → nginx). Behind it is **the global API
limit in `src/middleware.ts`**, which runs on every `/api/*` request before any handler:

| Bucket | Applies to | Keyed by | Limit |
|--------|------------|----------|-------|
| `read` | GET / HEAD | Session email | 180 / min |
| `write` | POST / PUT / PATCH / DELETE | Session email | 60 / min |
| `mail` | Writes to `MAIL_ROUTES` (on top of `write`) | Session email | 10 / min |
| `anonymous` | Any call with no session | Client IP (`X-Real-IP` from nginx) | 60 / min |

Numbers and route lists live in `API_LIMITS`, `MAIL_ROUTES` and `EXEMPT_PREFIXES` in
`src/lib/rate-limit.ts`. It is in-memory, per process, using a sliding-window counter with a
10k-key cap. That is correct for our one Next process. pm2 cluster mode would need a shared store.

- **A route that starts sending email** on a user action goes into `MAIL_ROUTES`.
- **A new public endpoint** (webhook, SSE) goes into `EXEMPT_PREFIXES` and the middleware
  exemptions. A 429 makes an `EventSource` stop reconnecting for good, so SSE gets connection
  caps (`realtime.md` §4.8) instead.
- **Expensive or abusable actions also get a per-route limit** in the handler:
  `rateLimit(key, limit, windowMs)` from `src/lib/forms/api-helpers.ts`, or `checkRateLimit`
  from `src/lib/rate-limit.ts`. Submits, uploads and bulk actions are examples. `uploads`
  allows 30 a minute; form submits allow 5.
- Key by the session, `` `${feature}:${user.email}` ``, never by a client-supplied value.
- Size the limit to real use, not a round number.
- Return `tooManyRequests(retryAfter)`. It uses the §5 envelope and sets `Retry-After`.
- Server components that call `src/lib/` functions directly never count against a user's
  limit. Self-fetches do, which is one more reason to remove them.

### Webhooks
Strapi calls us; nobody else should be able to.

- `Authorization: Bearer <WEBHOOK_SECRET_TOKEN>`, compared with `timingSafeEqual`.
- **Fail closed**: token unset → reject everything. `src/app/api/revalidate/route.ts` is the
  reference.
- A webhook route is public to middleware. Add it to the exemptions in `src/middleware.ts`, or
  Strapi gets redirected to `/login`.
- Validate the payload shape. Treat `model`, `event` and `entry` as untrusted strings.
- Webhooks are idempotent: Strapi retries, and the same event may arrive twice.

### Uploads
Server-side only, through `/api/uploads` or a route built the same way. The client is untrusted
even when it already validated: re-check size, extension, MIME and file signature. Images go to
Cloudinary. Drive is public-by-link — nothing private goes through `uploadToDrive`.

### Mail
- Recipients come from Strapi or the session, never raw from the request body.
- Rate-limit every endpoint that sends. A loop that mails every applicant runs once, behind a
  guard, not on every request.
- The write succeeds or fails on its own. A failed email is logged and reported in the
  response; it does not roll back the Strapi write unless the PRD says the two are atomic.

### Data exposure
- Return only what the caller may see. Filter fields in the helper, not in the page.
- CSV exports go through `csvEscape` — it blocks spreadsheet formula injection.
- Never log tokens, cookies, full request bodies or lists of emails.

---

## 8. Side effects & observability

### Order of operations in a write
```
gate → validate → recheck ownership (destructive only) → Strapi write
     → revalidateTag → side effects (mail, calendar, Cloudinary cleanup) → respond
```

- The Strapi write is the source of truth. Side effects run after it succeeds.
- A side effect that fails is logged with `platform.error` and, if the user should know,
  named in the response (`data.warnings`). It does not turn a successful write into a 500.
- A write that fails after an upload deletes the orphaned Cloudinary asset
  (`deleteImageFromCloudinary`).
- Slow side effects that the user does not wait on (bulk mail, calendar sync) never block the
  response for more than a few seconds. Batch them, and flag anything that needs a queue.

### Logging
- `platform.log` / `.warn` / `.error` only. Prefix with the route:
  `platform.error('POST /api/platform/pool-cab failed:', err)`.
- `platform.*` is **silent in production** (`src/lib/platform-logger.ts`). It is a dev tool, not
  production observability. Do not assume a log line will exist on the server.
- pm2 captures stdout on the box; rotation is set up per `caching.md` §7.2.
- Never log per-request URLs or payloads in a hot path. Strapi URL logging on every call once
  filled pm2 logs.

### Measuring
Before claiming a route is cheap, measure it: response size on the wire, number of Strapi calls
per request, and whether `content-encoding` is present. `realtime.md` §6 has the method.

---

## 9. Before handing off

Backend-level only. Typecheck, build and deploy checks belong to the orchestrator.

- [ ] Collection types and fields confirmed with the user; nothing touches SQLite.
- [ ] Request and response types live in the page's `types.ts`; route and page share them.
- [ ] Every method gates itself — `requireAuth([...])` or `getAuthenticatedUser()` — and gates on
      `access`, not `role`.
- [ ] Ownership compared against `user.uid` / `user.orgs`, never a client-sent id. Destructive
      actions recheck against Strapi.
- [ ] Body, query and path params validated with zod `safeParse`; unknown fields stripped.
- [ ] Every response uses `{ success, data }` / `{ success: false, error }` with the right status.
- [ ] No stack traces, Strapi bodies or env names in any error a client sees.
- [ ] No `populate: '*'`; `fields` on the root and every populate; lists capped; no N+1.
- [ ] Cache tier chosen per `caching.md` §2; `withCacheControl` preset on every response;
      writes to cached data call `revalidateTag`.
- [ ] No server component fetches this route — it calls the shared `src/lib/<feature>/` function.
- [ ] Repeatable writes, uploads and mail sends are rate-limited.
- [ ] Webhooks fail closed with `timingSafeEqual` and are exempted in `src/middleware.ts`.
- [ ] Secret-holding modules import `'server-only'`; no `'use server'` on route files.
- [ ] `platform.*` only, no `any`, nulls handled, env keys by name.
- [ ] Any known gap from §4.7 in a touched file is fixed, or flagged to the user.
- [ ] User-facing error strings follow `.agents/context/writing.md`.
