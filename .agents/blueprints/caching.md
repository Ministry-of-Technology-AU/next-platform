# Caching & Efficiency Blueprint

> Realtime/SSE has its own blueprint: [realtime.md](./realtime.md) — that is where the bill spikes come from.

Target box: AWS t3a.medium — 2 vCPU, 4 GB RAM, 16 GB gp3.
Co-tenants: `sg-website` (EJS), `sg-strapi` (Strapi 4 + SQLite), `next-platform` (Next 15), `events-cal` (Python).

---

## 0. Read this before designing anything

### 0.1 The money and the latency are two different problems

The ₹700/month is almost certainly **EC2 data-transfer-out to the internet**. At AWS Mumbai
rates (~$0.09/GB ≈ ₹8/GB after the free tier) that is roughly **85–90 GB/month leaving the box
toward browsers**.

Critical consequence:

> Next ⟷ Strapi traffic travels over `localhost` / the VPC. **It is free.**
> Caching Strapi responses on the server makes pages faster and takes load off SQLite.
> It does **not** reduce the bill.

The bill is reduced by exactly three things:

1. Fewer bytes per response to the browser (payload trimming, compression).
2. Fewer requests from the browser (client cache, HTTP cache headers, no polling).
3. Somebody else serving the bytes (CDN in front, Cloudinary for media).

The **latency and RAM** problem is reduced by server-side caching (L1/L2).
Keep the two goals separate when prioritising — a change that only helps one should be
judged on that one.

### 0.2 The disk is the thing that will actually take the site down

Current: 13 G used / 16 G. ~3.2 G free. Local `.next` here is **1.3 G** — of which
`.next/cache/webpack` is **1.1 G** and `.next/cache/fetch-cache` is **12 M**.

`fetch-cache` is Next's Data Cache. It is **on disk** and it grows with the
**cardinality of the cache keys**, not with the number of requests. This is precisely the
failure mode from the inductions pipeline: cache keys that vary per user / per query /
per timestamp → one file per key → unbounded directory → disk full.

**Hard rule for this repo:**

| Data shape | Where it may be cached |
|---|---|
| Global, low cardinality (< ~200 distinct keys), shared by all users | Disk Data Cache (L2) OK |
| Per-user, per-query, per-date, or anything with unbounded key space | **In-memory only (L1), bounded LRU.** Never the disk cache. |

Violating this is what fills the disk. It is not a tuning problem, it is a design rule.

---

## 1. Findings — what is actually costing us

Ordered by impact.

### F1. Dashboard metrics pulls ~40,000 records to compute 4 integers

`src/app/api/platform/landing-page/metrics/route.ts`

```ts
const usersResponse = await strapiGet('/users', { pagination: { pageSize: 10000 } });
const totalUsers = usersResponse.length || 0;
// ...same for /services, /pools, /reviews
```

Four serial Strapi calls, `pageSize: 10000` each, full row bodies, and the only thing used
is `.length`. Fired from `dashboard-stats.tsx` on mount with `cache: 'no-store'`, on the
**landing page** — i.e. every user, every session, sometimes several times.

Cost: SQLite full table scans ×4, tens of MB of JSON through Node's heap (this is a prime
suspect for the RAM spikes), serial round-trips before anything paints.

### F2. Server Components fetch our own API routes over HTTP

10 files do this. Pattern:

