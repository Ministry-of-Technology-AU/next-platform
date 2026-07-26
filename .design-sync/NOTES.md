# design-sync notes — Ashoka Platform Design System

## Repo shape
This repo (`platform-revamp`) is the Next.js app itself, not a published component
package — there is no `dist/`, no `main`/`module`/`exports` in `package.json`, and no
Storybook. The sync runs in the package shape's synth-entry ("no dist") mode, scanning
`src/components` directly.

## `cfg.pkg: ".."` — why
`package-build.mjs` always derives `PKG_DIR = join(NODE_MODULES, PKG)`. Several fields
(`cssEntry` especially) are bounded to `realpath(PKG_DIR)` and reject anything reached
via a symlink pointing outside it — so a `node_modules/<name>` stub with a symlinked
`src/` (the obvious first attempt) fails `cssEntry`'s containment check, and a symlink
placed *inside* `node_modules` that points back at the repo root creates a real
filesystem cycle (`node_modules/<pkg>/node_modules/<pkg>/...`) that crashes ts-morph's
`.d.ts` directory walk with `ENAMETOOLONG` — the `!**/node_modules/**` glob exclusion in
`lib/dts.mjs` does not protect against a genuine symlink loop.
Setting `"pkg": ".."` makes `PKG_DIR = join(<repo>/node_modules, "..")`, which
`path.join` normalizes straight back to the repo root itself — a real path, no symlink,
no cycle. This makes `PKG_DIR` == the actual repo root, so `cssEntry`/`tsconfig` resolve
naturally. Cosmetic side effect: the build banner prints `» ..@0.1.0 → ...` — harmless,
console-only.
**Re-sync risk**: if the tool's PKG_DIR/cssEntry containment logic changes, re-verify
this trick still works before trusting a clean build silently.

## `cssEntry` requires a compile step — `.design-sync/compile-css.mjs`
`src/app/globals.css` is Tailwind v4 source (`@import "tailwindcss"`, `@theme {...}`),
not compiled CSS — pointing `cssEntry` at it directly fails validate with
`[CSS_IMPORT_MISSING]` (`tailwindcss`/`tw-animate-css` don't exist as real files).
`.design-sync/compile-css.mjs` runs `postcss` + `@tailwindcss/postcss` (already repo
deps) to compile `src/app/globals.css` → `.ds-sync/compiled/globals.css` (gitignored,
regenerated). **Run `node .design-sync/compile-css.mjs` before every
`package-build.mjs` run** — it is this repo's de facto `buildCmd` for the CSS layer.
No full `next build` was needed or used.

## Fonts — `.design-sync/fonts/`
The app loads Nunito / Nunito Sans via `next/font/google` (`src/app/layout.tsx`), which
self-hosts at Next's own build time — nothing to point `extraFonts` at directly, and
`[FONT_MISSING]` fired for both families. Fetched the actual latin + latin-ext woff2
files straight from `fonts.googleapis.com`/`fonts.gstatic.com` (weights 400/700/800 for
Nunito, 400/600/700 for Nunito Sans) into `.design-sync/fonts/` (committed, durable) and
wired via `cfg.extraFonts: [".design-sync/fonts/fonts.css"]`. Regenerate via
`/tmp/nunito.css` fetch + `.ds-sync/fetch-fonts.mjs` pattern if the app's font
weights/families ever change (that script itself was scratch, not preserved — rewrite
if needed, or ask the user before re-fetching).
**Known, accepted warn**: `[FONT_MISSING] "Cambria"` — this is Tailwind v4's own default
`--font-serif` fallback stack (`ui-serif, Georgia, Cambria, ...`), emitted even though
the DS's `@theme` never sets `font-serif` and no component uses it. Cambria is a common
system font; not chased.

## Next.js-runtime dependent components (user-approved scope: "broader", include composed)
**Superseded by the "Bundle-fatal `process is not defined` crash" section below** —
8 of these turned out to be worse than "won't render standalone": they crashed the
*entire shared bundle* (not just their own card) and are now excluded from the sync
entirely via `.design-sync/scope-src.mjs`, not merely expected-floor-cards. Only
`new-tool-alert.tsx` and `landing-page/recent-page-tracker.tsx` remain unconfirmed
either way — they weren't independently implicated in the crash (no next/image,
next/link, or next-auth/react import found), but haven't been positively verified
safe either; check them if/when they're scoped for authoring.

