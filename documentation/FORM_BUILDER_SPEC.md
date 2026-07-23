# Induction Form Builder — Implementation Spec

> **Audience:** coding agents implementing this feature on the `next-platform` codebase.
> **Deliverable:** a Fillout-style, block-based, fully themeable induction form builder for organisation accounts, plus a form-filling experience for all logged-in platform users.
> **Status of this doc:** authoritative. Where this spec conflicts with your instinct, follow the spec. Where the spec is silent, follow existing codebase conventions (see §1.2).

---

## 0. Table of contents

1. System context & hard rules
2. Routes & feature layout
3. Form schema — the single source of truth
4. Conditional logic engine
5. Theming (colors + Google Fonts)
6. Strapi collection types (paste-ready)
7. API contract
8. Builder UX
9. Filler UX
10. Partial saves, autosave & caching
11. File uploads (Cloudinary)
12. Confirmation email
13. Stats
14. Security checklist (mandatory)
15. Milestones & acceptance criteria
16. Do-NOT-do list

---

## 1. System context & hard rules

### 1.1 Stack (verified)

| Concern | What this codebase uses | Where |
|---|---|---|
| Framework | Next.js **15.5** App Router, React 19 | `src/app/` |
| Auth | NextAuth v5 (`next-auth@5.0.0-beta.29`), Google, JWT strategy, `@ashoka.edu.in` only | `src/auth.ts`, `src/lib/auth.ts` |
| Backend | **Strapi v4** (numeric `id`, `{ data: {...} }` write wrapping, defensive `attributes` reads) | `src/lib/apis/strapi.ts` |
| Mail | nodemailer via `sendMail()` (html + alias support) | `src/lib/apis/mail.ts` |
| Images | Cloudinary server SDK, webp + `quality: auto:good` | `src/lib/apis/cloudinary.ts` |
| Drag & drop | `@dnd-kit/core@6`, `@dnd-kit/sortable@10` | pattern: `src/app/platform/trajectory-planner/_components/course-planner-board.tsx` |
| Rich text | Tiptap v3 (`StarterKit` only) | `src/components/editor.tsx`, `src/components/ui/shadcn-io/minimal-tiptap/` |
| Styling | Tailwind v4 (config in `src/app/globals.css` `@theme`), class-based dark mode via `next-themes` | `src/app/globals.css` |
| Fonts | `next/font/google`: Nunito (`--font-heading`), Nunito Sans (`--font-body`) | `src/app/layout.tsx` |
| Toasts | `sonner` | everywhere |
| IDs | `uuid@13` | already a dependency |

**New dependencies allowed by this spec (and only these):**
- `zod` — server-side validation of form schemas and response payloads.
- `isomorphic-dompurify` — sanitizing org-authored HTML.

### 1.2 Conventions you MUST follow

- **Page structure:** `page.tsx` (async **server component** that fetches initial data and renders `<PageTitle/>`) + `client.tsx` (`'use client'`, all interactivity) + `_components/` (feature-local, kebab-case files) + `types.ts`. See `src/app/platform/borrow-assets/` as the reference implementation.
- **API responses:** `NextResponse.json({ success: true, data }, { status: 200 })` on success; `NextResponse.json({ success: false, error: '<message>' }, { status })` on failure. Status codes: 400 bad input, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict, 500 caught exception.
- **Auth in API routes:** `const session = await auth()` from `@/auth`; resolve Strapi user with `getUserIdByEmail(email)` from `@/lib/userid`; resolve the org with `getOrganisationIdByUserId(userId)`. Never trust client-supplied user or organisation IDs.
- **Strapi writes:** wrap in `{ data: { ... } }`, use numeric ids in URL paths (`strapiPut('/forms/12', { data })`), set relations by numeric id (`organisation: organisationId`).
- **Strapi reads:** read defensively — `entry.attributes?.field ?? entry.field` (the codebase supports both nested and flat shapes; see `src/app/api/platform/semester-planner/drafts/route.ts`).
- **Middleware:** `/organisations/:path*` pages are already gated to role `organization` in `src/middleware.ts` — do **not** modify the middleware; API routes under `/api/organisations/*` must self-check role in the handler (middleware does not cover them).
- **Design tokens:** use existing Tailwind v4 semantic tokens (`bg-primary`, `text-muted-foreground`, `border-input`, `text-destructive`, etc.). Never hardcode hex values in components (form themes are the one exception — they are injected as scoped CSS variables, §5).

---

## 2. Routes & feature layout

### 2.1 Pages

| Route | Who | Purpose |
|---|---|---|
| `/organisations/forms` | org role | List the org's forms with stats cards (visits, drafts, submissions, status), "New form" button |
| `/organisations/forms/[formId]/edit` | org role | The block-by-block builder (canvas + palette + inspector + theme editor + settings) |
| `/organisations/forms/[formId]/responses` | org role | Response table (submitted + drafts count), per-response detail view, CSV export |
| `/platform/forms/[formId]` | any logged-in user | Fill the form. Renders `notFound()` if the form is not active (§7.4) |

### 2.2 File layout to create

