# Realtime (SSE) Blueprint — why it spikes the bill, and how to stop it

Companion to [caching.md](./caching.md). Read §0 there first — the split between
"what costs money" and "what costs latency/RAM" applies here too.

Observed: baseline ₹700/month. Months with live SSE tools: **₹2,500 and ₹6,000**.
At ~₹8/GB egress that is a jump from ~85 GB to ~300 GB and ~750 GB.

---

## 1. The SSE stream is not what costs money

Measure the stream itself:

| Item | Size | Frequency | Per connection per day |
|---|---|---|---|
| `: keepalive\n\n` | 14 B | every 15 s | ~80 KB |
| `data: {model,event,entryId,timestamp}\n\n` | ~90 B | per Strapi write | negligible |

500 concurrent connections held open for a month ≈ **1.2 GB**. That is ~₹10.
The stream is not the problem. Do not go looking for savings there.

## 2. What actually costs money: the refetch storm

The current design is **not push**. It is "notify, then everybody re-polls."

```
Strapi write
  → webhook  (1 request)
  → aplEmitter.emit()  broadcast to ALL N listeners
  → N clients each receive ~90 bytes
  → N clients each fire a FULL dataset refetch with cache: 'no-store'
```

`src/app/platform/sports/apl/page.tsx:172`:

```ts
if (payload?.model === 'apl-matches') { fetchMatches(); return; }
```

The event carries `entryId` — **the client throws it away and refetches the entire
collection.** One match's score changes by one goal; every viewer downloads every match.

### 2.1 The amplification terms

```
egress ≈ concurrent_clients × broadcast_events × payload_per_refetch
```

All three are currently unbounded. Term by term:

**`concurrent_clients`** — no cap. `setMaxListeners(1000)`. Eight separate pages each open
their own `EventSource` (`page`, `standings`, `[id]`, `auction`, `players`, `knockout`,
`admin`, `roster`, `matches`). Two tabs = two connections = two refetches per event.
Backgrounded tabs keep refetching forever — there is no `visibilityState` check anywhere.

**`broadcast_events`** — no coalescing, no scoping. Every Strapi write on *any* APL model
hits *every* connected client. `admin/page.tsx:122` is the worst case — it does not even
filter by model:

```ts
eventSource.onmessage = (event) => {
  JSON.parse(event.data);
  fetchData();        // refetches matches + teams + participants, every single event
};
```

**`payload_per_refetch`** — **measured**, Resource Timing on `/platform/sports/apl`,
one page load, uncompressed:

| Call | Wire | Notes |
|---|---:|---|
| `/apl-participants?limit=500` | **5,570 KB** | ~11 KB **per row** |
| `/apl-matches` (`limit=-1`) | **140 KB** | |
| `/apl-teams` | **35 KB** | |
| **one `fetchData()`** | **5,745 KB ≈ 5.6 MB** | |

And `content-encoding` is absent on all three — **nothing is compressed**.

### 2.1.1 Why a participant row is 11 KB

`src/app/api/platform/sports/apl/participants/route.ts`:

```ts
const query = [
  'populate[team][populate][0]=logo',
  'populate[user]=profile_url',      // <-- malformed
  `pagination[limit]=${limit}`,
  ...
].join('&');
```

Two separate faults, both multiplied by 500 rows:

1. **`populate[user]=profile_url` is not valid Strapi v4 field syntax.** Selecting fields on a
   populated relation is `populate[user][fields][0]=profile_url`. Given a bare string, Strapi
   treats the key as truthy and **populates the entire user object** — email, username,
   provider, `batch`, `confirmed`, `blocked`, timestamps, and whatever else the collection
   carries. 500 full user records, to render an avatar.

2. **`populate[team][populate][0]=logo` inlines the full team + full media object into every
   row.** A Strapi v4 media object carries `formats.thumbnail/small/medium/large`, each with
   url, hash, ext, mime, size, width, height. With ~20 teams across 500 participants, each
   team object and its logo is serialised **~25 times**.

