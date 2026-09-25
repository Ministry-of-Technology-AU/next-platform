# AGENT INSTRUCTIONS

The entry point for any agent working in `next-platform`, whatever tool or IDE runs it.
`CLAUDE.md` and `.cursorrules` are symlinks to this file. Read it whole — it is short on
purpose. Everything else loads lazily, when a step needs it.

`.agents/context/` = guidelines. `.agents/blueprints/` = templates and contracts.
`.agents/skills/<name>/SKILL.md` = skills.

**Skills, in any tool.** `/name` means the skill at `.agents/skills/<name>/SKILL.md`. If your tool
has a skill runner, invoke it. If not, read that `SKILL.md` and follow it. Either way, read only
the `SKILL.md`; go into its `references/` only when it tells you to.

---

## 1. Every session

### Chat
- **`/caveman` in chat, always**, unless the user asks otherwise. Tokens are the budget.
- Caveman is for chat only. Code, comments, commit messages, PRDs, docs and UI copy follow
  `.agents/context/writing.md`.
- **Ask when intent is unclear.** Batch the questions that block you into one message. Never
  ask what the docs, the code or graphify can answer.

### Handoff
Suggest `/handoff` to the user when any of these is true:
- a phase is done (PRD approved, backend landed, page shipped) and the chat is already long
- you catch yourself re-reading files, or losing track of decisions made earlier in the chat
- your tool reports the context is past about half full

Suggest it, don't run it. The user starts it. Tell them what to pass as the argument (what the
next session is for), so the handoff doc is tailored to that.

### Non-negotiables
These apply to every task. The detail lives in the linked docs.

| Rule | Detail |
|------|--------|
| Never open, read, print or `source` `.env` | §7 |
| Never commit, push, branch, merge or open a PR unless the user explicitly asks | — |
| Never touch SQLite. All data goes through Strapi via `src/lib/apis/strapi.ts` | `.agents/context/architecture.md` → data layer |
| Type-safe code, `platform.log()`, built-in utilities, no repetition | §2 |
| Every fetch, route response and image picks its cache tier first | `.agents/blueprints/caching.md` §2, rules §8 |
| Live data passes the realtime gate before any code | `.agents/blueprints/realtime.md` §7 |
| Components: check before you build, ask before you write | §2 |
| Typecheck every change. Build when a change is over 50 lines | §1 → verification |

### Verification
| Check | When |
|-------|------|
| `npm run typecheck` | **Every time** code changes, after each milestone, and before handing off |
| `npm run build` | Only when the change is **more than 50 lines of code**. Not on every change |

- Typecheck is how we stop cascading type issues. Fix every error you caused. Report errors
  you didn't cause with `path:line`, and leave them alone unless they are in a file you touched.
- Never `graphify update`. Re-indexing is a deploy step.

---

## 2. Code standards

- **Type safety, always.** TypeScript strict, no `any`, no `!` non-null assertions. Types a page
  and its route share live in that page's `types.ts`. A change must not leave type errors
  anywhere downstream.
- **Handle every null.** Optional chaining plus an explicit fallback, or an early return.
  Never `data!.field`.
- **`platform.log()` / `.warn()` / `.error()`, never `console.*`** (`src/lib/platform-logger.ts`).
- **Built-in utilities first.** Before writing a helper, check `src/lib/`
  (`.agents/context/libraries.md`, then `ls src/lib`, because the doc can lag), `src/hooks/` and
  `src/components/`. Strapi goes through `strapiGet`/`strapiPost`, auth through `requireAuth` /
  `getAuthenticatedUser`, caching through `src/lib/cache/`, rate limits through
  `src/lib/rate-limit.ts`, haptics through `src/lib/haptics.ts`. A generic reimplementation of
  something we already have is a bug.
- **Modular, never repeated.** When logic appears a second time, extract it: to the tool's
  `utils.ts` / `helper.ts` if it's local, or to `src/lib/<feature>/` or `src/components/` if
  2+ tools use it. Don't over-abstract either. One use means no helper.
- **Components: check before you build, ask before you write.**
  1. `src/components/ui/` and `src/components/`
  2. `/shadcn-ui` and the shadcn MCP
  3. Needs installing → **ask the user to run the CLI command or source the code.** Write the
     component yourself only when explicitly asked.
- **Next.js 15 App Router best practices.** Load `/nextjs-best-practices` and
  `/nextjs-app-router-patterns` for any code under `src/app/`. Server components by default,
  `'use client'` as low as possible, fetch on the server and pass props down.
