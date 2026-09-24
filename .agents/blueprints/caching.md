# Caching Blueprint

How and where `next-platform` caches data. Read this before adding a fetch, a Strapi call, a
route handler or an image. Live data (SSE) has its own blueprint: [realtime.md](./realtime.md).

**The short version:** the browser, CloudFront and Cloudinary do the heavy lifting because they
are free and they are not our server. The server keeps only a tiny, fixed cache of data that is
the same for every user. Per-user data is never cached on the server.

---

## 0. Constraints

### 0.1 The box

One AWS EC2 `t3a.medium` (2 vCPU, 4 GB RAM, 16 GB gp3), shared with `sg-website`, `sg-strapi`
(Strapi 4 + SQLite) and `events-cal`. RAM and disk belong to all of them, so the server-side
cache has a hard budget:

| Resource | Budget for caching | What uses it |
|---|---|---|
| RAM | about 10 MB | Next's in-memory copy of the Data Cache (capped in `next.config.ts`), plus the userId LRU (about 100 KB) |
| Disk | under 20 MB, under 100 files in `.next/cache/fetch-cache` | A handful of global L2 keys |

If a change needs more than this, it does not belong on the server. Push it to the browser or
the CDN.

### 0.2 What went wrong on inductions (3 to 5 GB of cache)

Two server components fetched our own API with the user's cookie **and** a revalidate:

```ts
fetch(`${baseUrl}/api/platform/organisations-catalogue`, {
  headers: { Cookie: cookieStore.toString() },
  next: { revalidate: 30 },
})
```

Next builds the Data Cache key from the URL **and the request headers**. The Cookie header is
different for every user and changes whenever a session token refreshes, so every page view
wrote a new file holding the full org catalogue. Next never deletes old fetch-cache files, so
the folder grew without limit.

The general lesson: **disk cache size grows with the number of distinct keys, not the number of
requests.** One key read a million times is fine. A million keys read once each fills the disk.

### 0.3 Bill and speed are separate problems

- **Bill** (EC2 data transfer out, about ₹8/GB): goes down only when fewer bytes leave EC2.
  That means smaller responses, fewer browser requests, or someone else serving the bytes.
- **Speed and load** (latency, Strapi and SQLite load): goes down with server-side caching.
  Next to Strapi traffic is `localhost` and free, so server caching does not touch the bill.

When you propose a caching change, say which one it improves.

---

## 1. The tiers

| Tier | Holds | Lives in | Server cost |
|---|---|---|---|
| **Browser** | `/public` assets, built JS/CSS, per-user API responses for a short time, small UI prefs | The user's browser cache (HTTP `Cache-Control`), `localStorage` for tiny prefs only | 0 |
| **CDN** | `/_next/static/*` (JS, CSS, fonts) | CloudFront, via `assetPrefix` | 0 |
| **Cloudinary** | Every image: banners, avatars, adverts, mascots | Cloudinary's own CDN | 0 |
| **L1: server memory** | Email to Strapi id, per-request dedupe | Node heap, bounded LRU and `React.cache` | about 100 KB |
| **L2: server disk** | A few global datasets (org list, adverts, metrics, courses), plus one entry per Strapi entity where the count is small (one per form, per cycle) | `.next/cache/fetch-cache` via `sharedCache` / `unstable_cache` | a few MB |

### 1.1 What we do not use, and why

- **Redis (self-hosted or Upstash).** One box, one Next process. An in-process LRU is faster than
  a network hop, and self-hosting Redis costs RAM we do not have. Upstash's free tier limits
  commands per month, which a per-request lookup would use up. **Revisit only if** L2 grows past
  a few MB or we run more than one Next process. Next's `cacheHandler` option can then move the
  Data Cache to Upstash without changing any calling code.
- **Cloudflare.** The domain is an institutional subdomain, so we cannot move its nameservers.
  CloudFront works with the `*.cloudfront.net` domain it gives us, with no DNS change.
