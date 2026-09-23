# Induction Form Builder — Build Progress Checklist

> Living checklist for the implementation described in [FORM_BUILDER_SPEC.md](./FORM_BUILDER_SPEC.md).
> **How to resume:** find the first unchecked `[ ]` item, read the spec section noted next to its milestone, and continue. Each milestone must leave `npm run build` green.
> Legend: `[x]` done · `[~]` in progress · `[ ]` not started.

## Status: all 7 milestones code-complete ✅ · `npm run build` green · `tsc --noEmit` 0 errors
**What's left = live verification only** (needs the two Strapi collections created + a logged-in `@ashoka.edu.in` session). No code is blocked. See each milestone's "Verify (deferred)" line and the Environment section below.

## Decisions locked in
- Builder lives under **`/organisations/forms`** (the existing "Inductions" sidebar entry now points here).
- Filler lives under **`/platform/forms/[formId]`** (reached via share link; no sidebar entry).
- New deps installed: `zod`, `isomorphic-dompurify`, `server-only`. ✅
- Public form id = `form_uid` (uuid). Numeric Strapi ids never reach the browser.
- Response shape everywhere: `{ success, data | error }`.

## Environment / one-time (outside this repo)
- [ ] Create Strapi `form` collection type (spec §6.1) + inverse `forms` relation on `organisation`.
- [ ] Create Strapi `form-response` collection type (spec §6.2).
  *(These block M2 runtime testing but not code authoring. JSON schemas are paste-ready in spec §6 and mirrored in `documentation/strapi-schemas/`.)*

---

## M1 — Schema core  (spec §3, §4, §5)  — foundation, no UI ✅
- [x] `src/lib/forms/schema.ts` — types + `FORM_SCHEMA_VERSION` + `INPUT_BLOCK_TYPES`
- [x] `src/lib/forms/theme.ts` — `FormTheme`, `defaultTheme`, `CURATED_FONTS`, `themeToCssVars()`, `buildFontHref()`
- [x] `src/lib/forms/conditions.ts` — pure `evaluateRule/RuleGroup`, `visiblePages/Blocks`, `visibleInputBlockIds`
- [x] `src/lib/forms/defaults.ts` — `createDefaultSchema()`, `createBlock(type)`
- [x] `src/lib/forms/validator.ts` — `formSchemaValidator` (zod) + `buildResponseValidator()`
- [x] Verify: 26/26 scratch checks pass (default ok; dup ids / forward refs / bad hex / bad font / oversize rejected; condition engine normative cases; response validator strips unknown keys)

## M2 — Strapi + org CRUD  (spec §6, §7.1, §7.4, §14) ✅
- [x] `documentation/strapi-schemas/` — paste-ready `form` + `form-response` JSON + README
- [x] `src/lib/forms/sanitize.ts` — `sanitizeHtml`, `sanitizeFormSchema()`, `sanitizeResponseRichText()` (DOMPurify, `server-only`)
- [x] `src/lib/forms/strapi-forms.ts` — `server-only` data access: `getFormByUid`, `getFormByUidCached`, `createForm`, `updateForm`, `deleteFormCascade`, `isFormActive`, `hasExpired`, `flipToInactive`, `bumpStats`, response helpers
- [x] `src/lib/forms/api-helpers.ts` — `requireOrgSession()`, `resolveOrgForm()`, `rateLimit`, `csvEscape`, jsonOk/jsonError
- [x] `src/app/api/organisations/forms/route.ts` — GET list, POST create
- [x] `src/app/api/organisations/forms/[formId]/route.ts` — GET, PUT (+`?beacon=1` POST alias), DELETE
- [x] `src/app/api/organisations/forms/[formId]/responses/route.ts` — GET list + `?format=csv`
- [x] Sidebar: "Inductions" entry now → `/forms`
- [x] Verify: `npm run build` green; `tsc --noEmit` 0 errors; 3 forms routes compiled

## M3 — Filler read path  (spec §7.2 GET, §7.4, §9, §5.2) ✅ (code-complete)
- [x] Shared renderer in `src/components/forms/`: `form-renderer.tsx`, `block-input.tsx`, `display-blocks.tsx`, `file-upload-field.tsx`, `form-theme-root.tsx`
- [x] `src/app/api/platform/forms/[formId]/route.ts` — cached GET, active check, lazy inactive flip, uniform 404
- [x] `src/app/platform/forms/[formId]/page.tsx` — server fetch, `notFound()`, Google Font `<link>`s
- [x] `src/app/platform/forms/[formId]/client.tsx` — `loading → filling → previewing → submitted/already` machine
- [x] `_components/`: `page-navigator.tsx`, `submission-preview.tsx`, `confirmation-screen.tsx`
- [x] Condition-driven visibility + per-page validation (reuses `buildResponseValidator` per visible page)
- [x] Bonus: 3-way autosave client logic already wired in filler (manual/60s/beacon+localStorage) — **needs M5 routes to persist**
- [ ] Verify (deferred): live render of all 17 block types needs Strapi + logged-in browser session; build + tsc green here

