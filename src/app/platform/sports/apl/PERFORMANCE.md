# APL — Performance & Network Cost Issues

**Status: diagnosed, not fixed.** This is a work list. Nothing here has been applied.

Background and the general design rules live in
[`.agents/blueprints/realtime.md`](../../../../../.agents/blueprints/realtime.md).
This file is only about APL's own code.

**Why this matters:** months with APL live tooling running billed **₹2,500 and ₹6,000**
against a **₹700** baseline. The cause is measured below. It is not the SSE stream.

---

## The measurements

Resource Timing, `/platform/sports/apl`, one page load, production:

| Endpoint | Wire | Compressed? |
|---|---:|---|
| `/api/platform/sports/apl/participants?limit=500` | **5,570 KB** | **no** |
| `/api/platform/sports/apl/matches` | 140 KB | **no** |
| `/api/platform/sports/apl/teams` | 35 KB | **no** |
| **one `fetchData()`** | **5,745 KB ≈ 5.6 MB** | |

A second reading on the same session caught a live SSE event:

| Endpoint | hits | wire |
|---|---:|---:|
| `/apl-matches` | 1 | 140 KB |
| `/apl-teams` | 1 | 35 KB |
| `/apl-participants` | **2** | **11,140 KB** |

Only participants doubled. A remount or a StrictMode double-invoke would have run
`fetchData()` and bumped all three, so this was a real `model: 'apl-participants'` event.

> **One participant edit in Strapi cost one idle browser 5.4 MB.**
> At 300 concurrent viewers, that single edit is ~1.63 GB ≈ ₹13.

---

## P1 — `populate[user]=profile_url` is malformed, and populates the whole user

**Files:** `src/app/api/platform/sports/apl/participants/route.ts:26`,
`src/app/api/platform/sports/apl/auction-results/route.ts:36`

```ts
'populate[user]=profile_url',   // not valid Strapi v4 field-selection syntax
```

Field selection on a populated relation is `populate[user][fields][0]=profile_url`.
Given a bare string, Strapi treats the key as truthy and **populates the entire user
object** — email, username, provider, `batch`, `confirmed`, `blocked`, timestamps, and every
other column on the collection. That is 500 complete user records, in order to render an
avatar URL.

**Fix**

```ts
'populate[user][fields][0]=profile_url',
```

## P2 — team + logo is inlined into all 500 participant rows

**Files:** same two routes, plus `matches/route.ts:170-171`

```ts
'populate[team][populate][0]=logo',                 // participants + auction-results
'populate[team_a][populate][0]=logo'                // matches
'populate[team_b][populate][0]=logo'                // matches
```

A Strapi v4 media object carries `formats.thumbnail / small / medium / large`, each with
url, hash, ext, mime, size, width, height. With ~20 teams spread across 500 participants,
**each team object and its logo is serialised ~25 times.**

This is pure duplication: **the client already fetches `/apl-teams` separately** (35 KB, the
authoritative copy) and can join on team id.

**Fix** — return the id, join client-side:

```ts
const query = [
  'fields[0]=name', 'fields[1]=tier', 'fields[2]=sold_at', 'fields[3]=position',
  'populate[team][fields][0]=id',
  'populate[user][fields][0]=profile_url',
  `pagination[limit]=${limit}`,
  'sort[0]=tier:asc',
  'sort[1]=name:asc',
].join('&');
```

⚠️ Audit `fields[]` against what `page.tsx`, `players`, `roster`, `auction` and `admin`
actually render before trimming — several read `attributes.isCM`, `attributes.order` and
others. Do not guess the field list; grep each consumer first.

**P1 + P2 together: ~5,570 KB → ~150 KB.**

## P3 — nothing is compressed

`content-encoding` is absent on every APL JSON response. nginx's default `gzip_types` is
`text/html` only, so `application/json` goes out raw. JSON compresses ~85 %.