- **A CDN in front of HTML or `/api`.** Both depend on the session cookie. Caching them at a
  shared layer risks serving one user's data to another.
- **React Query / SWR, service worker caching.** Server components pass data down as props, so
  a client data cache adds little. Service workers wait for the PWA blueprint.
- **`next/image` optimisation.** Stays off (`images.unoptimized: true`). Transcoding images would
  burn the shared CPU. Cloudinary does it instead.

---

## 2. Where does my data go?

Answer these in order. Stop at the first match.

| Question | If yes |
|---|---|
| Is it an image? | Cloudinary, with `getOptimizedImageUrl()`. Never `/public` for anything over about 100 KB. |
| Is it live (scores, auction)? | SSE. No caching. See [realtime.md](./realtime.md). |
| Does the response contain anything about the viewer (email, id, "applied", "tracked", prefs)? | **No server cache.** Send `CACHE_CONTROL.private` or `privateShort`. |
| Is it the same for every user, and can the number of cache keys be counted on one hand (or bounded by a Strapi entity count, like one per form)? | L2 via `sharedCache`, with a tag. |
| Is it a small lookup that never changes (email to id)? | L1 via `createLru`, with a `max`. |
| Is it called several times in one render? | `React.cache()`. |
| None of the above | Do not cache it. Make the query cheaper instead (section 4). |

A response that mixes shared and per-user data gets **split**: cache the shared part in L2,
fetch the per-user part fresh, combine them in the handler, and send the result as `private`.

---

## 3. The toolkit

Everything below exists already. Use it rather than writing a new cache.

### 3.1 L1: `createLru` (`src/lib/cache/memory.ts`)

```ts
import { createLru } from '@/lib/cache/memory'

// Comment the size estimate. `max` is required and must be small.
const cache = createLru<number>(2000, 24 * 60 * 60 * 1000)
```

For ids, flags and short strings. Not for API payloads. `getUserIdByEmail` (`src/lib/userid.ts`)
already uses one.

For the signed-in user's own id, you do not need a lookup at all:
`(await getAuthenticatedUser())?.uid` reads it from the session.

### 3.2 Per-request dedupe: `React.cache`

`getAuthenticatedUser()` (`src/lib/auth.ts`) is wrapped in `React.cache`, so layout, page and
components share one session read per request. Wrap any other function that several server
components call in the same render:

```ts
import { cache } from 'react'
export const getThing = cache(async (id: number) => { /* strapiGet... */ })
```

It costs nothing: the entry is dropped when the request ends.

### 3.3 L2: `sharedCache` + tags (`src/lib/cache/shared.ts`, `src/lib/cache/tags.ts`)

```ts
import { sharedCache } from '@/lib/cache/shared'
import { CACHE_TAGS } from '@/lib/cache/tags'

// Key cardinality: 1 (no arguments).
export const getAdverts = sharedCache(
  async () => { /* strapiGet('/advertisements', ...) */ },
  ['adverts-v1'],
  { tags: [CACHE_TAGS.adverts], revalidate: 86400 },
)
```

- Every argument value becomes its own cache file. Arguments may only be a Strapi id from a
  small set. **Never** an email, user id, search string or date.
- Every call needs a comment stating its key cardinality.
- Bump the key suffix (`-v1` to `-v2`) when the return shape changes.
- The return value must be JSON-serialisable.
- To add a global tag, add it to `CACHE_TAGS`, then map the Strapi model to it in
  `STRAPI_MODEL_TAGS`.

**Invalidation:** tags, not short TTLs. Two ways a tag gets cleared:

1. **Our own writes.** The handler that writes to Strapi calls `revalidateTag(tag)` right after.
   `src/lib/forms/strapi-forms.ts` is the reference.
2. **Edits made in the Strapi admin.** Strapi calls `POST /api/revalidate`
   (`src/app/api/revalidate/route.ts`), which clears the tags mapped to that model.
   Setup in Strapi: Settings → Webhooks, URL `<site>/api/revalidate`, header
   `Authorization: Bearer <WEBHOOK_SECRET_TOKEN>`, events create/update/delete/publish/unpublish.
   The route rejects every call if `WEBHOOK_SECRET_TOKEN` is not set.

