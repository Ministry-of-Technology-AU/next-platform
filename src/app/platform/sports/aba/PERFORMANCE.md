# ABA — Performance & Network Cost Issues

**Status: diagnosed, not fixed.** This is a work list. Nothing here has been applied.

General design rules: [`.agents/blueprints/realtime.md`](../../../../../.agents/blueprints/realtime.md).
Sibling doc with measured numbers: [`../apl/PERFORMANCE.md`](../apl/PERFORMANCE.md).

**ABA has not been measured yet** — the 5.4 MB figures in the APL doc are APL's. ABA's
payloads are probably smaller (see A2), but its **event rate is much higher** and its
**client-side filtering is worse**. Measure before assuming (see the bottom of this file).

---

## Where ABA differs from APL

Some of APL's worst problems are absent here; others are worse. Do not copy APL's fixes
blindly.

| | APL | ABA |
|---|---|---|
| `populate[user]=profile_url` bug | yes | **no** — ABA does not populate user |
| Participants payload | 5.4 MB @ 500 | lighter — `populate: 'team'`, no logo |
| Client filters SSE by `model` | partly | **never** |
| `populate=*` | no | **yes**, on `/aba-teams` |
| Batch writes per action | 1–2 | **up to ~24** |
| Write frequency | per goal | **per basket** — far higher |

---

## A1 — No client filters SSE events at all

**Files:** `src/app/platform/sports/aba/page.tsx:109-121`, `aba/[id]/page.tsx:47-58`

```ts
// page.tsx
eventSource.onmessage = (event) => {
  const payload = JSON.parse(event.data);
  platform.log('[SSE] Received update:', payload);
  fetchData();            // matches + teams + participants, on ANY event
};
```

```ts
// [id]/page.tsx — a single match detail view
eventSource.onmessage = (event) => {
  JSON.parse(event.data);
  fetchMatchData();       // refetches THIS match on ANY ABA event, incl. other matches
};
```

The payload carries `model` and `entryId`. Both are parsed and thrown away. A viewer
watching match 4 refetches every time match 11 is edited.

APL's `page.tsx:172` at least branches on `model` — ABA has no equivalent anywhere.

**Fix:** branch on `model` (and on `entryId` in `[id]/page.tsx`), then move to server-side
room scoping (`?models=…&match=…`) so the byte never leaves the box. `realtime.md` §4.2.

## A2 — `/aba-teams?populate=*`

**File:** `src/app/api/platform/sports/aba/teams/route.ts:6`

```ts
const data = await strapiGet('/aba-teams?populate=*');
```

Wildcard populate pulls every relation one level deep — including each team's participants
and logo media objects with all four `formats` variants. This is the one rule `caching.md`
calls out by name: **never `populate=*` on a route that returns to the browser.**

**Fix:** name the fields and relations the UI renders.

```ts
const data = await strapiGet('/aba-teams', {
  fields: ['name', 'matches_played', 'matches_won', 'matches_lost', 'matches_tied', 'points'],
  populate: { logo: { fields: ['url'] } },
});
```

Check `page.tsx`'s `dashboardData` memo and `admin/[id]` first — `finalizeMatch` reads
`matches_played`, `matches_won`, `matches_lost`, `matches_tied`, `points`.

## A3 — `/aba-matches` inlines both team logos, unbounded

**File:** `src/app/api/platform/sports/aba/matches/route.ts:9`

```ts
const query = `populate[team_a][populate][0]=logo&populate[team_b][populate][0]=logo&pagination[limit]=-1&sort[0]=start_time:asc`;
```

Same duplication as APL: `limit=-1` with a full media object per side, per match. The client
**already fetches `/aba-teams` separately** and can join on id.

**Fix:** `populate[team_a][fields][0]=id`, same for `team_b`, bound the limit, and join
client-side. Use the `status` filter for the live view instead of pulling every match.

## A4 — `finalizeMatch` fires ~24 writes at once → ~24 broadcasts

**File:** `src/app/platform/sports/aba/admin/[id]/page.tsx:234-241`

```ts
const allPlayers = [...teamAPlayers, ...teamBPlayers];
await Promise.all(allPlayers.map(p =>
  fetch(`/api/platform/sports/aba/participants/${p.strapiId}`, { method: 'PATCH', ... })
));
```

Then two team PATCHes, then the match PATCH. For a basketball roster that is **~24 parallel
Strapi writes from one button press**.

Each write fires a Strapi webhook → `abaEmitter.emit` → **every connected client refetches
matches + teams + participants** (A1: unfiltered). One "finalize match" click ≈
**24+ full refetches per connected viewer**, simultaneously.

This is ABA's signature failure and it has no APL equivalent.

**Fix:** server-side coalescing is the real answer (`realtime.md` §4.3) — buffer webhook
events keyed by `model:entryId`, flush every 500–1000 ms, last write wins. 24 broadcasts
collapse to 1, without touching this component.

