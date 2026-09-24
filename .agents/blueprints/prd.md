# PRD Blueprint

A PRD here is written for the **agents that will build it**. Every blank you leave becomes a
wrong guess later — a good PRD leaves no architectural decision open.

**Location:** `src/app/<area>/<tool>/PRD.md` — `<area>` is `platform`, `organisations` or
`admin`. A tool spanning areas uses the directory of its primary user-facing page.
**Exemplar:** `documentation/FORM_BUILDER_SPEC.md` — read its table of contents for shape, not
its body.

## Before writing

1. **Intent.** Fuzzy idea → `/brainstorming` first. Confirm:
   - tool name — kebab-case, Indian English spelling
   - `<area>`, who uses it (student / organisation / admin), the one job it does
   - overlap — `graphify query "<idea>"`. Extend an existing tool, or new?
2. **Ask, don't assume** — these block architecture:
   - **Strapi collection types** — existing or new, fields, relations. Mandatory; see the data
     layer section of `.agents/context/architecture.md`.
   - Live updates needed, or is load-on-open fine?
   - Uploads, email, calendar, sheets?
   - Developer credits — names, profile URLs, roles.
3. Each section below is governed by a blueprint — `.agents/context/backend.md`'s table says
   which. Read that blueprint's rules before deciding that section.

## Skeleton

Tables over prose. Each section as short as it can be while still being decisive. Section
doesn't apply → write "n/a" so the builder knows it was considered.

```markdown
# <Tool name> — PRD
> Status: draft | approved | shipped · Area: <area> · Owner: <name>

## 1. Summary          problem · who · the one job · success metric
## 2. Users & access   roles, who sees/does what — in terms of auth.md's access values
## 3. Flows            numbered user flows, happy path first, then edge cases
## 4. Screens          per screen: purpose, primary action, states (loading/empty/error),
                       mobile vs desktop differences
                       Wireframe: yes/no · Stitch project link + screen IDs
## 5. Data             Strapi collection types — fields, types, relations; new vs existing
## 6. API contract     per route: path, method, access, request, response, error codes
## 7. Live data        none | why realtime is needed + clients × events × payload estimate
## 8. Caching & cost   per dataset: shared vs per-user, how stale it may be, expected volume
## 9. Integrations     Cloudinary / Google Workspace / mail — what and why
## 10. Launch          sidebar category, tour, new-tool banner/alert, what's-new entry, credits
## 11. Milestones      - [ ] M1 — <scope> · acceptance: <criteria>   (ticked during the build)
## 12. Out of scope    and open questions
```

## After writing

Ask whether a wireframe is needed (`CLAUDE.md`). Then an implementation plan, confirmed with the
user, before any code — `.agents/blueprints/tool.md`.