Because tags clear the entry when data changes, `revalidate` is only a backstop. Use hours, not
seconds.

### 3.4 Browser: `CACHE_CONTROL` presets (`src/lib/cache/headers.ts`)

```ts
import { withCacheControl } from '@/lib/cache/headers'
return withCacheControl(NextResponse.json({ success: true, data }), 'private')
```

| Preset | Header | Use for |
|---|---|---|
| `private` | `private, no-store` | Per-user data that must be fresh |
| `privateShort` | `private, max-age=60, stale-while-revalidate=300` | Per-user data that can be a minute old (prefs, profile) |
| `shared` | `public, max-age=300, stale-while-revalidate=3600` | Bodies identical for every user. No user fields at all. |

Set by `next.config.ts`, no code needed:

- `/public` images and fonts: `public, max-age=604800, stale-while-revalidate=86400`. **Rename a
  file when you replace it**, or browsers keep the old one for a week.
- `/_next/static/*`: Next sets `immutable`, one year, on its own.

### 3.5 Images: Cloudinary

Always go through `getOptimizedImageUrl()` (`src/lib/apis/cloudinary-url.ts`) with a width that
matches how big the image renders:

```ts
getOptimizedImageUrl(org.banner, { width: 800 })   // adds w_800,c_fill,q_auto:good,f_auto
```

A raw Cloudinary URL serves the original upload, often several MB, and uses up our free-tier
bandwidth. New static images go to Cloudinary, not `/public`. Full guide:
`src/lib/apis/CLOUDINARY-API-GUIDE.md`.

### 3.6 Config (`next.config.ts`)

| Setting | Value | Why |
|---|---|---|
| `cacheMaxMemorySize` | 10 MB | Next keeps an in-memory copy of the Data Cache, 50 MB by default. L2 is tiny, so 10 MB is plenty. |
| `assetPrefix` | `ASSET_PREFIX` env var | CloudFront domain for `/_next/static`. Read at build time. Unset means EC2 serves it. |
| `headers()` | `/public` asset rule | See 3.4. |

`src/middleware.ts` skips `/public` assets by file extension in its matcher, so `auth()` never
runs for an image or font.

---

## 4. Fixing a page: the recipe

We fix pages one at a time. For each page, go through this list.

### 4.1 Replace self-fetches with direct calls

Server components that `fetch()` our own `/api/...` with a forwarded cookie do 3 to 5 times the
work (HTTP to ourselves, middleware, `auth()` twice, JSON twice). Move the route handler's body
into a function in `src/lib/<feature>/`, then call it from both places:

```ts
// src/lib/<feature>/data.ts
export async function getThingsForUser(uid: number) { /* strapiGet... */ }

// route.ts: the client still needs the route
const user = await getAuthenticatedUser()
if (!user?.uid) return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 })
return withCacheControl(NextResponse.json({ success: true, data: await getThingsForUser(user.uid) }), 'private')

// page.tsx: no fetch, no cookies(), no BASE_URL
const user = await getAuthenticatedUser()
const things = user?.uid ? await getThingsForUser(user.uid) : []
```

If a self-fetch has to stay for now, it **must not** have `next: { revalidate }` or
`force-cache`. With a Cookie header, that is the 3 to 5 GB bug from 0.2.

### 4.2 Split shared from per-user

If a handler returns a global list plus the viewer's fields (`userEmail`, `userId`, tracked ids),
cache the global list with `sharedCache` and fetch the viewer's part fresh. The response is then
`private`.

### 4.3 Count, don't download

To get a total, ask Strapi for one row and read `meta.pagination.total`:

```ts
const res = await strapiGet('/pools', { pagination: { pageSize: 1 }, fields: ['id'] })
const total = res?.meta?.pagination?.total ?? 0
```