Worth doing as well: a single bulk endpoint that writes all participants in one Strapi call,
so 24 webhooks become 1 at the source.

## A5 — every point scored is two writes

**File:** `src/app/platform/sports/aba/admin/[id]/page.tsx:188-201`

```ts
await fetch(`/api/platform/sports/aba/participants/${player.strapiId}`, { method: 'PATCH', ... });
await saveDetailsToStrapi({ details: { scoreA, scoreB, sets, events, individual_stats } });
```

Two writes per basket → two webhooks → two broadcasts → two full refetches per client.
A basketball game runs ~150 scoring events, so **~300 broadcasts per match**, before
`handleEndSet` and `finalizeMatch`.

Combined with A1 (no filtering), every viewer refetches all three collections ~300 times per
game. This is why ABA spikes even though its payloads are smaller than APL's.

**Fix:** A4's coalescing caps this at 1–2 events/second no matter how fast the admin taps.
Then P4-style data-in-event (`realtime.md` §4.1) removes the refetch entirely.

## A6 — the webhook discards the changed record

**File:** `src/app/api/platform/sports/aba/webhook/route.ts`

Same as APL: Strapi sends `entry`, the handler emits only `{model, event, entryId, timestamp}`,
and every client re-downloads the collection to find out what changed.

**Fix:** send the volatile scalars (`points_scored`, `assists`, `fouls`, `rebounds`,
`details`, `status`) and patch client state. `realtime.md` §4.1.

Note ABA's emitter has no model-alias normalisation — APL has `APL_MODEL_ALIASES` mapping
`api::apl-match.apl-match` → `apl-matches`. Before filtering on `model` in ABA clients (A1),
**log what Strapi actually sends** and normalise the same way, or the filter will silently
drop every event.

## A7 — `cancel()` never runs, so connections leak

**File:** `src/app/api/platform/sports/aba/sse/route.ts:40-46`

Byte-for-byte the same bug as APL's:

```ts
(controller as any).__cleanup = cleanup;
...
cancel(controller: any) { controller?.__cleanup?.(); }
```

An underlying source's cancel is called as **`cancel(reason)`** — it gets the cancellation
reason, **not the controller**. So `cleanup()` never runs: the `abaEmitter` listener is never
removed and the 15 s keepalive interval never cleared. Dead listeners and live timers
accumulate for the life of the process.

**Fix:** `request.signal.addEventListener('abort', cleanup)`. The handler currently takes no
`request` argument — add it. Full version in `realtime.md` §3.1.

## A8 — shared with APL

- **No compression.** nginx default `gzip_types` is `text/html` only, so JSON goes out raw.
  Config-only fix, helps the whole platform. See `../apl/PERFORMANCE.md` P3.
- **No `visibilitychange` handling** — hidden tabs refetch forever. `realtime.md` §4.4.
- **No connection cap, no reconnect jitter.** `setMaxListeners(1000)` caps nothing.
- **No auth on the ABA route handlers** — unlike APL's `matches` POST, ABA's `matches`,
  `teams` and `participants` handlers call neither `auth()` nor an access check. Middleware
  gates the path, so they are not public, but any logged-in user can PATCH match scores.
  Out of scope for performance, worth a separate ticket.

---

## Work order

Independent, low-risk, do first:

- [ ] **A8** — nginx gzip. Config only. Helps everything.
- [ ] **A7** — SSE cleanup bug.
- [ ] **A2 + A3** — drop `populate=*`, stop inlining logos, bound `limit=-1`.

Then, highest leverage for ABA specifically:

- [ ] **A4** — server-side coalescing. Collapses the 24-write storm to one broadcast.
- [ ] **A6** — normalise `model` first, *then* **A1** — filter on the client, then scope server-side.
- [ ] **A5** — data in the event, so scoring stops triggering refetches.
- [ ] visibilitychange, connection cap, jitter, ETag/304.

For ABA, **A4 + A1 are the big ones** — the payloads are smaller than APL's but the event
rate is an order of magnitude higher and nothing is filtered.

## Measure first

ABA's payload sizes are unknown. Get them before starting — paste on `/platform/sports/aba`
and leave running through a live match:

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

`hits` is the per-client refetch count — during a live ABA match that number is the one to
watch, because A1 means it climbs on every event from every model.
Ignore rows with `wireKB: 0` (cache hits read as `compressed: yes`).

Also log what Strapi actually sends, for A6:

```ts
platform.log(`[ABA Webhook] ${event} ${model} -> ${abaEmitter.listenerCount('aba-update')} listeners`)
```

That gives the raw `model` string to normalise against, the broadcast rate, and — if
`listenerCount` climbs all evening and never falls — confirmation of A7.