## M4 — Builder UI  (spec §8) ✅ (code-complete) — frontend-design + ui-ux-pro-max applied
- [x] `src/app/organisations/forms/page.tsx` + `client.tsx` + `types.ts` — forms list + stat chips + empty state
- [x] `_components/form-card.tsx`, `new-form-dialog.tsx`
- [x] `[formId]/edit/page.tsx` + `client.tsx` + `editor-reducer.ts` — 3-pane shell + reducer + save-state + undo (Cmd+Z) + share link
- [x] `_components/block-palette.tsx` (grouped click-to-add)
- [x] `_components/builder-canvas.tsx` (dnd-kit: Pointer+Touch+Keyboard sensors, DragOverlay) + `block-preview.tsx`
- [x] `_components/block-inspector.tsx` + `inspector-fields.tsx` + `block-meta.ts` (per-type config, Content/Logic tabs)
- [x] `_components/condition-editor.tsx` (operator allowlist per source type; no-forward-ref enforced)
- [x] `_components/page-tabs.tsx` (add/rename/reorder/delete + page-level conditions)
- [x] `_components/theme-editor.tsx` (colors, Google Fonts, weights/italic, radius, button style + live swatch)
- [x] `_components/form-settings.tsx` (status, dates, confirmation rich text, submit text, toggles)
- [x] `_components/builder-preview.tsx` (imports the shared filler renderer → preview ≡ filler)
- [x] 3-way save (manual / 60s debounce / beacon `?beacon=1`) + localStorage restore prompt + `revalidateTag` (server-side in updateForm)
- [ ] Verify (deferred): live 2-page conditional form via UI needs Strapi + logged-in session; build + tsc green here

## M5 — Responses & drafts  (spec §7.2, §7.5, §10, §13) — server + client done
- [x] `src/app/api/platform/forms/[formId]/visit/route.ts` — idempotent visit + stats
- [x] `src/app/api/platform/forms/[formId]/response/route.ts` — GET / POST(draft, beacon-safe) / PUT(submit)
- [x] Filler 3-way autosave + localStorage mirror + reconcile (in `client.tsx`)
- [x] Mandatory preview step + confirmation + already-submitted screen
- [x] `stats` bumping via `bumpStats()`; one-per-user lock (409 `alreadySubmitted` on resubmit)
- [ ] Verify (deferred): needs Strapi — draft survives tab close/restart; submit locks; 409; stats move

## M6 — Uploads + email + theming  (spec §11, §12, §5) — uploads+email done; theme editor in M4
- [x] `uploadRawToCloudinary()` + `resourceType`-aware delete added to `src/lib/apis/cloudinary.ts`
- [x] `src/app/api/platform/forms/[formId]/upload/route.ts` — POST + DELETE, MIME/ext/size/count checks
- [x] `FileUploadField` wrapper with upload-on-select + progress + descriptor storage (`components/forms/file-upload-field.tsx`)
- [x] `src/lib/forms/email.ts` — `buildResponseEmailHtml()` (`server-only`), sent fire-and-forget from submit
- [ ] Theme editor UI (built in M4) + scoped CSS vars live on filler + preview ✅ (vars/fonts done in M3)
- [ ] Verify (deferred): image + PDF upload within limits; respondent gets formatted email; theme restyles filler only

## M7 — Org responses view + hardening  (spec §7.1, §14) ✅ (code-complete)
- [x] `[formId]/responses/page.tsx` + `client.tsx` + `_components/response-table.tsx`, `response-detail.tsx`
- [x] CSV export (csvEscape formula-injection guard) wired to UI (Export CSV button)
- [x] Full §14 checklist audit — grep-verified: auth ×7 routes, `server-only` ×4 libs, 4 rate limiters, sanitize save+submit, cloudinary/font/https guards, 512KB draft cap + key strip, uniform 404 ×3, CSV guard
- [x] Org list + responses page stat cards (visits/drafts/submissions/completion)
- [ ] Verify (deferred): live §14 violation attempts + CSV open in spreadsheet need Strapi + auth

---

## Notes / gotchas discovered during build
- `TextInput` requires non-optional `title` + `placeholder`; `type` supports text/email/password/number/datetime-local.
- `DatePicker` value is a `Date`; `DateTimePicker` value is an ISO string. Store ISO in `data`, convert at the boundary.
- `getOrganisationIdByUserId` reads `response.data` (Strapi wrapped); `getUserIdByEmail` reads flat `/users` array.
- Org pages already gated to role `organization` by `middleware.ts`; `/api/organisations/*` must self-check.
- Platform pages already login-gated by `middleware.ts` (`/platform/:path*`).