`/users` (users-permissions) returns a bare array with no `meta`. Use `strapiGet('/users/count')`.

### 4.4 Ask Strapi for less

- No `populate: '*'` in anything that reaches the browser.
- `fields: [...]` on every populate, listing only what the UI renders.
- Relation arrays that the UI only counts: fetch the count, not the rows.
- Never send other users' emails to the browser unless the UI shows them to someone allowed to
  see them.

### 4.5 Client-side fetches

- No `setInterval` polling. Live data uses SSE.
- `cache: 'no-store'` needs a comment saying why the data cannot be a minute old.

### 4.6 Done means

- [ ] No self-fetch, or the remaining one has no `revalidate`
- [ ] Each route the page uses sends a `CACHE_CONTROL` preset
- [ ] Shared data goes through `sharedCache` with a tag, and the writes that change it clear the tag
- [ ] Images go through `getOptimizedImageUrl`
- [ ] No `populate: '*'`, and populates list their `fields`
- [ ] `npm run typecheck` passes

---

## 5. Page tracker

Update this table as pages are fixed.

### 5.1 Pages that fetch our own API from the server

| Page | Known issues | Status |
|---|---|---|
| `platform/inductions/page.tsx` | Catalogue fetch has cookie **and** `revalidate: 30` (the disk bug) | todo |
| `platform/organisations-catalog/page.tsx` | Catalogue fetch has cookie **and** `revalidate: 43200` (the disk bug) | todo |
| `platform/events-calendar/page.tsx` | Three self-fetches in one render | todo |
| `platform/page.tsx` | Self-fetch | todo |
| `platform/semester-planner/page.tsx` | Self-fetch | todo |
| `platform/cgpa-planner/page.tsx` | Self-fetch | todo |
| `platform/course-reviews/layout.tsx`, `page.tsx` | Self-fetch; course list is a `courses` L2 candidate | todo |
| `platform/borrow-assets/page.tsx` | Self-fetch | todo |
| `platform/sg-compose/outbox/page.tsx` | Self-fetch | todo |
| `platform/when2meet/page.tsx`, `[uid]/page.tsx` | Self-fetch; routes use `populate: '*'` | todo |
| `organisations/ads/page.tsx` | Self-fetch | todo |
| `organisations/profile/page.tsx` | Self-fetch | todo |
| `organisations/forms/**`, `organisations/inductions/forms/**` | Self-fetch | todo |

### 5.2 Routes and libraries