```ts
const cookieStore = await cookies();
const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/platform/...`, {
  cache: 'no-store',
  headers: { 'Cookie': cookieStore.toString() },
});
```

Files: `platform/page.tsx`, `organisations-catalog/page.tsx`, `events-calendar/page.tsx`
(×3 in one render), `semester-planner/page.tsx`, `cgpa-planner/page.tsx`,
`sg-compose/outbox/page.tsx`, `when2meet/page.tsx`, `when2meet/[uid]/page.tsx`,
`organisations/ads/page.tsx`, `organisations/profile/page.tsx`.

Each one costs, **per page render**: a full TCP+HTTP round trip to ourselves → middleware →
`auth()` JWT decode again → route handler → `auth()` a third time → `getUserIdByEmail`
(another Strapi call) → the real Strapi call. Plus JSON serialise/parse twice.

This is 3–5× the necessary work and it is uncacheable by construction, because `no-store`
plus a `Cookie` header means nothing can ever be reused.

### F3. `getUserIdByEmail` — one extra Strapi query on every authenticated request

`src/lib/userid.ts`, used in **33 files**. It resolves email → Strapi user id via a
filtered `/users` query. The mapping is **immutable for the lifetime of the account**.
It is currently re-queried on every single API call.

### F4. Everything is `cache: 'no-store'`, and axios bypasses the cache anyway

126 `fetch(` calls under `src/app/platform`, the overwhelming majority `no-store`.
Separately, `src/lib/apis/strapi.ts` uses **axios**, which does not participate in Next's
fetch cache at all — so even if the `no-store` were removed, server-side Strapi calls would
still never be cached. Total cache usage in the repo today: `unstable_cache` in exactly one
file (`games/wordle/leaderboard/route.ts`) plus one `revalidate: 60`.

### F5. Images are unoptimised and enormous

`next.config.ts` has `images: { unoptimized: true }`.

| File | Size |
|---|---|
| `public/orgs_catalogue_default.png` | 2.5 M |
| `public/mascot-football-happy.png` | 1.7 M |
| `public/mascot.png` | 750 K |
| `public/mascot-construction.png` | 694 K |
| `public/mascot-not-found.png` | 334 K |

`orgs_catalogue_default.png` is the **fallback banner on the org catalogue** — it can render
many times per page. 2.5 MB of PNG, uncompressed, straight out of EC2 egress. 1,000 loads
= 2.5 GB = ~₹20, for one placeholder image.

### F6. Middleware runs on nearly every request including static assets

`src/middleware.ts` matcher ends with `'/((?!api/auth|_next/static|_next/image|favicon.ico|login|$).*)'`.
`/public` files are **not** excluded, so `/mascot.png` runs the `auth()` wrapper (JWT decode)
before hitting the `pathname.endsWith('png')` early-return inside the handler. The check is
too late — the cost is already paid.

### F7. Over-populated Strapi queries

`api/platform/organisations-catalogue/route.ts` populates `circle1_humans`, `circle2_humans`,
`members`, `interested_applicants` at `pageSize: 1000`, then ships the lot to the browser as
the initial props of `CataloguePage`. Most of those relation arrays are never rendered.
Also 8 uses of `populate=*` across the codebase.

---

## 2. The cache tiers

### L1 — In-process memory (Node heap), bounded LRU

**For:** hot, small, high-cardinality-tolerant values. Per-user data. Anything derived.
**Not for:** anything large enough to matter against a 4 GB box.

Zero disk. Zero network. Dies on redeploy, which is correct and desirable.
Use `React.cache()` for **per-request** dedup (free, no eviction needed), and a bounded
LRU for **cross-request** TTL caching.

```ts
// src/lib/cache/memory.ts
type Entry<T> = { value: T; expires: number }

export function createLru<T>(max: number, ttlMs: number) {
  const map = new Map<string, Entry<T>>()
  return {
    get(key: string): T | undefined {
      const hit = map.get(key)
      if (!hit) return undefined
      if (Date.now() > hit.expires) { map.delete(key); return undefined }
      map.delete(key); map.set(key, hit)          // LRU touch
      return hit.value
    },
    set(key: string, value: T) {
      if (map.has(key)) map.delete(key)
      else if (map.size >= max) {
        const oldest = map.keys().next().value    // insertion order = LRU order
        if (oldest !== undefined) map.delete(oldest)
      }
      map.set(key, { value, expires: Date.now() + ttlMs })
    },
    delete(key: string) { map.delete(key) },
    clear() { map.clear() },
    get size() { return map.size },
  }
}
```

`max` is the safety valve the inductions pipeline did not have. It must always be set.

**Budget:** total L1 across the process ≤ **150 MB**. Track it. `next-platform` sits at
37 MB RSS idle; 150 MB of cache is affordable against 4 GB shared with Strapi and Python,
and it is bounded by construction.

### L2 — Next Data Cache (disk, `.next/cache/fetch-cache`)

**For:** global, low-cardinality, shared-by-everyone data. Org list. Advertisements.
Tool catalogue. Platform metrics. Course catalogue.
**Never for:** per-user data, per-query-string data, per-date data.

Use `unstable_cache` with **explicit `tags`**, and invalidate with `revalidateTag` from the
Strapi webhook — do not rely on short TTLs. TTL-only caching means we re-fetch on a timer
whether or not anything changed; tags mean we re-fetch only when it changed.

Every `unstable_cache` call in this repo must justify its key cardinality in a comment.

### L3 — HTTP / edge

**This is the tier that touches the ₹700.** Two parts.

**L3a — Cache headers on our own responses.** Currently we send none, so every browser
re-downloads everything every navigation.

| Response class | Header |
|---|---|
| `_next/static/*` (hashed, immutable) | `public, max-age=31536000, immutable` |
| `/public` images, fonts | `public, max-age=604800, stale-while-revalidate=86400` |
| Public API (metrics, adverts, org list) | `public, s-maxage=300, stale-while-revalidate=600` |
| Per-user API | `private, no-store` — correct, leave alone |

`stale-while-revalidate` is the important one: the browser shows the stale copy instantly
(0 bytes, 0 latency) and refreshes in the background. Latency down **and** bytes down, at
the same time.

**L3b — Cloudflare free tier in front of the domain.** `_next/static` alone is 49 MB of
immutable hashed assets. Put a CDN in front and those bytes stop leaving EC2 almost
entirely. Cloudflare's free plan also gives Brotli and image resizing on the paid tier.
This is the single largest lever on the bill and it costs ₹0.

---

## 3. The plan

### Phase 1 — Stop the bleeding (no caching yet, pure waste removal)

These are the highest ratio of benefit to risk. Do them first; several of them make the
caching in Phase 2 simpler.

**1.1 Rewrite the metrics route to count, not to download.** (F1)

Strapi returns `meta.pagination.total`. Ask for one row and read the count:

```ts
const q = { pagination: { pageSize: 1 }, fields: ['id'] }
const [users, services, pools, reviews] = await Promise.all([
  strapiGet('/users/count'), // or /users?pagination[pageSize]=1 and read meta
  strapiGet('/services', q),
  strapiGet('/pools', q),
  strapiGet('/reviews', q),
])
```

Serial → parallel, and ~40,000 rows → 4. Then wrap in L2 with a 15-minute revalidate —
it is a global counter, nobody needs it to the second.
*Expected: landing page TTFB down sharply, one whole class of RAM spike gone.*

**1.2 Delete the self-fetch pattern.** (F2)

Extract each route handler's body into a plain async function in `src/lib/data/`, then:

- the Route Handler calls it (keep the route — the client still needs it),
- the Server Component calls the **same function directly**, no HTTP, no cookie forwarding.

```ts
// src/lib/data/organisations.ts
export async function getOrganisationsForUser(email: string) { /* ...strapi... */ }