## Providers
`cfg.provider` chains `NextAuthProvider` (repo's own `src/components/providers/session-provider.tsx`,
wraps `next-auth/react`'s `SessionProvider` with no session prop — will attempt a client
fetch to `/api/auth/session`, which 404s harmlessly in the preview sandbox and falls
back to unauthenticated) → `ThemeProvider` (repo's own custom context provider at
`src/components/providers/theme-provider.tsx`, NOT next-themes — props are
`defaultTheme`/`storageKey`, no `attribute` prop). Both are excluded from the component
list via `componentSrcMap: {"NextAuthProvider": null, "ThemeProvider": null}` since
they're infra wrappers, not visual components. `ClientOnly` (SSR-guard utility,
`src/components/client-only.tsx`) is excluded the same way.
`[PROVIDER_UNVERIFIED]` on `NextAuthProvider` is expected/non-blocking — a bundled CJS
re-export the evidence pass can't enumerate; confirmed correct name against source.

## Grouping
Most components (225/238) landed in the `general` group because they live directly
under `src/components/ui/` (a name in the tool's generic-dir exclusion list) with no
further subfolder — the grouping heuristic has nothing more specific to key off. Only
`navbar`, `sidebar`, `data-table`, `landing-page`, `apl`, `shadcn-io` got real group
names (their own subfolder names). Not fixed this run — would need per-component
`docsMap`/JSDoc `@category` tags, high effort for 225 components. Acceptable trade-off;
revisit if the DS pane's flat "general" bucket proves unusable in practice.

## Preview authoring scope (user decision)
User chose "core ~30-40 components" for authored previews; the remaining ~200 (mostly
compound sub-parts like `AccordionContent`/`AccordionItem`/`AccordionTrigger`, and
Next-runtime-dependent composed components) ship fully functional with the honest floor
card, authorable incrementally on a future re-sync.

## Bundle-fatal `process is not defined` crash — scoped-src mechanism

Discovered via real headless Chrome (puppeteer-core against the user's own
installed Google Chrome, not a playwright download — see below) that the
built `_ds_bundle.js` crashed on load for **every single component**, not
just newly authored ones: `ReferenceError: process is not defined`. This had
been invisible the whole first pass because the user deferred installing
Playwright, so `package-validate.mjs`'s render check never actually loaded a
page in a browser — `[RENDER_SKIPPED]` was silently accepted every time.

**Root cause**: in synth-entry mode, `.pkg-entry.mjs` does
`export * from "<path>"` for **every** `.tsx`/`.jsx` file under `cfg.srcDir`,
unconditionally — `componentSrcMap: {Name: null}` only removes a name from
the *component list*, it does NOT stop that file's module code from being
bundled and evaluated. Several files import Next.js internals
(`next/image`, `next/link`, `next-auth/react`) that read `process.env.*` in
**module-top-level** code (not inside a function) — browsers have no
`process` global, so the first such statement encountered during the
bundle's IIFE evaluation throws and halts everything before
`window.AshokaDS` is ever assigned. One repo file (`apl/knockout-bracket-tree.tsx`)
has the same problem directly (`const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL`).

The clean general fix (an esbuild `inject` shim for `process` in
`.ds-sync/lib/bundle.mjs`) was **not** taken — the skill explicitly forbids
forking `lib/bundle.mjs`/`lib/emit.mjs` (they define the app self-check's
bundle contract). User chose to narrow scope instead of forking.

**Fix**: `.design-sync/scope-src.mjs` (durable, committed, run before every
`package-build.mjs` — same pattern as `compile-css.mjs`) mirrors
`src/components/` into `.design-sync/.cache/scoped-src/` (gitignored), minus
the files below, and `cfg.srcDir` points at the mirror instead of the real
tree. It also overwrites `providers/session-provider.tsx` in the mirror with
a preview-only stub (`NextAuthProvider` that just renders `{children}`,
**named** export not default) — the real one is unavoidable (it's
`cfg.provider`'s outer wrapper for every single preview) and its
`next-auth/react` import has the exact same module-top-level
`process.env.NEXTAUTH_URL`/`VERCEL_URL` crash. This also incidentally fixes a
separate latent bug: the real file is `export default function
NextAuthProvider`, and `export *` never re-exports defaults, so
`window.AshokaDS.NextAuthProvider` would have stayed `undefined` even with
the crash fixed.

**Files excluded from the sync entirely** (confirmed module-top-level
`process.env` crash via their own code or a Next-internal they import;
`componentSrcMap: null` also set for each so they don't appear as
zero-content stubs in the component list):

| File | Component(s) lost | Why |
|---|---|---|
| `apl/knockout-bracket-tree.tsx` | KnockoutBracketTree | own top-level `process.env.NEXT_PUBLIC_STRAPI_URL` |
| `sidebar/app-sidebar.tsx` | AppSidebar | imports `next/image` + `next/link` |
| `landing-page/platform-carousel.tsx` | PlatformCarousel | imports `next/image` |
| `landing-page/popular-tools-grid.tsx` | PopularToolsGrid | imports `next/link` |
| `landing-page/recently-visited.tsx` | RecentlyVisited | imports `next/link` |
| `navbar/navbar.tsx` | Navbar | imports `next/link` |
| `whats-new-modal.tsx` | WhatsNewModal | imports `next/link` |
| `sign-out-button.tsx` | SignOutButton | imports `next-auth/react` directly |

This drops the `apl` and `navbar` groups to zero components and the
`sidebar`/`landing-page` groups down to whatever's left. **`AppSidebar` and
`Navbar` were both on the original core-40 authored-preview list — they can
no longer be synced at all**, not just deferred; core list needs updating.
Every file above imports `next/navigation` too (not just `next/image`/`next/link`)
but that wasn't independently confirmed as a separate crash source since the
`next/link`/`next/image` exclusion already covered every file that had it —
if a *future* component only imports `next/navigation` (no image/link), test
it before assuming it's safe.

**Verified fixed** (via puppeteer-core + the user's real Google Chrome —
installed to `.ds-sync/node_modules/puppeteer-core`, zero browser download
since it drives the existing system Chrome, not a new one): `window.AshokaDS`
evaluates cleanly post-fix, 230 exports, `NextAuthProvider`/`ThemeProvider`/
`Button` all resolve as real functions, and all 4 solo-authored previews
(Button, Dialog, DatePicker, RichTextEditor) render with real Tailwind/shadcn
styling, no console errors, no `⚠` fallback cards.

## Re-sync risks
- `.design-sync/scope-src.mjs` must be re-run before every `package-build.mjs`, same as
  `compile-css.mjs` — it regenerates `.design-sync/.cache/scoped-src/` (gitignored) from
  the live `src/components/`. If a *new* component ever imports `next/image`, `next/link`,
  or `next-auth/react` (or otherwise reads `process.env.*` at module top level), it will
  silently reintroduce the bundle-fatal crash above — nothing currently catches this except
  actually loading the bundle in a real browser (playwright, or puppeteer-core against
  system Chrome as done this run). Re-verify after adding any new composed component.
- `.design-sync/compile-css.mjs` must be re-run before every `package-build.mjs` — it's
  not wired as `cfg.buildCmd` (that field expects a single shell command; this is a
  standalone step). Remember it by hand, or start wrapping both in a tiny script.
- The `pkg: ".."` trick depends on `package-build.mjs`'s current PKG_DIR/containment
  logic — re-verify after any design-sync skill version bump.
- Fonts are a point-in-time fetch from Google Fonts; if the app's `next/font/google`
  weight/family selection changes, `.design-sync/fonts/` goes stale silently (no
  automated check ties it back to `layout.tsx`).