```
src/lib/forms/
  schema.ts            # FormSchema TS types + FORM_SCHEMA_VERSION (shared, no server-only imports)
  validator.ts         # zod schemas: formSchemaValidator, responseDataValidator factory
  conditions.ts        # evaluateRuleGroup(), visibleBlocks(), visiblePages() — pure functions
  theme.ts             # theme type, defaultTheme, themeToCssVars()
  sanitize.ts          # sanitizeFormSchema() — DOMPurify pass over all org-authored HTML/text
  email.ts             # buildResponseEmailHtml(form, response, user) — returns HTML string
  strapi-forms.ts      # server-only data access: getFormById (cached), saveForm, getResponse, upsertResponse, bumpStats

src/app/organisations/forms/
  page.tsx  client.tsx  types.ts
  _components/form-card.tsx  new-form-dialog.tsx
  [formId]/edit/
    page.tsx  client.tsx
    _components/block-palette.tsx  builder-canvas.tsx  block-renderer.tsx
                block-inspector.tsx  condition-editor.tsx  page-tabs.tsx
                theme-editor.tsx  form-settings.tsx  builder-preview.tsx
  [formId]/responses/
    page.tsx  client.tsx
    _components/response-table.tsx  response-detail.tsx

src/app/platform/forms/[formId]/
  page.tsx  client.tsx
  _components/form-renderer.tsx  block-input.tsx  page-navigator.tsx
              submission-preview.tsx  confirmation-screen.tsx

src/app/api/organisations/forms/
  route.ts                      # GET (list org forms), POST (create)
  [formId]/route.ts             # GET, PUT (save schema/settings), DELETE
  [formId]/responses/route.ts   # GET (list), + ?format=csv export
src/app/api/platform/forms/[formId]/
  route.ts            # GET — public (logged-in) form fetch, cached
  response/route.ts   # GET (my draft), POST (draft save — sendBeacon-compatible), PUT (final submit)
  upload/route.ts     # POST — file upload for this form
  visit/route.ts      # POST — unique-visit tracking
```

---

## 3. Form schema — the single source of truth

The entire form (pages, blocks, logic, theme, settings) is one JSON document stored in the Strapi `form.schema` JSON field. The frontend renders **exclusively** from this document. It is versioned so old forms keep working.

Define these types in `src/lib/forms/schema.ts` **exactly**:

```ts
export const FORM_SCHEMA_VERSION = 1;

// ---------- Conditions ----------
export type ConditionOperator =
  | 'equals' | 'notEquals'
  | 'contains' | 'notContains'      // string includes / array includes
  | 'isEmpty' | 'isNotEmpty'
  | 'greaterThan' | 'lessThan';     // numbers and dates (ISO strings compared as dates)

export interface ConditionRule {
  blockId: string;                  // must reference an INPUT block on an EARLIER page or same page
  operator: ConditionOperator;
  value?: string | number | boolean | string[];  // omitted for isEmpty/isNotEmpty
}

export interface RuleGroup {
  combinator: 'all' | 'any';
  rules: ConditionRule[];
}

// ---------- Blocks ----------
interface BlockBase {
  id: string;                       // uuidv4, generated client-side on block creation
  type: FormBlockType;
  visibleWhen?: RuleGroup;          // absent = always visible
}

// Display blocks (no answer value)
export interface TitleBlock       extends BlockBase { type: 'title';      text: string; level: 1 | 2 | 3; align: 'left' | 'center' | 'right'; }
export interface ParagraphBlock   extends BlockBase { type: 'paragraph';  html: string; }            // sanitized server-side
export interface DividerBlock     extends BlockBase { type: 'divider'; }
export interface ImageBlock       extends BlockBase { type: 'image';      url: string; alt: string; width: 'full' | 'half'; } // Cloudinary URL only
export interface SocialLinksBlock extends BlockBase { type: 'social-links'; links: { platform: 'instagram' | 'linkedin' | 'twitter' | 'website' | 'youtube' | 'discord'; url: string }[]; }

// Input blocks (produce an answer keyed by block id)
interface InputBlockBase extends BlockBase {
  title: string;                    // the question label
  subtitle?: string;                // helper text under the label
  placeholder?: string;
  required: boolean;
}

export interface ShortTextBlock extends InputBlockBase { type: 'short-text'; defaultValue?: string; validation?: { minLength?: number; maxLength?: number; pattern?: string }; }
export interface LongTextBlock  extends InputBlockBase { type: 'long-text';  defaultValue?: string; validation?: { minLength?: number; maxLength?: number }; }
export interface RichTextBlock  extends InputBlockBase { type: 'rich-text';  validation?: { maxLength?: number }; }   // answer is HTML, sanitized on submit
export interface EmailBlock     extends InputBlockBase { type: 'email';      defaultValue?: string; restrictToDomain?: string; }  // e.g. 'ashoka.edu.in'
export interface PhoneBlock     extends InputBlockBase { type: 'phone';      defaultCountryCode?: string; }
export interface NumberBlock    extends InputBlockBase { type: 'number';     defaultValue?: number; validation?: { min?: number; max?: number; integer?: boolean }; }
export interface CheckboxBlock  extends InputBlockBase { type: 'checkbox';   defaultValue?: boolean; }               // single consent-style checkbox
export interface SelectOption { value: string; label: string; }
export interface SelectBlock        extends InputBlockBase { type: 'select';         options: SelectOption[]; defaultValue?: string; }
export interface MultiSelectBlock   extends InputBlockBase { type: 'multi-select';   options: SelectOption[]; style: 'dropdown' | 'checkboxes'; defaultValue?: string[]; validation?: { minSelected?: number; maxSelected?: number }; }
export interface DateBlock          extends InputBlockBase { type: 'date';           defaultValue?: string; validation?: { minDate?: string; maxDate?: string }; }        // ISO date
export interface DateTimeBlock      extends InputBlockBase { type: 'datetime';       defaultValue?: string; }                                                             // ISO datetime
export interface FileUploadBlock    extends InputBlockBase { type: 'file-upload';    accept: 'images' | 'documents' | 'both'; multiple: boolean; maxFiles: number; maxSizeMB: number; } // maxSizeMB ≤ 10, maxFiles ≤ 5

export type FormBlock =
  | TitleBlock | ParagraphBlock | DividerBlock | ImageBlock | SocialLinksBlock
  | ShortTextBlock | LongTextBlock | RichTextBlock | EmailBlock | PhoneBlock | NumberBlock
  | CheckboxBlock | SelectBlock | MultiSelectBlock | DateBlock | DateTimeBlock | FileUploadBlock;

export type FormBlockType = FormBlock['type'];
export const INPUT_BLOCK_TYPES = ['short-text','long-text','rich-text','email','phone','number','checkbox','select','multi-select','date','datetime','file-upload'] as const;

// ---------- Pages ----------
export interface FormPage {
  id: string;                       // uuidv4
  title?: string;                   // shown in the page navigator / progress bar
  blocks: FormBlock[];              // render order = array order (drag & drop reorders this array)
  visibleWhen?: RuleGroup;          // page-level condition; hidden pages are skipped entirely
}

// ---------- Theme (see §5) ----------
export interface FontConfig { family: string; weight: 300|400|500|600|700|800|900; italic: boolean; }
export interface FormTheme {
  colors: { background: string; surface: string; text: string; textMuted: string; primary: string; primaryText: string; border: string; error: string; };
  fonts:  { heading: FontConfig; body: FontConfig; button: FontConfig; };
  radius: number;                   // px, 0–24
  buttonStyle: 'solid' | 'outline';
}

// ---------- Settings ----------
export interface FormSettings {
  confirmationTitle: string;        // default: "Response recorded"
  confirmationHtml: string;         // rich text, sanitized server-side; shown after submit
  submitButtonText: string;         // default: "Submit"
  sendEmailCopy: boolean;           // default: true — email the respondent their answers
  showProgressBar: boolean;         // default: true
}

// ---------- Root ----------
export interface FormSchema {
  schemaVersion: number;            // FORM_SCHEMA_VERSION at save time
  pages: FormPage[];                // min 1 page
  theme: FormTheme;
  settings: FormSettings;
}

// ---------- Response data ----------
// Keyed by input-block id. Value types per block type:
//   short-text/long-text/email/phone/select/date/datetime/rich-text → string
//   number → number | null; checkbox → boolean; multi-select → string[]
//   file-upload → { url: string; publicId: string; filename: string; bytes: number }[]
export type FormResponseData = Record<string, unknown>;
```

