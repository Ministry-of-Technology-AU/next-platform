# Tool Blueprint

A tool = collection types + routes + pages + launch surfaces, shipped against a PRD. This file
is the order of operations; each phase points at the blueprint that does the work. Check in with
the user at the end of every phase — a tool is long and drift compounds.

## SPEC
1. `PRD.md` in the tool directory. None → write one (`.agents/blueprints/prd.md`). User wants to
   skip → still capture a minimal one; milestones need a home.
2. Wireframe wanted? → `.agents/context/frontend.md`, wireframing section.
3. **Implementation plan — confirm before any code:**
   - collection types with exact fields (the user creates them in Strapi)
   - routes, pages, and where each goes (codebase structure section of
     `.agents/context/architecture.md`)
   - shared vs tool-local components
   - milestone order — backend before frontend

## BACKEND
Per route → `.agents/blueprints/route.md`, plus the blueprints it points to (auth, Strapi,
caching, realtime). Tick PRD milestones as they land.

## FRONTEND
Per page → `.agents/blueprints/page.md` + `.agents/context/frontend.md`. Tick milestones.

## LAUNCH MARKETING
1. Guided tour — `/guided-tour`, and the guided tour section of `.agents/blueprints/components.md`.
2. **Only when the user says it's ready to ship:** new tool banner, new tool alert, what's-new
   entry, sidebar — each per its section in `.agents/blueprints/components.md`. Sidebar entries
   live in `src/components/sidebar/platform.ts`; restricted tools also need `src/middleware.ts`
   (`.agents/blueprints/auth.md`).
3. Launch video, only if asked → `.agents/context/content-creation.md`.

## CLOSE OUT
- Typecheck + build (a tool always crosses the 50-line build threshold in `AGENTS.md` §1 → verification).
- PRD status → shipped, all milestones ticked or explicitly deferred.
- Offer feature docs → `.agents/blueprints/documentation.md`.