| File | Known issues | Status |
|---|---|---|
| `api/platform/organisations-catalogue/route.ts` | Sends `public, s-maxage=43200` on a body containing `userEmail` and `userId`. Populates members and interested applicants (other users' emails) for the browser. Module-level cache variable instead of `sharedCache`. | todo, **do first** |
| `lib/metrics/platform-metrics.ts` | Downloads up to 10,000 rows from each of 4 tables to count them (4.3) | todo |
| `lib/inductions/strapi-inductions.ts` | Tagged, but `revalidate: 15`. Writes already clear the tags, so raise it to hours. | todo |
| `lib/admin/strapi-admin.ts` | Same, `revalidate: 30` | todo |
| `api/platform/games/wordle/leaderboard/route.ts` | `unstable_cache` with no tag | todo |
| `api/platform/profile`, `borrow-assets/[id]`, `sports/aba/teams`, `when2meet` routes | `populate: '*'` | todo |
| Images across the app | Only `components/landing-page/platform-carousel.tsx` uses `getOptimizedImageUrl` | todo |
| `/public` PNGs | `orgs_catalogue_default.png` 2.5 MB, mascots about 4 MB total. Move to Cloudinary. | todo |

### 5.3 Global pieces (done)

| Change | Where |
|---|---|
| `createLru`, `sharedCache`, `CACHE_TAGS`, `CACHE_CONTROL` | `src/lib/cache/` |
| `getUserIdByEmail` cached in L1 | `src/lib/userid.ts` |
| `getAuthenticatedUser` deduped per request | `src/lib/auth.ts` |
| Strapi revalidate webhook | `src/app/api/revalidate/route.ts` |
| Middleware skips static assets | `src/middleware.ts` |
| `/public` cache headers, `cacheMaxMemorySize`, `assetPrefix` | `next.config.ts` |
| Strapi URL logging moved to `platform.log` (was writing every URL to pm2 logs) | `src/lib/apis/strapi.ts` |

---

## 6. CloudFront for built assets

Serves `/_next/static` (JS, CSS, fonts) from CloudFront so those bytes stop leaving EC2. HTML and
`/api` still go straight to EC2. No DNS change is needed.

1. AWS console → CloudFront → Create distribution.
   - Origin domain: the platform's subdomain. Protocol: HTTPS only.
   - Default cache behaviour: cache policy `CachingOptimized`, viewer protocol "Redirect HTTP
     to HTTPS", allowed methods GET and HEAD.
   - Response headers policy: `SimpleCORS`. Fonts load cross-origin from the CloudFront domain
     and are blocked without `Access-Control-Allow-Origin`.
2. Copy the distribution domain (`dxxxx.cloudfront.net`).
3. Set `ASSET_PREFIX=https://dxxxx.cloudfront.net` in the environment the build runs in, then
   rebuild. It is read at build time, so setting it at runtime does nothing.
4. Check: in the page source, `<script src>` points at CloudFront, and a response header on one
   of those files reads `x-cache: Hit from cloudfront` on the second load.

Cost: CloudFront's always-free tier covers 1 TB out and 10 million requests a month, and
EC2 to CloudFront transfer is free. Confirm the current terms in the AWS console before relying
on them.

---

## 7. Keeping the box healthy

### 7.1 After every deploy

```bash
du -sh .next/cache/fetch-cache
find .next/cache/fetch-cache -type f | wc -l
```

Over 100 files means a per-user or per-query key has leaked into L2. Find the key and fix it.
Clearing the folder only hides the problem until it fills up again.

One time, after the two cookie fetches in 5.1 are fixed: `rm -rf .next/cache/fetch-cache` on
the server.

### 7.2 Server housekeeping

These are not caching, but they protect the same RAM and disk.

- **pm2 log rotation.** Unrotated logs fill disks quietly.
  ```bash
  pm2 install pm2-logrotate
  pm2 set pm2-logrotate:max_size 10M
  pm2 set pm2-logrotate:retain 7
  pm2 set pm2-logrotate:compress true
  ```
- **Memory ceiling** so one process cannot take the box down:
  `pm2 start next-platform --max-memory-restart 1200M`.
- **Check compression reaches the browser:**
  `curl -sI -H 'Accept-Encoding: br,gzip' https://<site>/platform | grep -i content-encoding`.
  If nginx sits in front, make sure it is not stripping it.
- **Later, needs a deploy change:** build in CI instead of on the box (the webpack cache is about
  1.1 GB), and `output: 'standalone'` to shrink `node_modules` on the server. Both change how pm2
  starts the app, so plan them separately.

---

## 8. Rules

1. **No `next: { revalidate }` or `force-cache` on a fetch that sends a Cookie header.** This is
   the 3 to 5 GB bug.
2. **Per-user data is never cached on the server.** Not in L1, not in L2. The browser caches it.
3. **L2 keys come from a small, countable set,** and every `sharedCache` / `unstable_cache` call
   has a tag and a comment stating its key cardinality.
4. **Every `createLru` has a small `max`,** and holds small values, not payloads.
5. **Invalidate by tag when data changes.** TTLs are a backstop measured in hours.
6. **A response containing viewer data is never `public`.**
7. **No server component fetches our own route handler.** Call the function.
8. **No `populate: '*'`** in anything that reaches the browser.
9. **Images go through Cloudinary transforms.** Nothing over about 100 KB in `/public`.
10. **No `cache: 'no-store'` without a comment** saying why.
11. Every caching change states what it improves: bill, speed, RAM or disk. If none, don't merge it.