### 3.1 Zod validation (`src/lib/forms/validator.ts`)

Two exports, both used **server-side on every write**:

1. `formSchemaValidator: z.ZodType<FormSchema>` — a discriminated union on `type` mirroring the types above, with hard limits (defense against abuse): ≤ 20 pages, ≤ 60 blocks/page, ≤ 100 options/select, text fields ≤ 5,000 chars, `paragraph.html`/`confirmationHtml` ≤ 20,000 chars, ≤ 10 rules per `RuleGroup`. Also `superRefine` checks: all block/page ids unique; every `ConditionRule.blockId` references an existing input block; `pattern` strings must compile via `new RegExp()` inside a try/catch **and** be ≤ 200 chars (reject on failure); theme colors must match `/^#[0-9a-fA-F]{6}$/`; font family must be in the curated list (§5.2).
2. `buildResponseValidator(schema: FormSchema): (data: unknown, visibleInputBlockIds: Set<string>) => { ok: true; data: FormResponseData } | { ok: false; errors: Record<string, string> }` — validates a submission against the *form's own* definition: required visible blocks answered; select/multi-select values ∈ defined option values; per-block `validation` constraints enforced; keys not matching a visible input block **stripped** (never persisted); value types coerced/checked per the table in §3 above.

### 3.2 Forward compatibility

- The filler renderer must skip (render nothing for) any block whose `type` it does not recognise, and log a `console.warn`.
- Never migrate schemas in place on read. If `schemaVersion < FORM_SCHEMA_VERSION`, run pure upgrade functions in memory (v1 has none — just leave the hook: `upgradeSchema(schema): FormSchema`).

---

## 4. Conditional logic engine (`src/lib/forms/conditions.ts`)

Pure functions, no React, unit-testable:

```ts
evaluateRule(rule: ConditionRule, answers: FormResponseData): boolean
evaluateRuleGroup(group: RuleGroup | undefined, answers: FormResponseData): boolean  // undefined → true
visiblePages(schema: FormSchema, answers: FormResponseData): FormPage[]
visibleBlocks(page: FormPage, answers: FormResponseData): FormBlock[]
visibleInputBlockIds(schema: FormSchema, answers: FormResponseData): Set<string>
```

**Evaluation rules (normative):**

1. An unanswered block evaluates as: `isEmpty` → true; `isNotEmpty` → false; every other operator → false.
2. `contains` on a string answer = substring (case-insensitive); on `string[]` = array membership; on other types → false.
3. `greaterThan`/`lessThan`: if both sides parse as numbers, compare numerically; else if both parse as dates (`Date.parse`), compare as dates; else false.
4. `equals` on `string[]` = set equality is NOT used — it means "array has exactly this one selection" is NOT the semantics either; for `multi-select` use `contains`/`notContains`. `equals` on arrays → false. (The condition editor must therefore only offer valid operators per source block type — see §8.4.)
5. **Cascade rule:** visibility is computed from *raw answers*, but a hidden block's answer is excluded from validation and from the submitted payload (stripped server-side, §3.1). Do not delete the user's value from client state when a block hides — if it re-shows, the value returns. This avoids destructive cascades while keeping submissions clean.
6. **No forward references:** the builder must prevent a condition from referencing a block on a *later* page (same page is allowed). The zod validator enforces this too.
7. If every page is hidden by conditions, the filler shows the last visible state and the submit action fails validation with a clear error — the builder UI must warn when page 1 has a condition.

---

## 5. Theming

### 5.1 Mechanism