Fault 2 is pure duplication: the client **already fetches `/apl-teams` separately** (35 KB,
the authoritative copy) and can join on team id. The 5.4 MB is mostly the same twenty teams
repeated, wrapped around a roster that should be a few hundred KB.

Confirm the split in ten seconds from the console:

```js
const r = await (await fetch('/api/platform/sports/apl/participants?limit=500')).json();
console.log('rows', r.data.length, '| KB/row', (JSON.stringify(r).length / r.data.length / 1024).toFixed(1));
Object.entries(r.data[0].attributes)
  .map(([k, v]) => [k, JSON.stringify(v)?.length || 0])
  .sort((a, b) => b[1] - a[1]).slice(0, 8)
  .forEach(([k, n]) => console.log(String(n).padStart(7), 'B ', k));
```

### 2.1.2 The fix

```ts
const query = [
  'fields[0]=name', 'fields[1]=tier', 'fields[2]=sold_at', 'fields[3]=position',
  'populate[team][fields][0]=id',            // id only — join to /apl-teams client-side
  'populate[user][fields][0]=profile_url',   // correct field-selection syntax
  `pagination[limit]=${limit}`,
  'sort[0]=tier:asc',
  'sort[1]=name:asc',
].join('&');
```

Audit `fields[]` against what `players`, `roster` and `auction` actually render before
trimming. `/apl-matches` has the same duplication — `populate[team_a][populate][0]=logo` and
`team_b` likewise, at `pagination[limit]=-1`; same fix, join to `/apl-teams` on id.

### 2.2 Confirmed live: one SSE event = 5.4 MB, to one client

Second measurement, same page, same session:

| url | hits | wireKB |
|---|---:|---:|
| `/apl-matches` | 1 | 140 |
| `/apl-teams` | 1 | 34.6 |
| `/apl-participants` | **2** | **11,140.9** |

Participants doubled; matches and teams did not. That asymmetry is diagnostic:

- A remount or React StrictMode double-invoke would run `fetchData()`, bumping **all three**.
- Only `apl-participants` moved, so the model-filtered branch at
  `apl/page.tsx:172` fired — i.e. **a real SSE event arrived** carrying
  `model: 'apl-participants'`, and the client refetched the whole roster.

```ts
if (payload?.model === 'apl-participants') { fetchParticipants(); return; }
```

**One participant edit in Strapi cost one idle browser 5.4 MB.**
At 300 viewers that single edit is **1.63 GB ≈ Rs 13**. Every bid. Every clock tick that
touches a participant row.

Exposure scales as `bids x viewers`, and an auction is precisely the event where both terms
peak at the same moment. It is not worth over-fitting a monthly figure to this — the point is
that the ceiling is unbounded and superlinear, and Rs 6,000 is simply what happened to be
realised on the night.

### 2.3 Two different amplifiers, one root cause

Not every APL page ships the roster to the browser. Splitting them matters, because they
fail in different ways.

**A. Egress amplifier** — raw participants sent to the browser:

| Page | Request | Approx wire |
|---|---|---:|
| `apl/page.tsx` | `participants?limit=500` | **5.4 MB** |
| `players/page.tsx` | `participants?limit=500` | **5.4 MB** |
| `roster/page.tsx` | `participants?limit=800` | **~8.9 MB** |
| `admin/page.tsx` | `participants?limit=1000` | **~11 MB**, on *every* event, unfiltered |

(`admin` also passes `populate=*`, but the route reads only `limit` from the query string
and builds its own populate — so that parameter is a no-op. The `limit=1000` is not.)

**B. Server-side amplifier** — `auction-results/route.ts`. This one is subtler and was
missed on the first pass. It runs the *same* bloated query:

```ts
'populate[team][populate][0]=logo',
'populate[user]=profile_url',
'filters[sold_at][$notNull]=true',
'pagination[limit]=-1',
```

