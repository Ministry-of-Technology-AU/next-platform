# Secret Santa: PRD
> Status: approved · Area: platform · Owner: Soham Tulsyan

## 1. Summary

**Problem.** Groups on campus (friend circles, clubs, hostel floors) run Secret Santa over
WhatsApp and paper chits. Someone has to collect names, draw in secret, and message everyone
their person. Wish lists get lost in chats, and the organiser usually ends up knowing every pair.

**Solution.** A Secret Santa tool under Games. A host creates a pool, sets a budget and an event
date, and shares a link. People join through the link with their name and an optional wish list,
or the host adds them by email. When the host runs the draw, every participant gets an email
naming their giftee with that person's wish list, and the pool page plays an animated gift
reveal. Nobody, the host included, can see anyone else's pair.

**Who.** Any signed-in Ashoka user can host or join.

**Success criteria**
| # | Criterion | Target |
|---|-----------|--------|
| 1 | Time from opening the tool to having a share link | under 60 seconds |
| 2 | Draw correctness: self-pairs or excluded pairs produced | 0, covered by unit tests on the draw function |
| 3 | Draw emails for a 50-person pool | all sent or marked failed within 2 minutes of the draw |
| 4 | Pairings visible to anyone other than the giver | 0 (no API response contains another person's giftee) |
| 5 | Reveal and draw animations | hold 60 fps on a mid-range phone; replaced by a fade when `prefers-reduced-motion` is set |

## 2. Users & access

All roles that can sign in (`requireAuth()` with no grant list; identity via
`getAuthenticatedUser()`). Access to a pool depends on the record, so guards live in
`src/app/platform/games/secret-santa/_server/access.ts` (pattern from `src/lib/inductions/access.ts`).

| Who | Before the draw | After the draw |
|-----|-----------------|----------------|
| Signed-in user with the link, not in the pool | Sees title, host name, budget, event date, host note, participant count. Can join. | Sees the same summary and "This draw is closed". Cannot join. |
| Participant | Sees everyone's names (not emails). Edits own name and wish list. Can leave. | Sees own giftee's name and wish list. Edits own wish list. |
| Host | Everything a participant sees, plus participant emails, add by email, remove, exclusion pairs, edit pool, run the draw, delete the pool. | Edits title, event date, budget, host note. Sees email delivery status per participant (sent / failed, never the pair). Resends failed emails. |
| Host who is also playing | Both rows above. | Same as a participant for their own giftee. Still cannot see other pairs. |

Ownership is checked against the pool's `host` relation and the session user's Strapi id, never
an id sent by the client. Delete and draw recheck against Strapi at the time of the action.

## 3. Stories & flows

| # | Story | Acceptance criteria |
|---|-------|---------------------|
| S1 | As a host, I want to create a pool with a title, budget, event date and note so that everyone knows the rules. | Title (3 to 80 chars), budget in INR (whole number, 0 to 100000), event date (today or later), optional host note (rich text, up to 5000 chars after sanitising), "I'm playing too" toggle (default on). On save I land on the pool page with the share link ready to copy. |
| S2 | As a host, I want to share one link so that people can join themselves. | Link is `/platform/games/secret-santa/<uid>`. Copy button and native share on mobile. |
| S3 | As a host, I want to add people by email so that people who won't open the link are still in. | Paste one or many emails. Only `ALLOWED_EMAIL_DOMAIN` addresses are accepted; others are listed back as rejected. Each added person is in the pool at once and gets an invite email with the link. Duplicates are ignored. |
| S4 | As a participant, I want to join with my name and an optional wish list so that my Santa knows what I'd like. | Name prefilled from my session, editable (2 to 60 chars). Wish list is rich text, optional, up to 5000 chars after sanitising. Joining twice is a no-op. |
| S5 | As a participant added by email, I want to open the link and fill in my wish list. | Opening the link while signed in with that email shows me as already in. No join step. |
| S6 | As a participant, I want to leave before the draw. | Leave removes me and any exclusion pairs I am in. Not available after the draw. |
| S7 | As a host, I want to remove someone before the draw. | Removed person is not emailed. Their exclusion pairs are removed. |
| S8 | As a host, I want to mark pairs who must not draw each other. | Pick two participants. Pair applies both ways. Draw fails with a clear message if the exclusions make a valid draw impossible. |
| S9 | As a host, I want to run the draw so that everyone gets their person. | Needs at least 3 participants. Confirmation dialog states the count and that the draw cannot be redone. After the draw the pool locks: no joins, leaves, removals or exclusion edits. |
| S10 | As a participant, I want an email naming my giftee with their wish list, the budget, date and host note. | One email per participant. Sent from the Tech Ministry account. |
| S11 | As a participant, I want to open the pool and unwrap my giftee in an animated reveal. | First open after the draw shows a wrapped gift; tapping it plays the unwrap and confetti, then shows the name and wish list. Later opens show the result with a "Play again" control. |
| S12 | As a host, I want to see whose email failed and resend it. | Delivery status per participant. "Resend failed" sends only to failed ones. |
| S13 | As a user, I want to see all pools I host or joined. | Landing page lists them with status (open / drawn), date and participant count. |

**Flows**

1. **Happy path.** Host opens Secret Santa → Start a Secret Santa → fills the form → pool page
   with link → shares link → people join and add wish lists → host adds two people by email →
   host marks one exclusion pair → host presses Draw → shuffle animation → pool locks → emails go
   out → each participant opens the page and unwraps their giftee.
2. **Impossible exclusions.** Draw returns 422 "No valid draw exists with these exclusions.
   Remove a pair and try again." Pool stays open.
3. **Fewer than 3 people.** Draw button disabled with "Needs at least 3 people".
4. **Email failure.** Draw still succeeds. Failed recipients are marked `failed`. Host sees them
   and presses Resend failed. Participants can always see their giftee on the page.
5. **Joining after the draw.** Link shows the pool summary and "This draw is closed".
6. **Wish list changes after the draw.** Allowed. The page always shows the latest. The email
   holds the version from draw time.
7. **Host deletes the pool.** Confirmation names the pool and participant count. Before the draw
   nobody is emailed. After the draw participants are not emailed either; the link shows
   "This Secret Santa no longer exists".
8. **Unknown uid or deleted pool.** 404 page in the tool's style.

## 4. Screens

| Screen | Path | Purpose | Primary action |
|--------|------|---------|----------------|
| Landing | `/platform/games/secret-santa` | My pools, start a new one | Start a Secret Santa |
| Create | `/platform/games/secret-santa/new` | Pool form | Create |
| Pool | `/platform/games/secret-santa/[uid]` | Join, wish list, host controls, draw, reveal | Changes with state (below) |

**Pool page states**

| State | Viewer | Shows |
|-------|--------|-------|
| Invite | Not in pool, open | Pool summary, name field, wish list editor, Join |
| Waiting | Participant, open | Participants as animated gift tags or ornaments, my wish list editor, countdown to event, Leave |
| Hosting | Host, open | Waiting view plus share link, add by email, remove, exclusion pairs, Edit pool, Draw |
| Drawing | Host, during draw | Full-screen shuffle animation while the request runs |
| Unwrap | Participant, drawn, not yet revealed | Wrapped gift, tap to unwrap |
| Revealed | Participant, drawn, revealed | Giftee name, wish list, budget, date, host note, countdown, Play again |
| Host after draw | Host, drawn | Delivery status list, Resend failed, Edit pool. Plus Unwrap/Revealed if playing |
| Closed | Not in pool, drawn | Summary and "This draw is closed" |

Every screen has loading (skeleton), empty (landing with no pools: illustrated empty state with
Start a Secret Santa) and error (inline message with Try again) states.

**Mobile vs desktop.** Mobile: single column, host controls in a bottom sheet, reveal fills the
screen, native share for the link. Desktop: two columns on the pool page (participants and
controls on one side, wish list on the other).

**Motion.** Gamified and seasonal, built with `motion` and `canvas-confetti` (both installed;
Ashoka Wordle's `ConfettiEffect.tsx` is the reference). Snowfall layer, gift-tag entrance when
people join, shuffle during the draw, unwrap on reveal. Every animation respects
`prefers-reduced-motion`. Haptics on every interactive element through `src/lib/haptics.ts`.

**Colour.** Christmas red and green both used, on top of platform tokens. Exact palette decided
in the design direction gate.

Wireframe: no (skipped by the owner)
Design direction: yes

- **Palette.** Platform tokens only: `primary` family for Christmas red, `green` family for
  pine green, `secondary-light` for gold accents. Any new festive token goes into `globals.css`
  with light and dark values. Red and green both appear on every screen.
- **Landing.** Hero card with a slow snowfall layer and a short headline; Start a Secret Santa is
  the one primary action. Pools render as hanging gift tags (red for open, green for drawn) with
  a days-to-go chip. Tags enter with a small staggered swing. Mobile: hero shrinks, primary
  action becomes a sticky bottom button.
- **Create.** One card, three short steps (Basics, Budget and date, Note), progress shown as
  three ornaments filling in. Budget has quick picks (₹300, ₹500, ₹1000) plus a custom field.
  Finishing plays a small burst and routes to the pool page.
- **Pool, open.** Participants sit as gift tags around a central "pool" card showing count,
  budget and countdown. New tags pop in with a spring. Host controls (share, add by email,
  exclusions, Draw) sit in a side panel on desktop and a bottom drawer on mobile. Draw is
  disabled with its reason until 3 people are in.
- **Drawing.** Full-screen overlay: tags shuffle into a spinning sack for about 2 seconds, then
  settle on "Names drawn. Emails are on their way." No pair is ever shown.
- **Reveal.** A wrapped box with a ribbon. Tap or Space unwraps: lid lifts, ribbon falls,
  red and green confetti, then the giftee card with name, wish list, budget and countdown.
  Play again replays it. Reduced motion: fade straight to the card.
- **Shortcuts.** `N` new pool on landing, `C` copy link and `D` draw (host, with confirm) on the
  pool page, Space to unwrap.

## 5. Data

Two new Strapi collection types. The user creates them in Strapi.

**`secret-santa-pool`** (new)
| Field | Type | Notes |
|-------|------|-------|
| `uid` | UID / short text, unique, required | Random, from `uuid` v4. Used in the share link |
| `title` | short text, required | 3 to 80 chars |
| `budget` | integer, required | INR, 0 to 100000 |
| `event_date` | datetime, required | |
| `host_note` | long text | Sanitised HTML from the rich text editor |
| `status` | enumeration `open`, `drawing`, `drawn`; default `open` | `drawing` is a lock while the draw writes |
| `drawn_at` | datetime | Set when status becomes `drawn` |
| `exclusions` | JSON | `[[participantIdA, participantIdB], ...]`. Unordered pairs |
| `host` | relation, many-to-one to `users-permissions` user | Owner |
| `participants` | relation, one-to-many to `secret-santa-participant` | |

**`secret-santa-participant`** (new)
| Field | Type | Notes |
|-------|------|-------|
| `pool` | relation, many-to-one to `secret-santa-pool` | Required |
| `email` | email, required | Lower-cased. Unique per pool (enforced in code) |
| `name` | short text | 2 to 60 chars. Empty until a host-added person opens the link; email local part used as fallback |
| `user` | relation, many-to-one to `users-permissions` user | Set when the person signs in and opens the pool |
| `wishlist` | long text | Sanitised HTML, up to 5000 chars |
| `source` | enumeration `link`, `host` | How they entered |
| `giftee` | relation, one-to-one to `secret-santa-participant` | Set by the draw. Never returned to anyone but this participant |
| `email_status` | enumeration `none`, `sent`, `failed`; default `none` | Draw email delivery |
| `revealed_at` | datetime | First unwrap. Decides Unwrap vs Revealed state |

Rich text is sanitised on the server with `isomorphic-dompurify` (installed) before every write.
Hard cap of 100 participants per pool to stay inside Gmail SMTP sending limits.

## 6. API contract

Base: `/api/platform/games/secret-santa`. All routes need a session. Envelope
`{ success, data | error }` per `.agents/blueprints/route.md`. Zod schemas in the tool's
`schema.ts`. Strapi access in the tool's `_server/`.

| Path | Method | Access | Request | Response | Errors |
|------|--------|--------|---------|----------|--------|
| `/` | GET | signed in | | Pools I host or joined: `uid, title, eventDate, budget, status, participantCount, isHost` | 401 |
| `/` | POST | signed in | `title, budget, eventDate, hostNote?, hostPlays` | `{ uid }` | 400, 401 |
| `/[uid]` | GET | signed in | | View shaped by viewer and status (section 2). Own `giftee` only for the caller | 401, 404 |
| `/[uid]` | PATCH | host | any of `title, budget, eventDate, hostNote` | updated pool | 400, 401, 404 |
| `/[uid]` | DELETE | host | | `{ deleted: true }` | 401, 404 |
| `/[uid]/join` | POST | signed in, pool open | `name, wishlist?` | own participant | 400, 401, 404, 409 (closed or full) |
| `/[uid]/me` | PATCH | participant | `name?, wishlist?, revealed?` | own participant | 400, 401, 404, 409 (name change after draw) |
| `/[uid]/me` | DELETE | participant, pool open | | `{ left: true }` | 401, 404, 409 |
| `/[uid]/participants` | POST | host, pool open | `emails: string[]` (max 50 per call) | `added, skipped, rejected`; `warnings` for failed invites | 400, 401, 404, 409 |
| `/[uid]/participants/[id]` | DELETE | host, pool open | | `{ removed: true }` | 401, 404, 409 |
| `/[uid]/exclusions` | PUT | host, pool open | `pairs: [id, id][]` | saved pairs | 400, 401, 404, 409 |
| `/[uid]/draw` | POST | host, pool open, 3+ people | | `{ status: 'drawn', participantCount }`. No pairs | 401, 404, 409, 422 (no valid draw) |
| `/[uid]/draw/resend` | POST | host, pool drawn | | `{ resent, failed }` | 401, 404, 409 |

Non-host callers get 404 for host routes, so the route does not confirm the pool exists.

**Draw.** Pure function in the tool's `utils.ts`: random derangement honouring exclusions,
randomised backtracking with a 1000-attempt cap, returns null when impossible. Route order:
gate → recheck host and status in Strapi → set `drawing` → compute → write each `giftee` →
set `drawn` + `drawn_at` → respond → send emails in `after()` (Next 15) and record
`email_status`. A failed write resets giftees and status to `open`.

**Rate limits.** `/[uid]/participants`, `/[uid]/draw`, `/[uid]/draw/resend` go into
`MAIL_ROUTES`. Per-route: invites 100 emails per host per hour; draw and resend 5 per pool per
hour. Keys use the session email.

## 7. Live data

None. Load on open; the page calls `router.refresh()` after the viewer's own actions. Host sees
new joiners on reload. Passes the realtime gate: no shared live state worth an SSE connection.

## 8. Caching & cost

| Dataset | Shared or per-user | Cache | Volume |
|---------|-------------------|-------|--------|
| My pools list | per-user | none on server, `CACHE_CONTROL.private` | a few pools per user |
| Pool view | per-user (shape depends on viewer) | none on server, `CACHE_CONTROL.private` | up to 100 participants, fields limited with `fields` and narrow `populate` |
| Draw | write | none | one per pool |

No `populate: '*'`. Pool view populates only `participants` with `id, name, email, source,
email_status` (email only for host), and `giftee` only for the caller's own row.

## 9. Integrations

| Integration | What | Why |
|-------------|------|-----|
| Mail (`sendMail`, Tech Ministry account) | Invite email on host add; draw email per participant | Core flow |
| Cloudinary | n/a | No uploads |
| Google Calendar | n/a for v1 | |

Email HTML built in the tool's `_server/emails.ts`. Wish list HTML is sanitised before it goes
into the email.

New env keys: none.

## 10. Launch

| Item | Plan |
|------|------|
| Sidebar | New item "Secret Santa" next to "Games and Puzzles" in `src/components/sidebar/platform.ts`. Games hub stays as it is |
| Guided tour | Yes, on the pool page (share link, wish list, draw) |
| New tool banner / alert / what's-new | Only when the user says it is ready to ship |
| Credits | Soham Tulsyan · role TBD · profile URL TBD |

## 11. Milestones

- [ ] M1: Strapi types created, tool `types.ts`, `schema.ts`, `_server/` data access and `access.ts` guards · acceptance: typecheck passes; guards cover host, participant, outsider
- [ ] M2: Pool routes (`/`, `/[uid]`, join, me) · acceptance: every route in section 6 returns the right shape per viewer; outsiders cannot see emails
- [ ] M3: Host participant management, exclusions, invite email · acceptance: domain check, duplicates skipped, rate limit applied
- [ ] M4: Draw function with tests, draw route, draw email, resend · acceptance: criteria 2 to 4 in section 1
- [ ] M5: Landing and create pages · acceptance: criterion 1; empty, loading, error states
- [ ] M6: Pool page open states (Invite, Waiting, Hosting) · acceptance: works at 375px and desktop
- [ ] M7: Draw and reveal animations, post-draw states · acceptance: criterion 5
- [ ] M8: Sidebar, guided tour, before-handoff checklist · acceptance: `frontend.md` checklist passes; typecheck and build pass

## 12. Non-goals

- Participants outside the Ashoka domain
- Redrawing after the draw
- Anonymous chat between Santa and giftee
- Gift tracking, payments, or price lookups for wish list links
- Calendar invites for the event
- Recurring or yearly pools
- Showing pairings to the host

## 13. Risks

| Risk | Mitigation |
|------|------------|
| Strapi has no transactions, so a draw can half-write | `drawing` status as a lock; on any failed write, clear giftees and reset to `open` |
| Gmail SMTP daily sending limits | 100-participant cap; per-route mail limits; failed sends recorded and resendable |
| Draw emails take long for big pools | Sent in `after()` so the response does not wait; status recorded per person |
| Pairings leak through an API response or log | `giftee` populated only for the caller's own row; never log pairs or email lists |
| Stored XSS through wish lists or host note | Sanitise HTML on write with `isomorphic-dompurify`, render through the existing rich text renderer |
| Heavy animation on low-end phones | Canvas confetti only on reveal, snowfall capped in particle count, reduced-motion fallback |

**Open questions**
- Credits role and profile URL: TBD
- Should the host see who has revealed their giftee (without the pair)? TBD, default no