- The form filler page renders everything inside a single wrapper: `<div className="form-theme-root" style={themeToCssVars(schema.theme)}>`.
- `themeToCssVars()` (in `src/lib/forms/theme.ts`) returns a `React.CSSProperties` object of **custom properties only**: `--form-bg`, `--form-surface`, `--form-text`, `--form-text-muted`, `--form-primary`, `--form-primary-text`, `--form-border`, `--form-error`, `--form-radius`, `--form-font-heading`, `--form-font-body`, `--form-font-button`, plus weight/style vars.
- Form-renderer components style themselves from these vars (e.g. `bg-[var(--form-surface)]`, `rounded-[var(--form-radius)]`). The existing `form.tsx` components use platform tokens; the block-input wrapper (§9.2) applies theme vars around/over them via the wrapper element and CSS variable overrides of the shadcn tokens *scoped to the wrapper* (e.g. set `--primary`, `--background`, `--ring` inside `.form-theme-root` so the underlying shadcn components inherit the theme without modification). **Do not edit `globals.css` tokens or `form.tsx` for theming.**
- The theme applies on the filler page and the builder's preview mode. The builder chrome itself always uses platform styling.
- Both light and dark platform modes show the form in its authored theme (the theme IS the appearance; it does not adapt to dark mode in v1).

### 5.2 Google Fonts

- Curated allowlist (constant `CURATED_FONTS` in `theme.ts`, ~25 entries): Inter, Roboto, Open Sans, Lato, Montserrat, Poppins, Nunito, Nunito Sans, Raleway, Playfair Display, Merriweather, Lora, Source Serif 4, DM Sans, DM Serif Display, Space Grotesk, Work Sans, Rubik, Karla, Libre Baskerville, IBM Plex Sans, IBM Plex Serif, Crimson Text, Josefin Sans, Fraunces.
- Load on the **filler page only**, via a `<link rel="preconnect" href="https://fonts.gstatic.com">` + one combined `<link href="https://fonts.googleapis.com/css2?family=...&display=swap">` built from the (max 3) families/weights the theme uses. Render these tags from the server component `page.tsx` so there is no FOUT-inducing client fetch. `next/font` cannot be used for runtime-dynamic families — that is why the link approach is correct here.
- The validator rejects families outside the allowlist (this is also an XSS/URL-injection guard since family names end up in a URL).
- Weights: builder offers only weights in `FontConfig['weight']`; italic is a boolean toggle.

### 5.3 Defaults

`defaultTheme` mirrors the platform brand: background `#faf7f2`, surface `#ffffff`, text `#232020`, muted `#6b6560`, primary `#87281b`, primaryText `#ffffff`, border `#e5ddd3`, error `#ba1a1a`, radius 12, heading = Nunito 700, body = Nunito Sans 400, button = Nunito Sans 600, buttonStyle solid.

---

## 6. Strapi collection types (paste-ready)

Strapi v4 content-type schemas. Create via Content-Type Builder or drop these into `src/api/<name>/content-types/<name>/schema.json` on the Strapi repo.

### 6.1 `form`

```json
{
  "kind": "collectionType",
  "collectionName": "forms",
  "info": { "singularName": "form", "pluralName": "forms", "displayName": "Form", "description": "Induction/recruitment forms built with the platform form builder" },
  "options": { "draftAndPublish": false },
  "attributes": {
    "title":        { "type": "string", "required": true, "maxLength": 200 },
    "form_uid":     { "type": "string", "required": true, "unique": true },
    "schema":       { "type": "json", "required": true },
    "form_status":  { "type": "enumeration", "enum": ["draft", "active", "inactive"], "default": "draft", "required": true },
    "start_date":   { "type": "datetime" },
    "end_date":     { "type": "datetime" },
    "stats":        { "type": "json" },
    "organisation": { "type": "relation", "relation": "manyToOne", "target": "api::organisation.organisation", "inversedBy": "forms" },
    "responses":    { "type": "relation", "relation": "oneToMany", "target": "api::form-response.form-response", "mappedBy": "form" }
  }
}
```

Notes:
- `form_uid` is the public unique ID used in URLs (`/platform/forms/[formId]`) — a `uuidv4` generated by the Next API on create. Never expose or accept raw numeric Strapi ids from the filler side; org-side routes may use `form_uid` too (consistency) and resolve to numeric id server-side.
- Add the inverse `forms` relation on the existing `organisation` content type (`oneToMany` → `api::form.form`).
- `stats` shape (JSON): `{ "uniqueVisits": 0, "draftCount": 0, "submissionCount": 0, "lastSubmissionAt": null }`. `completionRate` is **derived** at read time (`submissionCount / max(uniqueVisits,1)`), not stored.

### 6.2 `form-response`

```json
{
  "kind": "collectionType",
  "collectionName": "form_responses",
  "info": { "singularName": "form-response", "pluralName": "form-responses", "displayName": "Form Response", "description": "Drafts and submissions for platform forms" },
  "options": { "draftAndPublish": false },
  "attributes": {
    "form":            { "type": "relation", "relation": "manyToOne", "target": "api::form.form", "inversedBy": "responses" },
    "respondent":      { "type": "relation", "relation": "manyToOne", "target": "plugin::users-permissions.user" },
    "respondent_email":{ "type": "email", "required": true },
    "data":            { "type": "json", "required": true },
    "state":           { "type": "enumeration", "enum": ["draft", "submitted"], "default": "draft", "required": true },
    "visited_at":      { "type": "datetime" },
    "last_saved_at":   { "type": "datetime" },
    "submitted_at":    { "type": "datetime" },
    "files":           { "type": "json" }
  }
}
```

Notes:
- **One row per (form, user), ever.** The row doubles as the visit record: it is created with `state: 'draft'`, empty `data`, and `visited_at` set on first visit (§7.5). This gives unique-visit tracking, draft storage, and submission in one entity — no separate visits collection, no unbounded JSON arrays on `form`.
- Uniqueness is enforced in the Next API route: filtered lookup (`filters: { form: id, respondent_email: { $eq: email } }`) → update if found, create if not. Accept the small race window; a duplicate created in the same second is harmless and the submit path re-checks state.
- `files`: `[{ blockId, url, publicId, filename, bytes }]` — the canonical list of everything uploaded to this response (used for orphan cleanup).
- `respondent_email` is stored denormalized so exports never need to populate the user relation.

---

## 7. API contract