// route.ts
export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({...}, { status: 401 })
  return NextResponse.json(await getOrganisationsForUser(session.user.email))
}

// page.tsx  — no fetch, no cookies(), no BASE_URL
const session = await auth()
const orgs = session?.user?.email ? await getOrganisationsForUser(session.user.email) : []
```

Start with `events-calendar/page.tsx` — it does this **three times in one render**, so it
removes 3 round trips, 3 middleware passes and 3 redundant `auth()` calls in one edit.

**1.3 Compress the images.** (F5)

```bash
cwebp -q 80 public/orgs_catalogue_default.png -o public/orgs_catalogue_default.webp
```

2.5 MB → roughly 100–200 KB. Do all five. Either drop `images: { unoptimized: true }` so
`next/image` does it for us, or — better on a 2 vCPU box where we do **not** want Next
burning CPU on image transcoding — move these to **Cloudinary**, which we already have
wired up in `src/lib/apis/cloudinary.ts`. Cloudinary serves the bytes; our egress goes to
zero for media.
*This is real, immediate rupees.*

**1.4 Exclude static paths from middleware.** (F6)

Move the extension check out of the handler and into the matcher:

```ts
export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login|$|.*\\.(?:png|jpg|jpeg|svg|ico|webp|woff2)$).*)',
  ],
}
```

Middleware then never boots for an asset. Less CPU per request across the board.

**1.5 Trim the org catalogue payload.** (F7)

Replace the four relation populates with counts, or with the 3–4 fields the UI actually
renders. Audit the 8 `populate=*` uses the same way. Smaller Strapi response, smaller Node
heap, smaller JSON to the browser — all three at once.

### Phase 2 — L1 memory cache

**2.1 `getUserIdByEmail` → L1.** (F3) Biggest win per line changed. Immutable mapping,
33 call sites, one line of cache.

```ts
const userIdCache = createLru<number | null>(2000, 24 * 60 * 60 * 1000)