but then **projects down to seven scalar fields** before responding, so the client sees only
~50 KB. Client egress is fine. The damage is upstream:

> Per request, Node pulls **5.4 MB from Strapi, JSON-parses it, allocates it, maps it, and
> throws ~99 % of it away.**

Strapi to Next is loopback, so it is free in rupees — but during an auction, 300 viewers on
the auction page x one bid = **~1.6 GB of JSON parsed and garbage-collected in a burst**, on
a 4 GB box shared with Strapi and the Python pipeline. This is a far better explanation for
the RAM spikes and the **156 `next-platform` restarts** than anything in caching.md, and
restarts then trigger the §4.7 reconnect herd, which triggers more refetches.

Both amplifiers are the same root cause and take the same fix (§2.1.2). Fixing the query
fixes the bill *and* the restarts.

> **Verify compression before anything else.** Every estimate above assumes gzip/Brotli is
> reaching the browser. JSON compresses ~80-85 %. If nginx is re-buffering and stripping it,
> the true figure is **6x worse** and that alone explains most of the spike.
> See [§6.1](#61-measuring-a-protected-endpoint) for how to measure this on an auth-gated
> route. Two gotchas that produce false negatives:
>
> - `curl -I` sends **HEAD**, and many servers skip compression on HEAD. Use a real GET.
> - nginx's default `gzip_types` is `text/html` **only**. HTML and JS may be compressed while
>   `application/json` is not. Always test an actual JSON endpoint, never a page or a chunk.

---

## 3. Bug: SSE connections never clean up

`apl/sse/route.ts` and `aba/sse/route.ts`, both:

```ts
start(controller) {
  ...
  (controller as any).__cleanup = cleanup;
},
cancel(controller: any) {
  controller?.__cleanup?.();
},
```

Per the Streams spec, an underlying source's `cancel` is invoked as **`cancel(reason)`** —
it receives the cancellation *reason*, **not the controller**. So `controller?.__cleanup`
is `undefined?.__cleanup` and **`cleanup()` never runs.**

Consequences, every time a client disconnects:

- `aplEmitter.off('apl-update', onUpdate)` never fires → the listener stays attached forever.
- `clearInterval(keepAlive)` never fires → a 15 s timer runs forever, per dead connection.

The `onUpdate` catch block does call `.off()`, but **only** when `controller.enqueue` throws,
and it never clears the interval. So the process accumulates dead listeners and live timers
for the lifetime of the Node process. This is consistent with `setMaxListeners(1000)` being
necessary at all, with the RAM creep, and plausibly with **`next-platform` showing 156
restarts** in pm2.

### 3.1 Fix — bind cleanup to the request's abort signal

```ts
export async function GET(request: Request) {
  const encoder = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const safeEnqueue = (chunk: string) => {
        if (closed) return;
        try { controller.enqueue(encoder.encode(chunk)); }
        catch { cleanup(); }
      };

      const onUpdate = (data: Record<string, unknown>) => {
        safeEnqueue(`data: ${JSON.stringify(normalizeAplSsePayload(data))}\n\n`);
      };

      const keepAlive = setInterval(() => safeEnqueue(': keepalive\n\n'), 30_000);

      cleanup = () => {
        if (closed) return;
        closed = true;
        aplEmitter.off('apl-update', onUpdate);
        clearInterval(keepAlive);
        try { controller.close(); } catch { /* already closed */ }
      };

      aplEmitter.on('apl-update', onUpdate);
      request.signal.addEventListener('abort', cleanup);   // ← the actual disconnect hook

      safeEnqueue('retry: 5000\n\n');      // see §4.6 on reconnect jitter
      safeEnqueue(': connected\n\n');
    },
    cancel() { cleanup(); },
  });

  return new Response(stream, { headers: { /* unchanged */ } });
}
```

Both route handlers currently take no `request` argument — add it.
Keepalive moves 15 s → 30 s; most proxies tolerate 30–60 s idle, and it halves that traffic.

---

## 4. The fixes, in order of leverage

### 4.1 Put the data *in* the event — stop refetching entirely

Highest-leverage change by far. The webhook **already receives the changed entry from
Strapi** and discards everything but the id:

```ts
const { model, entry, event } = payload;
aplEmitter.emit('apl-update', { model, event, entryId: entry?.id, timestamp: Date.now() });
//                                             ^^^^ `entry` thrown away
```

Send a trimmed entry instead, and have clients patch local state:

```ts
// webhook/route.ts
const VOLATILE_FIELDS = ['score_a', 'score_b', 'status', 'clock', 'start_time', 'match_number'] as const;

function slimEntry(model: string, entry: Record<string, unknown> | undefined) {
  if (!entry) return undefined;
  const out: Record<string, unknown> = { id: entry.id };
  for (const f of VOLATILE_FIELDS) if (f in entry) out[f] = entry[f];
  return out;
}

aplEmitter.emit('apl-update', { model, event, entryId: entry?.id, entry: slimEntry(model, entry), timestamp: Date.now() });
```

```ts
// client
eventSource.onmessage = (e) => {
  const p = JSON.parse(e.data);
  if (p.model === 'apl-matches' && p.entry) {
    setRawMatches(prev => prev.map(m =>
      String(m.id) === String(p.entry.id)
        ? { ...m, attributes: { ...m.attributes, ...p.entry } }
        : m
    ));
    return;
  }
  scheduleRefetch(p.model);   // fall back to §4.4 debounced refetch
};
```

**~300 KB refetch → ~200 B event. Roughly 1,500×** on the dominant term.
This is the difference between "notify and re-poll" and actual push.

Relations that the slim payload cannot carry (team logos, rosters) barely ever change —
fetch them **once** on mount with a long cache (§4.5). Volatile scalars travel in the event.
Always keep the refetch path as the fallback for `entry.create` / `entry.delete`, where a
patch is not enough.

### 4.2 Scope the broadcast — rooms instead of firehose

Today a viewer watching match 17 is made to refetch by an edit to match 3.

```ts
// client:  new EventSource(`/api/platform/sports/apl/sse?models=apl-matches&match=${id}`)

// route:
const { searchParams } = new URL(request.url);
const models = new Set((searchParams.get('models') ?? '').split(',').filter(Boolean));
const matchId = searchParams.get('match');

const onUpdate = (data) => {
  const n = normalizeAplSsePayload(data);
  if (models.size && !models.has(String(n.model))) return;
  if (matchId && n.model === 'apl-matches' && String(n.entryId) !== matchId) return;
  safeEnqueue(`data: ${JSON.stringify(n)}\n\n`);
};
```

Filtering server-side means the byte never leaves the box. Filtering client-side (which
`apl/page.tsx` partially does) does not save egress — the event was already sent.

`[id]/page.tsx`, `standings`, `players`, `knockout`, `matches` each care about one model or
one match. Scope every one of them.

### 4.3 Coalesce on the server — debounce once, for everyone

Server-side is the right place: one timer for all clients, rather than N client timers, and
it bounds the worst case no matter how fast Strapi fires.

```ts
// src/lib/sse/coalesce.ts
export function createCoalescer<T extends { model: string; entryId?: unknown }>(
  emit: (batch: T[]) => void,
  windowMs = 1000,
) {
  const pending = new Map<string, T>();
  let timer: NodeJS.Timeout | null = null;

  return (event: T) => {
    pending.set(`${event.model}:${String(event.entryId ?? '*')}`, event);  // last write wins per entity
    if (timer) return;
    timer = setTimeout(() => {
      const batch = [...pending.values()];
      pending.clear();
      timer = null;
      emit(batch);
    }, windowMs);
  };
}
```

An admin editing three fields on one match fires three webhooks today → three broadcasts →
three refetches per client. Coalesced: **one**. During an auction this is the difference
between thousands of broadcasts and a hard ceiling of one per second.

`windowMs` is a utility trade: 1000 ms is imperceptible for a football scoreline.
For the auction, 500 ms. Never 0.

### 4.4 Client-side: debounce, dedupe, abort, and sleep when hidden

Defense in depth for any path still refetching.

```ts
const lastSeen = useRef<string>('');
const timer = useRef<NodeJS.Timeout | null>(null);
const inflight = useRef<AbortController | null>(null);

const scheduleRefetch = (model: string, key: string) => {
  if (key === lastSeen.current) return;             // dedupe repeats
  lastSeen.current = key;
  if (timer.current) clearTimeout(timer.current);
  timer.current = setTimeout(() => {
    inflight.current?.abort();                      // cancel superseded request
    inflight.current = new AbortController();
    refetchFor(model, inflight.current.signal);
  }, 800);                                          // trailing debounce
};
```

**Pause when the tab is hidden.** People leave tabs open for hours; every one of them is
refetching on every event right now.

```ts
useEffect(() => {
  let es: EventSource | null = null;
  const open  = () => { es ??= connect(); };
  const close = () => { es?.close(); es = null; };

  const onVisibility = () => {
    if (document.visibilityState === 'visible') { open(); refetchOnce(); }  // catch up once
    else close();
  };

  onVisibility();
  document.addEventListener('visibilitychange', onVisibility);
  return () => { document.removeEventListener('visibilitychange', onVisibility); close(); };
}, []);
```

Expect this alone to remove a large fraction of `concurrent_clients` during long events.

### 4.5 Split volatile from static, and trim what is left

Even a fallback refetch should not be 300 KB.

| Data | Volatility | Treatment |
|---|---|---|
| Team names, logos, crests | ~never | fetch once on mount, `s-maxage=3600`, L2 tagged |
| Participant roster, tiers | per-auction | fetch once, `s-maxage=300` |
| Scores, status, clock | per-second | SSE event payload (§4.1) |

Concretely: drop `pagination[limit]=-1` on `/apl-matches` (bound it, and filter by status
for the live view), stop sending `populate=*&limit=1000` from `admin/page.tsx`, and request
`fields[]` explicitly instead of whole rows. Logos should be Cloudinary URLs built
client-side from an id, not Strapi media objects with four `formats` variants inlined into
every row.

### 4.6 ETag / 304 on the refetch routes

Backstop for every refetch that survives §4.1–4.5. Hash the response body; return `304` with
an empty body when `If-None-Match` matches.

```ts
const body = JSON.stringify(data);
const etag = `W/"${createHash('sha1').update(body).digest('base64url')}"`;
if (request.headers.get('if-none-match') === etag) {
  return new Response(null, { status: 304, headers: { ETag: etag, 'Cache-Control': 'no-cache' } });
}
return new Response(body, { headers: { ETag: etag, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } });
```

**300 KB → ~200 B whenever nothing actually changed for that client.** During a thundering
herd most clients are asking for data they already hold, so the hit rate here is high.
`Cache-Control: no-cache` (revalidate every time) is correct — not `no-store`, which forbids
the browser from keeping the copy that makes a 304 possible.

### 4.7 Stagger reconnects

`EventSource` retries after ~3 s by default and **every client reconnects at the same
instant** after a process restart — then each page's `useEffect` also runs `fetchData()` on
mount. With 156 restarts recorded, that herd is firing regularly, and a restart under load
can trigger the next restart.

Send an explicit retry with jitter on connect:

```ts
safeEnqueue(`retry: ${4000 + Math.floor(Math.random() * 4000)}\n\n`);   // 4–8 s spread
```

### 4.8 Cap connections and shed load

```ts
const MAX_SSE = 300;
if (aplEmitter.listenerCount('apl-update') >= MAX_SSE) {
  return new Response('Too many connections', {
    status: 503,
    headers: { 'Retry-After': '30' },
  });
}
```

Clients that get a 503 fall back to a slow poll (30–60 s). 1000 concurrent streams on a
4 GB / 2 vCPU box shared with Strapi and a Python pipeline is not a load you want to accept
silently — `setMaxListeners(1000)` currently just raises the warning threshold, it caps
nothing.

### 4.9 One connection per browser, not per tab

`BroadcastChannel` elects one leader tab to hold the `EventSource` and fans events out to
the rest. Divides both connections and refetches by the tab multiplier. Do this last — it is
the most code for the least benefit once §4.1 has landed.

---

## 5. Expected effect

Measured baseline: **5,745 KB per refetch, uncompressed.**

| Step | Change | Per refetch | Effort |
|---|---|---:|---|
| 0 | baseline today | 5,745 KB | — |
| 1 | enable gzip/Brotli (§6.1 D) | ~860 KB | config only, no code |
| 2 | fix participants + matches populate (§2.1.2) | ~30 KB | one file each |
| 3 | data in the event, no refetch (§4.1) | ~0.2 KB | moderate |

Steps 1 and 2 together are **~190x**, and neither touches the realtime design — one is an
nginx directive, the other is two query strings. That alone takes the 840 GB auction evening
to roughly **4.4 GB**, i.e. Rs 6,700 → **~Rs 35**.

Step 3 and the rest then attack the other two terms:

| Change | Term | Rough factor |
|---|---|---|
| Server coalescing (§4.3) | events | 3-10x |
| Room scoping (§4.2) | events | 2-5x |
| Pause on hidden tab (§4.4) | clients | 2-4x |
| ETag/304 (§4.6) | payload | large, on unchanged responses |
| Fix the cleanup bug (§3) | RAM / restarts | removes the leak |

Compression also applies to **every JSON response on the platform**, not just APL — it is the
single highest-value change in either blueprint, and it is a config file.

## 6. Measure, do not guess

Every number above is an estimate. Get the real ones before and after.

### 6.1 Measuring a protected endpoint

The platform is auth-gated — `src/middleware.ts` matches `/api/platform/:path*` and redirects
anonymous requests to `/login`. A plain `curl` gets a ~0-byte 307, which measures nothing.
Four ways round it, best first.

#### A. Browser DevTools Network tab — no setup, real numbers

Already logged in, so just use the session. Open the APL page, DevTools → Network, filter
`sports`. Enable the **Size** column: it shows two lines per row —
**transferred** (bytes on the wire) over **resource size** (uncompressed).

- Equal values → **not compressed**. That is the 6x finding.
- Transferred ≈ 15-20 % of resource size → gzip/Brotli is working.

`Response Headers → content-encoding` confirms it. The transferred figure is also exactly
the `payload_per_refetch` term from §2.1 — one screenshot answers both questions.

#### B. Console, scriptable — the Resource Timing API

`fetch()` in the console cannot read `Content-Encoding` (browsers strip it; decoding is
transparent). But Resource Timing exposes the byte counts directly, and same-origin
requests need no `Timing-Allow-Origin`:

```js
// paste on /platform/sports/apl and leave it running through a live event
const tally = {};
const add = (e) => {
  if (!/\/api\/platform/.test(e.name)) return;
  const k = new URL(e.name).pathname;
  const t = (tally[k] ??= { hits: 0, wire: 0, raw: 0 });
  t.hits++; t.wire += e.transferSize; t.raw += e.decodedBodySize;
};
const show = () => console.table(Object.entries(tally).map(([url, t]) => ({
  url,
  hits: t.hits,
  wireKB: +(t.wire / 1024).toFixed(1),
  rawKB: +(t.raw / 1024).toFixed(1),
  perHitKB: +(t.wire / t.hits / 1024).toFixed(1),
  compressed: t.raw > 0 && t.wire < t.raw * 0.9 ? 'yes' : 'NO  <-- 6x fix here',
})));

performance.getEntriesByType('resource').forEach(add);
new PerformanceObserver((l) => { l.getEntries().forEach(add); show(); })
  .observe({ type: 'resource', buffered: false });
show();
```

`encodedBodySize` vs `decodedBodySize` **is** the compression test.
`transferSize` includes response headers (a few hundred bytes), so it slightly overstates
small responses — irrelevant at 300 KB.

Left running on the APL page during an auction, `hits` is the per-client refetch count and
`wireKB` is that one client's egress. Multiply by concurrent viewers for the monthly number.
This is the measurement that matters most — do this one.

#### C. curl with the real session cookie

For scripted / repeatable checks. In DevTools, right-click any `/api/platform/...` request →
**Copy → Copy as cURL**. That carries the cookies and headers. Then:

```bash
# real GET, headers to stdout, body discarded
curl -s -o /dev/null -D - \
  -H 'Accept-Encoding: br, gzip' \
  -H 'Cookie: __Secure-authjs.session-token=<paste>' \
  -w '\nwire bytes: %{size_download}\n' \
  'https://<host>/api/platform/sports/apl/participants?limit=500'
```

Not `-I`. HEAD often skips compression and reports no `content-encoding` on a server that
compresses GETs perfectly well.

Then compare against the decompressed size:

```bash
curl -s --compressed -H 'Cookie: ...' '<url>' | wc -c
```

The session cookie is a live credential — keep it out of shell history (`HISTCONTROL=ignorespace`,
leading space) and out of anything committed. It expires; re-copy when it does.

#### D. Isolating which layer strips compression

Run on the server. `localhost:3000` bypasses nginx, so comparing the two says who is at fault:

```bash
curl -s -o /dev/null -D - -H 'Accept-Encoding: gzip' http://localhost:3000/login
curl -s -o /dev/null -D - -H 'Accept-Encoding: gzip' https://<host>/login
```

`/login` is excluded from the middleware matcher, so it needs no auth and is large enough to
compress. Node compresses, nginx does not → nginx config. Neither → Next's `compress`.

**Caveat:** this tests `text/html`. nginx's default `gzip_types` is `text/html` only, so HTML
can pass while `application/json` fails. Use it to locate the layer, then confirm on a real
JSON endpoint with A or B. If nginx is the layer:

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_min_length 1024;
gzip_types application/json application/javascript text/css text/plain image/svg+xml;
```

### 6.2 Server-side volume

```bash
# bytes out per endpoint, from nginx access logs (adjust $body_bytes_sent field position)
awk '{print $7, $10}' /var/log/nginx/access.log \
  | grep '/api/platform/sports' \
  | awk '{sum[$1]+=$2; n[$1]++} END {for (u in sum) printf "%12.1f MB  %7d hits  %s\n", sum[u]/1048576, n[u], u}' \
  | sort -rn | head -20

# live SSE connection count
ss -tn state established '( sport = :3000 )' | wc -l
```

Add a counter to the webhook so broadcast volume is visible:

```ts
platform.log(`[APL Webhook] ${event} ${model} -> ${aplEmitter.listenerCount('apl-update')} listeners`)
```

That single log line gives `broadcast_events x concurrent_clients` directly — the two terms
that turned Rs 700 into Rs 6,000. Watch it too for the §3 leak: if `listenerCount` keeps
climbing across an evening and never falls when people close tabs, the cleanup bug is live.

---

## 7. Rules

1. **An SSE event carries the change, not a signal to go re-download everything.**
2. **Never broadcast unscoped.** Filter server-side, by model and by entity.
3. **Coalesce on the server**, always, with a window ≥ 500 ms.
4. **No `EventSource` without a `visibilitychange` handler.**
5. **Refetch paths use `no-cache` + ETag**, never `no-store`.
6. **Cleanup binds to `request.signal`**, never to `cancel`'s argument.
7. **Cap concurrent connections** and degrade to polling. Fail loudly, not silently.
8. Before shipping a realtime feature, estimate
   `clients × events × payload` and write the number in the PR. If it is not bounded by
   construction, it is not ready.