All routes below: check `await auth()` first; 401 if no session. Org routes additionally require `session.user.role === 'organization'` (or `access` includes `'organization'`) **and** ownership: resolve `getUserIdByEmail` → `getOrganisationIdByUserId` → verify `form.organisation.id === orgId`, else 403. All bodies zod-validated; on validation failure return 400 with a human-readable `error`.

### 7.1 Org routes — `/api/organisations/forms`

| Method & path | Body | Behavior |
|---|---|---|
| `GET /api/organisations/forms` | — | List org's forms: `{ id: form_uid, title, form_status, start_date, end_date, stats (+derived completionRate), updatedAt }`. `no-store`. |
| `POST /api/organisations/forms` | `{ title }` | Create: generate `form_uid` (uuidv4), `schema` = default (1 empty page, `defaultTheme`, default settings), `form_status: 'draft'`, zeroed `stats`, relation to org. Returns the new form. |
| `GET /api/organisations/forms/[formId]` | — | Full form incl. `schema` for the builder. `no-store`. |
| `PUT /api/organisations/forms/[formId]` | `{ schema?, title?, form_status?, start_date?, end_date? }` | Validate `schema` with `formSchemaValidator`, then `sanitizeFormSchema()` (§14.2), then persist. On success call `revalidateTag('form:' + form_uid)`. Reject `form_status: 'active'` if schema has zero input blocks. |
| `DELETE /api/organisations/forms/[formId]` | — | Only when `submissionCount === 0`; otherwise 409 (tell org to set inactive instead). Delete Cloudinary assets listed in responses' `files`, delete responses, delete form. |
| `GET /api/organisations/forms/[formId]/responses` | — | `?state=submitted\|draft\|all` (default submitted), paginated (`page`, `pageSize` ≤ 100). `?format=csv` streams CSV: one column per input block (label = block title, ordered by page/block order), plus email + submitted_at. Escape CSV fields that start with `= + - @` by prefixing `'` (CSV injection guard). `no-store`. |

### 7.2 Filler routes — `/api/platform/forms/[formId]`

`[formId]` is always `form_uid`.

| Method & path | Body | Behavior |
|---|---|---|
| `GET /api/platform/forms/[formId]` | — | Returns `{ form: { title, schema, endDate } }` **only if active** (§7.4), else 404. Served through `unstable_cache` (§10.3). |
| `POST /api/platform/forms/[formId]/visit` | — | Upsert the user's response row; set `visited_at` if unset and increment `stats.uniqueVisits` + `stats.draftCount` (only on first creation). Returns `{ success: true }`. Idempotent. |
| `GET /api/platform/forms/[formId]/response` | — | Returns the caller's own row: `{ state, data, lastSavedAt }` or `{ state: null }`. `no-store`. |
| `POST /api/platform/forms/[formId]/response` | `{ data }` | **Draft save.** Must accept `sendBeacon` payloads: read via `await req.text()` → `JSON.parse`, tolerate `Content-Type: text/plain`. Reject if response `state === 'submitted'` (409) or form inactive (404). Strip keys not in schema, size-cap raw body at 512 KB (413). Set `last_saved_at`. Returns `{ success: true, lastSavedAt }`. |
| `PUT /api/platform/forms/[formId]/response` | `{ data }` | **Final submit.** Form must be active; caller's row must not already be `submitted` (409 `alreadySubmitted`). Run condition engine server-side → `visibleInputBlockIds` → `buildResponseValidator` (400 with per-block `errors` map on failure). Sanitize rich-text answers with DOMPurify. Persist `state: 'submitted'`, `submitted_at`; bump `stats.submissionCount`, decrement `draftCount`, set `lastSubmissionAt`. Then fire-and-forget the confirmation email (§12) — email failure must NOT fail the submission (log it). Returns `{ success: true, confirmation: { title, html } }`. |
| `POST /api/platform/forms/[formId]/upload` | `multipart/form-data`: `file`, `blockId` | See §11. |

### 7.3 Stats update discipline

`stats` lives as JSON on `form`. Update it with read-modify-write inside the same handler that caused the change (visit create, submit). Lost updates under heavy concurrency are acceptable for these counters (explicitly out of scope to make atomic in v1) — but implement `bumpStats(formNumericId, patchFn)` in `strapi-forms.ts` as the single choke point so it can be hardened later.

### 7.4 Active check (single helper, used everywhere)

```ts
// strapi-forms.ts
export function isFormActive(form): boolean {
  const status = form.form_status;
  const start = form.start_date ? new Date(form.start_date) : null;
  const end   = form.end_date   ? new Date(form.end_date)   : null;
  const now = new Date();
  return status === 'active' && (!start || start <= now) && (!end || end > now);
}
```

Lazy status flip: when a filler GET finds `status === 'active'` but `end_date` elapsed, write `form_status: 'inactive'` back to Strapi (fire-and-forget) and return 404. No cron needed.

### 7.5 Visit flow

Filler `page.tsx` (server) fetches the cached form; `client.tsx` fires `POST .../visit` once on mount (after hydration), then `GET .../response` to hydrate any draft. Visit is not part of the cached GET so the cache stays user-agnostic.

---

## 8. Builder UX (`/organisations/forms/[formId]/edit`)

### 8.1 Layout

Three-pane layout (responsive: panes become drawers below `lg`):

1. **Left — block palette** (`block-palette.tsx`): grouped buttons ("Content": title, paragraph, image, social links, divider; "Questions": all input types), each with a lucide icon. Click appends to the current page; drag-into-canvas is a stretch goal — click-to-add is the required interaction.
2. **Center — canvas** (`builder-canvas.tsx`): renders the current page's blocks as cards. Wrap in `DndContext` + `SortableContext` (vertical list strategy) exactly like `course-planner-board.tsx` (PointerSensor + TouchSensor, `DragOverlay`). Each card: drag handle, block preview (approximate render), duplicate + delete icons, click to select. Selected card gets the primary ring.
3. **Right — inspector** (`block-inspector.tsx`): edits the selected block. Common fields (title, subtitle, placeholder, default value, required toggle) + per-type config (options editor with add/remove/reorder for selects; min/max for numbers/dates; accept/multiple/maxSize for uploads; level/align for titles; Tiptap editor for paragraph HTML) + **Logic tab** (§8.4).