export async function getUserIdByEmail(email: string): Promise<number | null> {
  if (email.trim() === '') return null
  const hit = userIdCache.get(email)
  if (hit !== undefined) return hit
  // ...existing strapiGet...
  const id = users.length > 0 ? users[0].id : null
  if (id !== null) userIdCache.set(email, id)   // don't cache misses — user may be created
  return id
}
```

2,000 entries × ~50 bytes ≈ **100 KB**. Bounded. Removes one Strapi query from essentially
every authenticated request on the platform.

**2.2 `React.cache()` on per-request repeats.** `auth()` and `getUserIdByEmail` get called
multiple times within a single render (layout + page + route). `React.cache()` dedupes them
for the duration of one request at zero memory cost — the entry dies with the request.

**2.3 L1 for hot per-user reads.** Profile, preferences, sidebar access — small objects,
TTL 60–300 s, `max` 1000–2000. Invalidate on write in the same handler that does the write.

### Phase 3 — L2 disk cache, carefully

Only these, only tagged:

| Data | Tag | Revalidate |
|---|---|---|
| Advertisements (`landing-page/route.ts`) | `adverts` | 3600 s |
| Platform metrics | `metrics` | 900 s |
| Organisation list (shared fields only) | `organisations` | 600 s |
| Course catalogue / reviews aggregate | `courses` | 3600 s |

Cardinality: **one key each.** Total disk footprint: a few hundred KB. That is the point.

Wire Strapi's webhook (we already have webhook routes for APL/ABA — same pattern) to a
small `/api/revalidate` that calls `revalidateTag(...)` on publish. Then the TTLs are just
a backstop, and edits show up immediately instead of after the timer.

**Guardrail — add to deploy, non-negotiable given 3.2 G free:**

```bash
# cap the Data Cache; alert if key cardinality ever runs away
du -sh .next/cache/fetch-cache
find .next/cache/fetch-cache -type f | wc -l
```

If that file count climbs into the thousands, a per-user or per-query key has leaked into
L2. Fix the key, do not just clear the cache. Clearing it is what we kept doing on the
inductions pipeline; it treats the symptom.

### Phase 4 — L3, the bill

**4.1 Cache headers** per the table in §L3a. `Cache-Control: public, s-maxage=300,
stale-while-revalidate=600` on the public API routes; `immutable` on hashed static.

**4.2 Cloudflare free tier** in front of the domain. Biggest single reduction in EC2
egress available, at zero cost. Do this before considering anything paid.

**4.3 Verify compression.** Next compresses by default (`compress: true`), but if nginx
sits in front and re-proxies, confirm Brotli/gzip is actually reaching the browser —
`curl -sI -H 'Accept-Encoding: br,gzip' https://… | grep -i content-encoding`. A silently
disabled Brotli on JSON payloads is a 60–80 % egress regression nobody notices.

**4.4 No polling.** Currently good — the `setInterval` fetches in
`sports/apl/page.tsx`, `apl/auction/page.tsx`, `aba/page.tsx`, `aba/[id]/page.tsx` are all
commented out and SSE (`sports/apl/sse`, `sports/aba/sse`) replaced them. Keep it that way.
A 2 s poll across 200 concurrent users is ~6 M requests/day; SSE is one connection each.

