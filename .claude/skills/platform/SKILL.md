---
name: platform
description: Orchestrator for building anything in next-platform — routes the agent to exactly the .agents/ context it needs and no more. Workflows - prd (write a PRD for a new tool/feature), wireframe (Stitch screens before code), page (design + build a page under src/app), route (design + build an API route under src/app/api), tool (end-to-end new tool - PRD → routes → pages → launch), docs (developer docs for a shipped feature). Use this whenever the user wants to plan, spec, wireframe, scaffold, build, extend or document a tool, page, screen, API endpoint or feature in this repo — even if they don't say "platform" or name a workflow, e.g. "let's add a lost-and-found tool", "need an endpoint for org stats", "write up how inductions works", "make a PRD for pool cab v2".
argument-hint: "<prd|wireframe|page|route|tool|docs> [name or brief]"
---

# Platform

You are the orchestrator. Everything you need is in `.agents/context/` (guidelines) and
`.agents/blueprints/` (templates + contracts). This skill only tells you **which** of it to load,
**when**, and in what order. Follow what those files say now — they change; this router doesn't
restate them.

## Loading protocol

1. **Lazily.** Load each item at the step that needs it — never all upfront.
2. **By section.** `→ section` means: `grep -n '^#' <file>`, then Read only the matching range.
   Match headings by meaning; they get renamed. No section named → the file is short, read it.
3. **Code via graphify.** `graphify query "<q>"` / `explain "<x>"` / `path "<A>" "<B>"` before
   grep. `GRAPH_REPORT.md` only if those fall short.
4. **Skills come from the docs.** `frontend.md`'s skills section says which to load for UI work.
   Load a skill's `SKILL.md` only; go deeper only when it says to.
5. **Stubs don't block.** Empty / STUB / missing / dangling reference → fall back to graphify +
   the reference implementation the blueprint names, keep going, report the gap at the end.
6. **Conflicts.** Two docs disagree → the blueprint for the artifact you're producing wins
   (`page.md` for pages, `route.md` for routes). Say which conflict you hit.
7. **Tool-local state.** `PRD.md` / `README.md` in the tool's directory is the spec / current
   state. `CLAUDE.md` names a doc for the feature area → read it.

## Workflows

Argument given → use it. Else infer; if two fit, ask. `tool` runs the others — don't stack them.

### `prd`
1. `blueprints/prd.md` — whole. It covers intent, what to ask, skeleton, location.
2. While deciding each PRD section → the blueprint it maps to, via `context/backend.md` → where
   things live. Rules sections only.
3. `context/architecture.md` → data layer, hosting.

### `wireframe`
1. `PRD.md` → screens, flows.
2. `context/frontend.md` → wireframing (the procedure), then responsiveness if mobile is unclear.
3. `context/design.md` → the Stitch generation section.

### `route`
1. `PRD.md` → API contract, data.
2. `blueprints/route.md` — whole. The contract + its reference implementation.
3. `context/backend.md` → where things live. Then, only for concerns this route touches:
   `blueprints/auth.md` (always) · `blueprints/strapi.md` → the query sections you use ·
   `blueprints/caching.md` → rules, then the tier they point your data at ·
   `blueprints/realtime.md` → rules first · Google/Cloudinary guides.
4. Before writing a helper → `context/libraries.md` + `ls src/lib`.
5. Env keys → `context/architecture.md` → environment. By name only.

### `page`
1. `PRD.md` → screens, data. Data route missing → run `route` first.
2. `blueprints/page.md` — whole. Then from its reference implementation, only `page.tsx` /
   `layout.tsx`, and `src/app/<area>/layout.tsx`.
3. `context/frontend.md` → skills, what-to-reference, rules. Its tables decide what else loads
   (`design.md`, tokens, hooks…).
4. **Plan → confirm with the user** (file tree, server/client split, reused vs new components,
   states) before code.
5. Placing a platform component → `blueprints/components.md` → **only that component's section**.
6. Before handing off → `context/frontend.md` → before-handing-off checklist. Then offer
   `/guided-tour`.

### `tool`
`blueprints/tool.md` — whole. It sequences spec → backend → frontend → launch → close out and
points at every other blueprint. Run `prd` / `wireframe` / `route` / `page` above when it says
to. Check in with the user at every phase boundary.

### `docs`
`blueprints/documentation.md` — whole. File list from graphify, not browsing.

## Close out — every workflow

The frontend/backend docs defer these to you:
- Code changed → `npm run typecheck`. Fix what you caused; report what you didn't.
- \> 50 lines changed → `npm run build`.
- Never `graphify update` — re-indexing is a deploy step.
- Finish with: what was built, files touched, doc gaps hit (protocol 5), next workflow to run.