Top bar: editable form title, page tabs (`page-tabs.tsx`: add/rename/delete/reorder pages, page-condition indicator), Theme button (opens `theme-editor.tsx` sheet), Settings button (`form-settings.tsx`: status, start/end date via existing `DateTimePicker`, confirmation message via Tiptap, submit button text, email-copy toggle, progress bar toggle), Preview toggle, Save button + save-state indicator ("Saved · 12:04", "Saving…", "Unsaved changes"), and a copyable share link (`/platform/forms/<form_uid>`).

### 8.2 State

Single `useState`/`useReducer` in `client.tsx` holding `{ form: FormSchema, title, status, dates }`. No new state libraries. Every mutation goes through a reducer so save/dirty tracking is centralized. Keep an undo stack (last 50 reducer actions) with Ctrl/Cmd+Z — in-memory only.

### 8.3 Saving (same 3-way discipline as the filler)

Manual Save button; 60 s debounced autosave (timer resets on each edit, skips when clean); flush on `visibilitychange === 'hidden'` via `navigator.sendBeacon` to `PUT`-equivalent — since sendBeacon is POST-only, the builder beacon posts to `PUT` semantics via `POST /api/organisations/forms/[formId]?beacon=1` handled by the same route file (accept `POST` with `?beacon=1` as an alias for `PUT`). Mirror to `localStorage` key `form-builder:<form_uid>` and offer restore on load if newer than server `updatedAt`.

### 8.4 Condition editor (`condition-editor.tsx`)

Per block and per page: toggle "Only show when…", combinator select (all/any), rule rows: [question dropdown — only input blocks from earlier pages/same page, excluding self] [operator dropdown — filtered by source block type, per table below] [value input — rendered to match the source type: select shows its options, checkbox shows true/false, number shows number input, date shows DatePicker].

| Source block type | Allowed operators |
|---|---|
| short-text, long-text, email, phone, rich-text | equals, notEquals, contains, notContains, isEmpty, isNotEmpty |
| number, date, datetime | equals, notEquals, greaterThan, lessThan, isEmpty, isNotEmpty |
| select | equals, notEquals, isEmpty, isNotEmpty |
| multi-select | contains, notContains, isEmpty, isNotEmpty |
| checkbox | equals |
| file-upload | isEmpty, isNotEmpty |

Deleting a block that other rules reference: warn, then strip those rules on confirm (reducer handles cascade).

### 8.5 Preview mode

`builder-preview.tsx` renders the **actual filler renderer** (`form-renderer.tsx` imported from the platform feature — export it from a shared location or import across features via `@/app/platform/forms/[formId]/_components/form-renderer`; prefer moving `form-renderer.tsx` and `block-input.tsx` into `src/components/forms/` so both sides import cleanly — do this from the start) with live schema + theme, answers held in throwaway state, submission disabled. This guarantees builder preview ≡ filler reality.

---

## 9. Filler UX (`/platform/forms/[formId]`)

### 9.1 Page flow

`page.tsx` (server): fetch form via cached data-access (§10.3); `notFound()` if missing/inactive. Render Google Fonts links (§5.2) + `<client.tsx initialForm={...} />`. **Do not use `PageTitle`** here — the form's own themed header (form title as `title` block or plain heading) is the page identity.

`client.tsx` states: `filling → previewing → submitted`.

1. **Filling:** one visible page at a time; progress bar (if enabled) = visible-page index / visible-page count; Back/Next buttons; Next runs validation for the current page's **visible required** blocks (reuse each component's `errorMessage` prop) and scrolls to the first error. Condition engine re-evaluates visibility on every answer change (pure function call — cheap).
2. **Previewing (mandatory):** read-only summary of every visible input block: question title + formatted answer (files as filename links, multi-select as comma list, rich text rendered sanitized). Buttons: "Go back & edit", "Confirm & submit". Submit calls `PUT .../response`; on per-block 400 errors, return to the page containing the first errored block with errors shown.
3. **Submitted:** render `confirmation.title` + `confirmation.html` from the submit response. Also, if `GET .../response` on load reports `state === 'submitted'`, render a "You have already responded" screen with the confirmation message — never re-enter filling.

### 9.2 Block rendering (`block-input.tsx`)

One switch mapping `FormBlock` → existing components from `src/components/form.tsx`:

| Block type | Component (from `src/components/form.tsx`) |
|---|---|
| short-text | `TextInput` |
| long-text | `TextInput` with `isParagraph` |
| rich-text | `RichTextInput` |
| email | `TextInput` with `type="email"` (+ domain check in page validation when `restrictToDomain`) |
| phone | `PhoneInput` |
| number | `TextInput` with `type="number"` |
| checkbox | `CheckboxComponent` |
| select | `SingleSelect` |
| multi-select (dropdown) | `MultiSelectDropdown` |
| multi-select (checkboxes) | `MultiSelectCheckbox` |
| date | `DatePicker` (value stored as ISO date string) |
| datetime | `DateTimePicker` |
| file-upload | `FileUpload` wrapped with upload-on-select logic (§11) |
| title / paragraph / divider / image / social-links | small presentational components in `form-renderer.tsx` (paragraph rendered with `dangerouslySetInnerHTML` — safe because sanitized at save time server-side, §14.2) |

Map block config → props: `title→title`, `subtitle→description`, `placeholder→placeholder`, `required→isRequired`, validation error → `errorMessage`. Do **not** fork/duplicate `form.tsx` components; if a prop is missing, extend the component backward-compatibly.

---

## 10. Partial saves, autosave & caching

### 10.1 Filler draft autosave (three triggers, exactly)