> On SSE vs WebSockets: for one-way score updates SSE is the right call and is already
> working — do not migrate. WebSockets only earn their keep if we need client→server
> streaming. Each open SSE connection holds a `keepAlive` interval and a Node stream; at a
> few hundred concurrent that is fine on 4 GB, but it should be watched, and the keepalive
> interval should be as long as intermediaries tolerate (~30 s), not shorter.

### Phase 5 — Storage and build

This is the disk-full problem, independent of caching.

**5.1 Do not build on the server.** 6–8 minute builds on 2 shared vCPUs, and
`.next/cache/webpack` reaches **1.1 GB**. Build in CI (GitHub Actions, free for this),
ship the artefact, `pm2 reload`. Removes the RAM spike, the 8-minute window, and the
webpack cache from the box entirely.

**5.2 `output: 'standalone'`** in `next.config.ts`. Next traces only the modules actually
imported — `node_modules` on the server drops from ~957 MB to typically 100–200 MB.
**Expect to recover several GB.** Biggest single storage win available.

**5.3 pm2 log rotation.** `events-cal` has restarted **261 times** and `next-platform`
**156 times**. That is a lot of accumulated log, and unrotated pm2 logs are a classic
silent disk filler:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

Also worth asking **why** 261 restarts — a crash-looping Python process is burning CPU and
RAM that the Next app needs.

**5.4 Memory ceilings in pm2** so one process cannot take the box down:

```bash
pm2 start next-platform --max-memory-restart 1200M
```

**5.5 Housekeeping:** `npm cache clean --force`, `sudo apt autoremove`,
`sudo journalctl --vacuum-time=7d`, drop `.next/cache/webpack` after each deploy.

**5.6 Move the website to Vercel** — agreed, but note it is worth ~66 MB RAM, not much
else. Do it for the deployment convenience and the egress moving off EC2, not for the RAM.

---

## 4. Ordering

| # | Change | Bill | Latency | RAM | Disk | Effort |
|---|---|---|---|---|---|---|
| 1 | Metrics route: count not download (1.1) | – | ●●● | ●●● | – | S |
| 2 | Compress/offload images (1.3) | ●●● | ●● | – | – | S |
| 3 | `getUserIdByEmail` → L1 (2.1) | – | ●●● | ● | – | S |
| 4 | `output: 'standalone'` (5.2) | – | – | ● | ●●● | S |
| 5 | pm2 logrotate + mem ceilings (5.3/5.4) | – | – | ●● | ●● | S |
| 6 | Cloudflare in front (4.2) | ●●● | ●●● | ● | – | S |
| 7 | Kill self-fetch pattern (1.2) | – | ●●● | ●● | – | M |
| 8 | Cache headers (4.1) | ●● | ●● | – | – | M |
| 9 | Build in CI (5.1) | – | – | ●●● | ●●● | M |
| 10 | L2 tagged cache + webhook (Phase 3) | ● | ●● | ● | ⚠ | M |
| 11 | Trim payloads / populates (1.5) | ●● | ●● | ●● | – | M |

⚠ = the one that needs the cardinality guardrail.

Items 1–6 are small, independent, and land most of the benefit. Do them before anything
architectural.

---

## 5. Rules to keep this from regressing

1. **No `cache: 'no-store'` without a comment** saying why the data cannot be stale.
2. **No Server Component fetching our own route handler.** Call the function.
3. **Per-user data never enters the disk cache.** L1 only, bounded.
4. **Every `createLru` has a `max`.** No exceptions — this is the inductions bug.
5. **Every `unstable_cache` has a tag** and a comment stating its key cardinality.
6. **Invalidate by tag on write**, not by short TTL.
7. **Never `populate=*`** in a route that returns to the browser.
8. Before merging a caching change, state which of the three it improves — bill, latency,
   or RAM. If the answer is "none, but it felt right", do not merge it.