**Fix** — nginx, not this repo:

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_min_length 1024;
gzip_types application/json application/javascript text/css text/plain image/svg+xml;
```

Applies to the whole platform, not just APL. Cheapest fix available — a config file.

## P4 — the SSE event says "something changed", not "what changed"

**File:** `src/app/api/platform/sports/apl/webhook/route.ts:35`

```ts
const { model, entry, event } = payload;
aplEmitter.emit('apl-update', { model, event, entryId: entry?.id, timestamp: Date.now() });
//                             ^^^^^ `entry` — the actual changed record — is discarded
```

Every client then refetches the entire collection to discover what the webhook already knew.
This is not push; it is "notify, then everybody re-polls."

**Fix** — send the changed scalars and patch state client-side:

```ts
const VOLATILE = ['score_a', 'score_b', 'status', 'clock', 'sold_at', 'team'] as const;
const slim = entry && Object.fromEntries(
  [['id', entry.id], ...VOLATILE.filter(f => f in entry).map(f => [f, entry[f]])]
);
aplEmitter.emit('apl-update', { model, event, entryId: entry?.id, entry: slim, timestamp: Date.now() });
```

```ts
// client
if (p.model === 'apl-participants' && p.entry) {
  setRawParticipants(prev => prev.map(x =>
    String(x.id) === String(p.entry.id)
      ? { ...x, attributes: { ...x.attributes, ...p.entry } }
      : x));
  return;
}
scheduleRefetch(p.model);   // keep refetch as the fallback for create/delete
```

**~5.4 MB → ~200 B** for an update. Keep the refetch path for `entry.create` / `entry.delete`.

## P5 — `admin/page.tsx` refetches everything on every event, unfiltered

**File:** `src/app/platform/sports/apl/admin/page.tsx:119-127`

```ts
eventSource.onmessage = (event) => {
  JSON.parse(event.data);
  fetchData();                // matches + teams + participants, on ANY event
};
```

It does not even look at `model`. And it requests `participants?limit=1000` (~11 MB) and
`matches?populate=*`. The admin is the person generating the events, so this fires on every
single one of their own edits.

**Fix:** filter by `model` like `page.tsx:172` does, drop `limit` to what the UI shows, and
debounce (P7).

> Note: `admin` passes `populate=*` in the query string, but `participants/route.ts` reads
> only `limit` and builds its own populate — that parameter is a no-op. The `limit=1000` is not.

## P6 — `auction-results` throws away 99 % of what it fetches

**File:** `src/app/api/platform/sports/apl/auction-results/route.ts:34-40`

Runs the same bloated query, then **projects down to seven scalar fields** before responding.
The client only sees ~50 KB, so this costs nothing in egress — the damage is upstream:

> Per request, Node pulls **5.4 MB from Strapi, JSON-parses it, allocates it, maps it, and
> discards ~99 %.**

Strapi→Next is loopback, so it is free in rupees. But during an auction, 300 viewers on the
auction page × one bid ≈ **1.6 GB of JSON parsed and garbage-collected in a burst**, on a
4 GB box shared with Strapi and the Python pipeline.

This is the most likely explanation for the RAM spikes and the **156 `next-platform` pm2
restarts** — and restarts then trigger the reconnect herd (P9), causing more refetches.

**Fix:** P1 + P2 fix this route too. Add `fields[]` for exactly the seven fields it uses.

## P7 — no coalescing, no debounce, no scoping

One admin edit touching three fields = three webhooks = three broadcasts = three full
refetches per connected client.

**Fixes, in order:**

1. **Server-side coalescing** (best — one timer for everyone, bounds the worst case):
   buffer webhook events in a `Map` keyed by `model:entryId`, flush every 500–1000 ms,
   last write wins. See `realtime.md` §4.3.
2. **Room scoping:** `new EventSource('/api/.../sse?models=apl-matches&match=17')`, filtered
   **server-side** in `onUpdate`. Client-side filtering does not save bytes — the event was
   already sent.
3. **Client trailing debounce** (~800 ms) + dedupe on `entryId+timestamp` +
   `AbortController` to cancel superseded in-flight refetches.

## P8 — hidden tabs keep refetching forever

No `visibilityState` check on any of the nine APL `EventSource` call sites. People leave tabs
open for hours; each one refetches 5.4 MB on every event, indefinitely.

**Fix:** close the `EventSource` on `visibilitychange` → hidden, reopen + refetch once on
visible. See `realtime.md` §4.4.

## P9 — `cancel()` never runs, so connections leak

**Files:** `src/app/api/platform/sports/apl/sse/route.ts:67-73` (and the ABA copy)

```ts
(controller as any).__cleanup = cleanup;
...
cancel(controller: any) { controller?.__cleanup?.(); }
```

Per the Streams spec an underlying source's cancel is invoked as **`cancel(reason)`** — it
receives the cancellation *reason*, **not the controller**. So `cleanup()` never runs.
On every disconnect:

- `aplEmitter.off('apl-update', onUpdate)` never fires → listener attached forever
- `clearInterval(keepAlive)` never fires → a 15 s timer runs forever

Dead listeners and live timers accumulate for the life of the process. Consistent with
`setMaxListeners(1000)` being needed at all, and with the 156 restarts.

**Fix:** bind cleanup to `request.signal` (both handlers currently take no `request` arg):

```ts
export async function GET(request: Request) {
  // ...
  request.signal.addEventListener('abort', cleanup);
```

Full corrected handler in `realtime.md` §3.1. Also move keepalive 15 s → 30 s.

## P10 — no connection cap, no reconnect jitter

`setMaxListeners(1000)` raises a warning threshold; it caps nothing. And `EventSource`
retries after ~3 s, so **every client reconnects simultaneously** after a restart — each
also running `fetchData()` on mount.

**Fix:** 503 + `Retry-After` above a cap (~300), clients fall back to a slow poll; and send
`retry: 4000–8000` with jitter on connect.

---

## Work order

Independent, low-risk, do first:

- [ ] **P3** — nginx gzip. Config only, no code, helps the entire platform. *~6×*
- [ ] **P1 + P2** — fix the two populates in `participants` + `auction-results` + `matches`. *~37×*
- [ ] **P9** — SSE cleanup bug. Fixes the leak and probably the restarts.

Then:

- [ ] **P5** — model filter + lower limit on `admin`
- [ ] **P7.1** — server-side coalescing
- [ ] **P8** — visibilitychange
- [ ] **P4** — data in the event
- [ ] **P7.2 / P7.3** — room scoping, client debounce
- [ ] **P10** — cap + jitter
- [ ] ETag/304 on refetch routes as a backstop (`realtime.md` §4.6)

**P3 + P1 + P2 alone are ~190×**, and none of them touch the realtime design.
That takes an 840 GB auction evening to roughly 4.4 GB — ₹6,700 → ~₹35.

## Re-measure after each step

Paste on `/platform/sports/apl`, leave running:

```js
const tally = {};
const add = (e) => {
  if (!/\/api\/platform/.test(e.name)) return;
  const k = new URL(e.name).pathname;
  const t = (tally[k] ??= { hits: 0, wire: 0, raw: 0 });
  t.hits++; t.wire += e.transferSize; t.raw += e.decodedBodySize;
};
const show = () => console.table(Object.entries(tally).map(([url, t]) => ({
  url, hits: t.hits,
  wireKB: +(t.wire / 1024).toFixed(1),
  rawKB: +(t.raw / 1024).toFixed(1),
  perHitKB: +(t.wire / t.hits / 1024).toFixed(1),
  compressed: t.raw > 0 && t.wire < t.raw * 0.9 ? 'yes' : 'NO',
})));
performance.getEntriesByType('resource').forEach(add);
new PerformanceObserver((l) => { l.getEntries().forEach(add); show(); })
  .observe({ type: 'resource', buffered: false });
show();
```

`transferSize` is 0 for cache hits, which reads as `compressed: yes` — ignore rows with
`wireKB: 0`.

Server side, to watch the leak and the broadcast volume:

```ts
platform.log(`[APL Webhook] ${event} ${model} -> ${aplEmitter.listenerCount('apl-update')} listeners`)
```

If `listenerCount` climbs all evening and never falls as people close tabs, P9 is live.
