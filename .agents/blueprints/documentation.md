# Feature Documentation Blueprint

Developer & agent docs for a feature that **exists**. Describe what is built, not what was
planned. Goal: someone can work on the feature without re-deriving it from code.

**Location:** `src/app/<area>/<tool>/README.md`, beside the tool's `PRD.md`.

## Gathering — read contracts, not implementations

1. **File list from graphify**, not from browsing:
   `graphify explain "<feature>"`, then
   `graphify query "which routes, pages and lib files make up <feature>"`.
2. From that list only:
   - the tool's `types.ts`
   - each `route.ts` — methods and access checks; `helper.ts` → `grep -n '^export'`
   - each `page.tsx` — which surfaces exist, who reaches them
   - `src/lib/<feature>/` if it exists → exports only
3. Open a function body only to explain something non-obvious — an invariant, a gotcha.
4. `PRD.md` present → compare; note where the build deviated.
5. Feature spans areas (e.g. `/admin` + `/organisations` + `/platform`) → confirm scope with the
   user first.

## Skeleton

```markdown
# <Feature>: Developer & Agent Guide
## 1. Overview        what it does, who uses it, surfaces (path → who)
## 2. Data model      Strapi collection types + key types in types.ts
## 3. API             table: path · method · access · purpose
## 4. Key files       path → one-line responsibility
## 5. Flows           main flows step by step, naming the files involved
## 6. Gotchas         invariants, non-obvious behaviour, known bugs
## 7. Deviations      where the build differs from PRD.md (omit if no PRD)
## 8. Next steps      open TODOs
```

## Writing style

`.agents/context/writing.md`, including its `/humanizer` final pass. No em dashes.

## After writing

Ask whether `CLAUDE.md` should point agents at this README for the feature area, like its
existing feature-doc pointers.