- **Frontend work follows `.agents/context/frontend.md`. Backend work follows
  `.agents/context/backend.md`.**

---

## 3. Orientation — before any work

1. **`.agents/context/architecture.md`** → overall architecture (the shape, hosting, data layer,
   request flow). Skip the codebase structure section until you are placing files.
2. **`/platform`** → it picks the workflow and loads only the docs that workflow needs.
3. **Go back and forth.** When a doc raises a system question (where does this run, which
   service owns this, what the env key is called), go back to the matching section of
   `architecture.md`. When the question is about code, use graphify (below).
4. **Tool-local state.** A tool's folder may hold `PRD.md` (the spec) or `README.md` (the current
   state). Read those before its code.

### graphify
The repo is indexed as a knowledge graph in `graphify-out/`. **Use it before grep or opening
files.**

```bash
graphify query "<question>"      # scoped subgraph for a question
graphify path "<A>" "<B>"        # how two things relate
graphify explain "<concept>"     # focused view of one concept
```

- `graphify-out/wiki/index.md`, when it exists, is for broad navigation instead of browsing
  source.
- `graphify-out/GRAPH_REPORT.md` only for broad architecture review, or when query / path /
  explain come up short. It is large.
- Skill: `/graphify`.

---

## 4. Starting new work — the gates

When the user starts something new (a tool, a feature, a surface), **ask each gate in order, one
at a time.** For each one, tell the developer in two or three lines what it is, what they will
have to do, and what they get. Don't just ask yes or no.

| # | Gate | Ask when | Runs | The developer's part |
|---|------|----------|------|----------------------|
| 0 | Brainstorm | The idea is fuzzy, or the problem has more than one real solution | `/brainstorming`, then §6 | Answers questions one at a time, picks an option |
| 1 | PRD | Always ask. A user who says no still gets a minimal one (milestones need a home) | `/platform prd` | Answers the discovery interview. Creates the Strapi collection types the PRD lists. Adds the values for any new env keys |
| 2 | Wireframe | After the PRD, always ask | `/platform wireframe` | Needs Stitch access. Reviews and approves each screen |
| 3 | Design direction | After the wireframe (or the PRD if there is none) | `/platform design` | Picks between directions, approves the one recorded in the PRD |
| 4 | Implementation plan | Always, before any code | `.agents/blueprints/tool.md` → spec, step 3 | Confirms collection types, routes, pages and milestone order |
| 5 | Build | After the plan is confirmed | `/platform tool`, or `route` / `page` for part of one | Checks in at each phase boundary |
| 6 | Close out | Build done | `/platform` → close out, then offer `/platform docs` | Says whether it's ready to ship (unlocks the launch surfaces) |
| 7 | Teach | Project done | A teaching skill, **planned, not built yet**. Until it exists, offer a walkthrough of what was built and why, using the feature docs | — |

### Small tasks skip the gates
| Task | Start at |
|------|----------|
| Bug fix | graphify to locate → the rules section of the doc for that area (`frontend.md` §4, `backend.md` §4) → fix → typecheck. Fix any known gap in a file you touch (`backend.md` §4.7, `auth.md` §9) |
| Change to an existing page or route | `/platform page` or `/platform route` — the workflow still applies, just scoped |
| Slow or expensive page | `.agents/blueprints/caching.md` §4 (the recipe), then §5 (the tracker) |
| Question about the code | graphify, then answer. No docs needed unless the answer depends on a rule |

---

## 5. The platform workflows

`/platform` routes to exactly one of these. It holds the steps, so they aren't repeated here.

| Workflow | Use when | You end up with |
|----------|----------|-----------------|
| `prd` | Planning a new tool or a large feature | `src/app/<area>/<tool>/PRD.md` |
| `wireframe` | PRD exists and screens need laying out before code | Stitch screens, linked in PRD §4 |
| `design` | Screens are known and the look and feel needs deciding before code | A design direction in PRD §4 |
| `route` | An API endpoint under `src/app/api/` | A gated, typed, cached route handler |
| `page` | A page or screen under `src/app/` | A page that meets the frontend handoff checklist |
| `tool` | A whole new tool, end to end | Everything above, in order, plus launch surfaces |
| `docs` | A shipped feature needs developer docs | Feature docs per `.agents/blueprints/documentation.md` |

`tool` runs the others. Don't stack them.

---

## 6. Finding the best solution

Any decision with more than one plausible answer gets a short brainstorm before code. That
includes a new data model, a cache tier, realtime or not, a new dependency, and a fix that
could take more than one shape. Use `/brainstorming` for the dialogue. Hold every option to this
bar:

1. **Two or three genuinely different options**, not variations of one.
2. **Check each against what actually binds here:**
   - One shared `t3a.medium` box, where RAM, disk and egress cost real money
     (`caching.md` §0).
   - Data goes through Strapi only.
   - Per-user data never gets a server cache.
   - Desktop and mobile are both first-class.
   - Whoever maintains it next has to understand it.
3. **Reuse first.** Is there an existing lib function, component or tool pattern that already
   solves most of it?
4. **Name what it improves:** bill, speed, RAM, disk or UX. If it improves none of them, drop it.
5. **Measure or ask. Don't guess.** Sizes, request counts and load are measured
   (`realtime.md` §6). Product intent is asked.
6. **Recommend one.** Give the reason and what it costs. The user decides. No code before they
   pick.

---

## 7. Environment variables

- **Never open `.env`.** That rules out reading it, grepping it, printing it and sourcing it,
  including from scripts.
- **Key names come from `.env.example`.** You never need a value. If you think you do, ask the
  user.
- **A new key** is declared in the PRD (the integrations section: name, purpose, server-only or
  `NEXT_PUBLIC_`, example format). It goes into `.env.example` with an empty value, in the same
  change that first reads it, grouped under a comment. The user or the developer adds the real
  value to `.env`.
- Secrets never get `NEXT_PUBLIC_`. That prefix ships the value to the browser.
- Code reads a required key once, at module top, and fails closed when it's missing.

---

## 8. Keeping context small

- **Lazily, by section.** The `/platform` loading protocol applies to all work, not only its
  workflows. Load a doc at the step that needs it, and only the section that answers the
  question.
- **graphify before grep,** and grep before opening whole files.
- **Don't re-read** a file already read this session unless it changed.
- **Reference, don't paste.** Point to `path:line` instead of quoting blocks into chat.
- **Subagents,** if your tool has them, get a scoped brief: the question, the paths, the graphify
  rule. Never "explore the repo".
- **Stubs don't block.** An empty doc or a dangling reference means you fall back to graphify
  and the reference implementation, then report the gap at the end.

---

## 9. Skills

Who loads each skill is decided by the doc named in the last column. This table exists so you
know what's installed, not so you load it all. Load a skill when the doc or step calls for it.

| Skill | For | Loaded by |
|-------|-----|-----------|
| `/caveman` | Terse chat | Every session (§1) |
| `/platform` | Routing every build task | Every new task (§3) |
| `/graphify` | Code lookup through the knowledge graph | Every code question (§3) |
| `/handoff` | Moving to a fresh chat | The user, when you suggest it (§1) |
| `/nextjs-best-practices`, `/nextjs-app-router-patterns` | Next 15 App Router conventions | Any code under `src/app/` (§2) |
| `/brainstorming` | Turning a fuzzy idea or an open problem into a decision | §4 gate 0, §6, `.agents/blueprints/prd.md` |
| `/prd` | Discovery interview, PRD quality bar | `.agents/blueprints/prd.md` |
| `/stitch-generate-design`, `/enhance-prompt`, `/stitch-react-components` | Wireframes and turning them into code | `.agents/context/frontend.md` → wireframing |
| `/stitch-*` (others), `/design-md` | Managing Stitch projects and design systems | Only when asked |
| `/frontend-design`, `/ui-ux-pro-max` | Aesthetic and UX direction | `.agents/context/frontend.md` → skills, design direction |
| `/web-haptics` | Haptics on every interactive element | `.agents/context/frontend.md` → skills |
| `/building-components`, `/shadcn-ui` | New components, primitives | §2, `.agents/context/frontend.md` → skills |
| `/design-motion-principles` | Motion, and auditing it | `.agents/context/frontend.md` → skills |
| `/web-design-guidelines` | UI audit before handoff | `.agents/context/frontend.md` → skills |
| `/guided-tour` | A tool's walkthrough | `.agents/blueprints/tool.md` → launch |
| `/humanizer` | Final pass on anything a person reads | `.agents/context/writing.md` |
| `/hyperframes`, `/remotion`, `/remotion-best-practices` | Launch videos, only if asked | `.agents/context/content-creation.md` (stub) |
| `/find-skills` | Finding a skill that isn't installed | When nothing above fits |
| Teaching skill | Walking the developer through what was built | **Planned** (§4 gate 7) |

A skill's generic template and a blueprint disagree → the blueprint wins.