1. **Manual:** persistent "Save draft" button (secondary style) → immediate `POST .../response`.
2. **Debounced:** one `setTimeout` ref; every answer change resets it to 60 000 ms; on fire, save only if dirty since last save. (Pattern precedent: `grade-planner.tsx` `debouncedPersist`, scaled to 60 s and a network call.)
3. **Unmount/close:** `visibilitychange` listener — when `document.visibilityState === 'hidden'` and dirty, `navigator.sendBeacon(url, new Blob([JSON.stringify({ data })], { type: 'text/plain' }))`. `text/plain` keeps the beacon CORS-simple; the route reads raw text (§7.2). Also flush on React unmount cleanup as a best-effort `fetch(..., { keepalive: true })`.

File uploads are NOT part of draft JSON saves — they upload immediately (§11) and only their descriptors ride along in `data`.

### 10.2 Client-side cache

Mirror answers to `localStorage` key `form-draft:<form_uid>:<userEmail>` on every debounced save tick (and on visibility flush). On load: hydrate from server `GET .../response`; if localStorage copy has a newer internal `savedAt` than server `lastSavedAt`, prefer localStorage and immediately persist it. Clear the key on successful submit.

### 10.3 Server-side cache

In `strapi-forms.ts`:

```ts
export const getActiveFormByUid = (uid: string) =>
  unstable_cache(
    async () => { /* strapiGet forms?filters[form_uid][$eq]=uid, return null if !isFormActive */ },
    ['form-by-uid', uid],
    { revalidate: 300, tags: [`form:${uid}`] }
  )();
```

- Builder `PUT` (and status/date changes) → `revalidateTag('form:' + uid)`. This is the platform's first `revalidateTag` use; precedent for `unstable_cache` is `wordle/leaderboard/route.ts`.
- Everything user-specific (`/response`, org lists, responses) is `no-store` / `dynamic = 'force-dynamic'`.
- Org list/responses pages: server components fetch with `cache: 'no-store'` + forwarded cookies, matching `borrow-assets/page.tsx`.

---

## 11. File uploads (Cloudinary)

Flow (upload-on-select, before submit):

1. Client: user picks file(s) in the `FileUpload` block. Images are pre-compressed to webp client-side (reuse the canvas logic from `ImageUpload` in `form.tsx`). Non-images (PDF/DOCX) pass through.
2. Client → `POST /api/platform/forms/[formId]/upload` (multipart: `file`, `blockId`). Show per-file progress/spinner; on success store the returned descriptor into `data[blockId]` (array) and trigger a draft save.
3. Server route:
   - `auth()`; form must be active; `blockId` must be a `file-upload` block in the schema; enforce that block's `accept`, `maxSizeMB` (hard ceiling 10 MB regardless), and `maxFiles` (count existing descriptors in the caller's draft).
   - MIME allowlist by `accept`: images → `image/jpeg|png|webp|gif`; documents → `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`. Check both `file.type` and filename extension; reject mismatch (400).
   - Upload: images via `uploadImageToCloudinary(file, filename, 'form-uploads/<form_uid>')`; documents via `cloudinary.uploader.upload(..., { resource_type: 'raw', folder: 'form-uploads/<form_uid>' })` — add `uploadRawToCloudinary()` alongside the existing helper in `src/lib/apis/cloudinary.ts`.
   - Append `{ blockId, url, publicId, filename, bytes }` to the response row's `files` JSON and return the descriptor.
