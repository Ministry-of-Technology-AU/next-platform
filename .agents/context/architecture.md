# ARCHITECTURE OVERVIEW

High-level map of how `next-platform` is hosted, how data flows, and which services sit where.
Read this for orientation. For *how to do* a specific thing, go to the blueprint it points at.

> **Finding the actual code: query graphify, don't grep.** This repo is fully indexed at
> `graphify-out/`. This file tells you the *shape* of the system; graphify tells you exactly
> where a given piece of code lives and what it connects to.
>
> ```bash
> graphify query "where is X handled"      # scoped subgraph for a question
> graphify path "<A>" "<B>"                # how two things relate
> graphify explain "<concept>"             # focused view of one concept
> ```
>
> Skill: `.agents/skills/graphify/SKILL.md` (`/graphify`). Fall back to
> `graphify-out/GRAPH_REPORT.md` only when query/path/explain come up short — it is large.
> Re-indexing (`graphify update .`) is a deploy-time step — not something to run per change.

---

## OVERALL ARCHITECTURE

### The shape of it

```
                      ┌──────────────────────────────────────────┐
  browser  ──────────►│  AWS EC2 t3a.medium                      │
  (desktop / mobile)  │                                          │
                      │   next-platform (Next.js 15, App Router) │
                      │        │                                 │
                      │        │  REST over HTTP + SSE           │
                      │        ▼                                 │
                      │   Strapi v4 (headless CMS)               │
                      │        │                                 │
                      │        ▼                                 │
                      │   SQLite  ◄── EBS volume (persistent)    │
                      └──────────────────────────────────────────┘
                               │                    │
                               ▼                    ▼
                        Cloudinary           Google Workspace
                     (images / files)   (Drive, Calendar, Gmail SMTP)
```

### Hosting

Everything runs on a **single AWS EC2 `t3a.medium` instance** with an **EBS volume** attached
for persistent storage. Two applications live on that box:

1. **`next-platform`** — this repo. Next.js 15 (App Router), React 19, served to the browser.
2. **Strapi v4** — a separate repo on the same server. The headless CMS and the only thing that
   touches the database.

Because both share one modest instance, **frontend cost and load discipline is not theoretical**.
Refetch storms and uncapped SSE connections are the two things that have actually hurt us —
see `.agents/blueprints/caching.md` and `.agents/blueprints/realtime.md` before adding any fetch
or live connection.

### The data layer — and the one hard rule

```
SQLite  ←→  Strapi v4  ←→  next-platform
   ▲           ▲                ▲
   │           │                └── you write code here
   │           └── the abstraction layer. Everything goes through it.
   └── NEVER touch this directly. Not once. No exceptions.
```

- The database is **SQLite**, sitting on the EBS volume underneath Strapi.
- **We never interact with the database directly — ever.** No direct SQLite reads, no direct
  writes, no migrations run by hand from this repo. Strapi owns the database; SQLite is an
  implementation detail we are not allowed to depend on.
- Strapi exposes the data as **collection types**. Each feature reads and writes the collection
  types it owns. When a PRD is written, the relevant collection type is specified in it — if a
  PRD is missing that, ask before building.
- All Strapi access from this repo goes through `src/lib/apis/strapi.ts`
  (`strapiGet` / `strapiPost` / `strapiPut` / `strapiDelete` / `strapiRequest`), which wraps axios
  and builds Strapi's query syntax with `qs` — populate, filters, sort, pagination, fields.
  **How to construct those queries: `.agents/blueprints/strapi.md`.**

### How a request actually flows

```
page.tsx (server component)
   └─► fetch  /api/platform/<feature>        ← internal route, cookies forwarded
          └─► requireAuth()                  ← src/lib/auth.ts
          └─► strapiGet(...)                 ← src/lib/apis/strapi.ts
                 └─► Strapi v4 ──► SQLite
          ◄── typed { success, data } response
   └─► props ──► client.tsx (client component)
```

Rules that fall out of this:

- **The browser never talks to Strapi, Google, or Cloudinary directly.** It talks to our own
  route handlers under `src/app/api/`, which hold the credentials. Route contract:
  `.agents/blueprints/route.md`.
- **Fetch on the server, pass down as props.** Client-side API calls are the exception, not the
  default. See `.agents/blueprints/page.md`.
- Auth is **NextAuth v5** with Google as the provider, gated to the allowed email domain.
  `src/lib/auth.ts` gives you `getAuthenticatedUser()`, `requireAuth()`, `hasAccess()`,
  `isStudent()`, `isOrganizationMember()`. Pages are `force-dynamic` because they read cookies.

### Transport: REST by default, SSE where it earns it

- **Default is plain REST** against Strapi via our route handlers. Use this unless there is a
  reason not to.
- **Server-Sent Events** for the genuinely live surfaces (currently APL and ABA). Emitters live
  in `src/lib/sse/` (`event-emitter.ts`, `apl-emitter.ts`, `apl-events.ts`) and are held on a
  global singleton so Next's dev/HMR reloads don't multiply them.
  **Before touching SSE, read `.agents/blueprints/realtime.md`** — it documents the connection-
  leak bug and the refetch storm that made SSE expensive, and the fixes in order of leverage.

### Files and images — Cloudinary

Cloudinary is our image/blob store (free tier). Uploads are **server-side only** so the API
secret never reaches the browser.

- `src/lib/apis/cloudinary.ts` — `uploadImageToCloudinary()`, `deleteImageFromCloudinary()`
- `src/lib/apis/cloudinary-url.ts` — `getOptimizedImageUrl()`, `getPlaceholderUrl()`
- Full guide: **`src/lib/apis/CLOUDINARY-API-GUIDE.md`**