4. Deletion: removing a file in the UI deletes the descriptor from `data`/`files` via draft save and fire-and-forgets `deleteImageFromCloudinary(publicId)` server-side (add a small `DELETE` handler on the upload route accepting `{ publicId }`, verifying the publicId exists in the caller's own `files` list before deleting).
5. Org `DELETE` of a form removes all `files` publicIds from Cloudinary (§7.1).

---

## 12. Confirmation email

`buildResponseEmailHtml(formTitle, orgName, schema, data)` in `src/lib/forms/email.ts` → self-contained inline-styled HTML (email clients: no external CSS, no CSS vars):

- Header: form title + organisation name, platform-branded (terracotta `#87281b` accent, Arial/Helvetica fallback stack — do not load webfonts in email).
- Body: every **visible answered** input block in page order — question title (bold), answer formatted (multi-select comma-joined; dates via `date-fns` `format(d, 'PPP')`; files as anchor links; rich-text inserted after DOMPurify sanitize; unanswered optional questions shown as "—").
- Footer: submission timestamp, "This is a copy of your response" line.

Sent from the `PUT` submit handler when `settings.sendEmailCopy` is true, via `sendMail({ to: email, alias: orgName, subject: 'Your response: <form title>', html })` from `src/lib/apis/mail.ts`. Wrap in its own try/catch; failure logs `console.error` and does not affect the submit response.

---

## 13. Stats

Stored on `form.stats` (JSON), updated via `bumpStats()` (§7.3):

| Stat | Updated when | Cost |
|---|---|---|
| `uniqueVisits` | first `POST /visit` per user (response row created) | 1 extra write on first visit only |
| `draftCount` | row created (+1), row submitted (−1) | free (same write) |
| `submissionCount` | successful submit | free |
| `lastSubmissionAt` | successful submit | free |
| `completionRate` | derived at read time — never stored | free |

Explicitly out of scope for v1 (expensive/complex): per-page drop-off, time-to-complete, view-by-day time series.

Org list/dashboard renders these as stat chips per form card; the responses page header shows the same numbers.

---

## 14. Security checklist (every item is mandatory; verify before merge)

1. **AuthN:** every API route calls `auth()` and 401s without a session. Filler pages are already login-gated by `middleware.ts` (`/platform/:path*`).
2. **AuthZ (org):** every `/api/organisations/forms*` handler checks role `organization` AND resolves the org from the session (`getUserIdByEmail` → `getOrganisationIdByUserId`) AND verifies the target form belongs to that org. No org/user id is ever read from the request body.
3. **AuthZ (respondent):** `/response` and `/upload` handlers operate only on the row matching the **session** email. A user can never read or write another user's response. Org response listing never leaks other forms' data (always filtered by the verified form id).
4. **Validation:** `formSchemaValidator` on every builder save; `buildResponseValidator` on every submit; draft saves strip unknown keys and cap body size (512 KB). All limits from §3.1 enforced.
5. **Stored XSS:** all org-authored HTML (`paragraph.html`, `confirmationHtml`) sanitized server-side with `isomorphic-dompurify` at **save time** inside `sanitizeFormSchema()` (allowlist: `p,br,strong,em,u,s,a[href|target|rel],ul,ol,li,h1..h3,blockquote`; force `rel="noopener noreferrer"` and `target="_blank"` on links; strip everything else). All respondent rich-text answers sanitized at **submit time** and again before email insertion. Never render unsanitized HTML.
6. **URL injection:** `image.url` must be a Cloudinary URL (`https://res.cloudinary.com/...`) — validate in zod. `social-links` URLs must parse as `https:` URLs. Font families allowlisted (§5.2). Regex `pattern` compiled in try/catch with length cap (ReDoS guard: also reject patterns containing nested quantifiers is out of scope — the 200-char + compile check + server-side timeout-free usage on ≤5,000-char strings is the accepted v1 posture; run pattern checks client-side and re-run server-side inside the zod refine).
7. **Uploads:** server-side MIME + extension + size + count checks per §11 regardless of client checks; Cloudinary keys stay server-side (already the pattern — never import `cloudinary.ts` into client components).
8. **Strapi token:** all Strapi calls stay inside route handlers / server files (`strapi-forms.ts` must have `import 'server-only'` at the top, as should `email.ts` and anything touching `STRAPI_API_TOKEN`).
9. **CSV export:** injection guard per §7.1.
10. **Enumeration:** filler 404s identically for "doesn't exist", "draft", and "expired" — no distinguishing responses. `form_uid` is a uuid, not sequential.
11. **Rate limiting:** simple in-memory limiter (Map of `email → timestamps`, sliding window) on submit (5/min), upload (20/min), draft save (30/min). Acceptable v1; module-level Map, documented as per-instance.
12. **No secrets client-side:** theme/schema JSON is the only thing that crosses to the client from the form; responses of other users never do.

---

## 15. Milestones & acceptance criteria

Implement in order; each milestone leaves `npm run build` green and is independently verifiable.

**M1 — Schema core.** `src/lib/forms/{schema,validator,conditions,theme}.ts` + unit-style verification (a scratch script or route is fine; vitest not in repo). ✅ `formSchemaValidator` accepts the default schema and rejects: duplicate ids, forward condition references, bad hex colors, non-allowlisted font, oversize limits. ✅ Condition engine passes the normative cases in §4.

**M2 — Strapi + org CRUD.** Collection types created in Strapi (§6; coordinate with backend owner — the spec's JSON is paste-ready), `strapi-forms.ts`, `/api/organisations/forms` GET/POST + `[formId]` GET/PUT/DELETE with full authZ. ✅ An org account can create, save, list, and delete a form via `curl`; a non-org account gets 403; another org gets 403 on your form.

**M3 — Filler read path.** `/api/platform/forms/[formId]` cached GET + `isFormActive` + lazy inactive flip; `/platform/forms/[formId]` page with `form-renderer.tsx`/`block-input.tsx` (in `src/components/forms/`), page navigation, client-side validation, condition-driven visibility. ✅ A hand-authored schema renders all 17 block types; hiding/showing via conditions works; inactive/expired forms 404.

**M4 — Builder.** Full §8: palette, dnd-kit canvas, inspector, page tabs, condition editor, settings, preview (shared renderer), 3-way save + localStorage restore, `revalidateTag` on save. ✅ Build a 2-page form with conditions entirely through the UI, save, reload, see it intact; preview matches filler.

**M5 — Responses & drafts.** `/visit`, `/response` GET/POST/PUT with one-per-user enforcement, submission preview step, confirmation screen, already-submitted screen, 3-way filler autosave + localStorage mirror, stats bumping. ✅ Draft survives tab close (sendBeacon) and browser restart (localStorage + server); submit locks the response; second submit attempt 409s; stats numbers move correctly.

**M6 — Uploads + email + theming.** §11 upload route + FileUpload wiring + deletion; §12 email on submit; §5 theme editor + scoped CSS vars + Google Fonts links. ✅ Image and PDF upload respecting block limits; respondent receives a formatted email; changing theme colors/fonts visibly restyles filler and preview without touching platform chrome.

**M7 — Org responses view + hardening.** Responses table + detail + CSV export; full §14 checklist audit; rate limiters; org list page stat cards. ✅ Every §14 item demonstrably enforced (attempt each violation and observe the rejection); CSV opens clean in a spreadsheet.

---

## 16. Do-NOT-do list

- Do **not** add state-management (zustand/redux/jotai), react-hook-form, SWR, or react-query. `useState`/`useReducer` + context only.
- Do **not** fork or copy `src/components/form.tsx` components — import and, if necessary, extend them backward-compatibly.
- Do **not** modify `src/middleware.ts`, `globals.css` design tokens, or `src/auth.ts`.
- Do **not** call Strapi or Cloudinary from client components, or expose `STRAPI_API_TOKEN` / Cloudinary secrets.
- Do **not** invent a second response format — keep `{ success, data | error }`.
- Do **not** store derived stats (`completionRate`) or per-event analytics logs.
- Do **not** use `beforeunload` for save flushing — `visibilitychange` + `sendBeacon` per §10.1.
- Do **not** use numeric Strapi ids in any URL or payload that reaches the browser — `form_uid` only.
- Do **not** render any org- or user-authored HTML without the DOMPurify pass having happened server-side.
- Do **not** ship a milestone with `npm run build` failing or with `console.log` debugging left in API routes.