Note `next.config.ts` sets `images.unoptimized: true` — Next's image optimiser is off, so
sizing and format come from Cloudinary transform URLs, not from `next/image`.

### Google Workspace

Drive and Calendar go through the per-API packages `@googleapis/drive` and `@googleapis/calendar`
(not the full `googleapis` SDK, which loads all 317 Google APIs), server-side, with refresh-token
auth. Mail is plain SMTP through `nodemailer`. Wrappers live in `src/lib/apis/`:

| File | Covers |
|------|--------|
| `drive.ts` | Upload/download/delete, attachment IDs, public embed links |
| `calendar.ts` | Calendar events (`GoogleEvent`) |
| `mail.ts` | `sendMail()`, `sendMailSG()`: transactional mail from the Tech Ministry and SG accounts |
| `sheets.ts` | Empty placeholder. No Sheets integration yet. |

Reference: **`.agents/blueprints/google-workspace.md`**.

### Environment

Secrets live in `.env` on the server. **Never read or open `.env`.** Only ever reference keys
by name. The ones that matter architecturally:

| Key | Points at |
|-----|-----------|
| `STRAPI_URL`, `STRAPI_API_TOKEN`, `STRAPI_IMAGE_URL` | Strapi v4 |
| `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_BACKEND_URL` | This app / its API base |
| `AUTH_CLIENT_ID`, `AUTH_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `ALLOWED_EMAIL_DOMAIN` | NextAuth (Google sign-in) |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `CALENDAR_CALLBACK_URL` | Semester planner's "add to my calendar" OAuth client (not NextAuth) |
| `CLOUDINARY_*` | Cloudinary |
| `DRIVE_*`, `GOOGLE_*`, `INDUCTIONS_CALENDAR_ID`, `SGMAIL_*`, `TECHMAIL_*` | Google Workspace, see `.agents/blueprints/google-workspace.md` |

Never hardcode a URL that one of these already provides.

---

## CODEBASE STRUCTURE

```
src/
├── app/
│   ├── layout.tsx            root layout, providers, fonts
│   ├── globals.css           ALL design tokens — colours, radius, fonts, animations
│   ├── page.tsx              landing
│   ├── login/  unauthorized/  not-found.tsx
│   ├── organisations/        org-facing surfaces
│   ├── platform/             every student-facing tool, one folder each
│   │   ├── layout.tsx  loading.tsx  loading.css
│   │   └── <tool>/           page.tsx · layout.tsx · client.tsx ·
│   │                         _components/ · types.ts · utils.ts · data.ts
│   └── api/
│       ├── auth/  calendar/  organisations/
│       └── platform/<feature>/route.ts    ← the only thing that talks to Strapi/Google
│
├── components/
│   ├── ui/                   shadcn primitives (check here first, always)
│   ├── data-table/  navbar/  sidebar/  landing-page/  organisations/  apl/  providers/
│   └── page-title · developer-credits · orientation-dialog · guided-tour ·
│       new-tool-banner · new-tool-alert · whats-new-modal · form · editor
│
├── lib/
│   ├── apis/                 strapi · cloudinary · cloudinary-url · drive · calendar ·
│   │                         mail · sheets · CLOUDINARY-API-GUIDE.md
│   ├── sse/                  event-emitter · apl-emitter · apl-events
│   ├── auth.ts               NextAuth helpers, access checks
│   ├── platform-logger.ts    platform.log() — the only logger
│   ├── apis.ts  utils.ts  date-utils.ts  userid.ts
│   ├── cgpa-*.ts  apl-*.ts   domain logic
│   └── constants/
│
├── hooks/                    use-mobile · use-theme · useClickOutside · useIsMac ·
│                             usePreventScroll
├── types/                    types shared across 2+ tools
├── data/                     static data shared across 2+ tools
└── scripts/                  create-page.mjs  (npm run create-page)
```

A tool's folder structure is not freeform — `.agents/blueprints/page.md` defines it, and
`src/app/platform/semester-planner/` is the reference implementation.

---

## WHERE TO GO NEXT

| Task | File |
|------|------|
| Finding where any specific code lives | `graphify query "..."` — see the note at the top |
| Building any UI | `.agents/context/frontend.md` |
| Design tokens, colour roles, type scale | `.agents/context/design.md` |
| Writing a PRD | `.agents/blueprints/prd.md` |
| A new tool end to end | `.agents/blueprints/tool.md` |
| New page / tool structure | `.agents/blueprints/page.md` |
| Auth, roles, access checks | `.agents/blueprints/auth.md` |
| Documenting a shipped feature | `.agents/blueprints/documentation.md` |
| Writing style for any prose (docs, PRDs, UI copy) | `.agents/context/writing.md` |
| Platform components (tour, banners, dialogs, form, editor) | `.agents/blueprints/components.md` |
| New API route | `.agents/blueprints/route.md` |
| Querying Strapi | `.agents/blueprints/strapi.md` |
| Caching, and not blowing up the bill | `.agents/blueprints/caching.md` |
| SSE / live data | `.agents/blueprints/realtime.md` |
| Google Drive / Calendar / Gmail / Sheets | `.agents/blueprints/google-workspace.md` |
| Cloudinary uploads and transforms | `src/lib/apis/CLOUDINARY-API-GUIDE.md` |
| PWA / offline / install | `.agents/blueprints/pwa.md` |
| Shared util functions | `.agents/context/libraries.md` |
| Server-side concerns | `.agents/context/backend.md` |
