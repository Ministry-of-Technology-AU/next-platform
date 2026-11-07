# Ashoka Wiki: PRD
> Status: draft (minimal) · Area: platform · Owner: Shashwat Bhajanka
> Folder: `src/app/platform/platform-resources/` · Name in the app: **Ashoka Wiki**
> Layout references: two mockups, kept by the owner (not in the repo). Folder sidebar on the left, document grid in the centre, search button top right.

## 1. Summary

| | |
|---|---|
| Problem | Handbooks, requirement sheets and study material are spread across chats and drives. Students cannot find them. |
| Solution | A browsable repository of PDF documents, organised in folders, with cards that show a thumbnail, name, subject tags and last-updated date. Students favourite documents, and those open first. |
| Users | Signed-in students. |
| Phase 1 scope | Front end only. All data is placeholder, held in `data.ts`. Strapi, Cloudinary and uploads come later. |

Success criteria:
1. A student reaches any document in 3 clicks or fewer from the landing view.
2. Favouriting a document shows it on the landing view without a page reload.
3. The page works at 360 px width and at 1440 px width.
4. Landing view renders its empty state when the student has no favourites.
5. Swapping placeholder data for Strapi changes `data.ts` and the `_server/` files only, not the components.

## 2. Users & access

| Role | Can do |
|---|---|
| Student (`platform` access) | Browse, search, preview, favourite |
| Uploader / admin | TBD, with uploads (later) |

Route gate: `/platform` already requires `platform` access in `src/middleware.ts`. No new entry needed.

## 3. Stories & flows

| Story | Acceptance |
|---|---|
| As a student, I want to open the wiki on my favourites so that I get to my documents fast. | Landing view is Favourites. Each favourite shows as a full card. |
| As a new student with no favourites, I want a clear next step so that I know what to do. | Empty state shows a short friendly message and a Browse button that opens the first folder. |
| As a student, I want to move through folders so that I can find a document by topic. | Sidebar tree expands and collapses. Choosing a folder shows its cards. |
| As a student, I want to see what a document is before I open it so that I do not waste time. | Each card shows thumbnail, name, subject tags and last-updated date. Choosing a card opens the preview pane. |
| As a student, I want to favourite a document so that I can find it again. | Favourite button toggles on the card and in the preview pane. State survives reload (TBD: needs Strapi, see section 5). |
| As a student, I want to search so that I do not have to browse. | Search matches name and tags across all folders. |

Flows:
1. Open `/platform/platform-resources` → Favourites view → choose a card → preview pane opens → close with the X.
2. Open the wiki → choose Academic → choose Computer Science → cards load → favourite one → open Favourites → it is listed.
3. Edge cases: no favourites (empty state), empty folder (empty state with a line that nothing is here yet), search with no match (empty state), thumbnail missing (neutral placeholder tile).

## 4. Screens

One page, one view at a time, three regions (from the reference images).

| Region | Purpose | States |
|---|---|---|
| Header | File icon, "Ashoka Wiki", tagline. Tagline copy: TBD. | n/a |
| Folder sidebar | Rounded card titled "Folders". Favourites entry pinned on top and selected by default. Then the folder tree. | Expanded, collapsed, active |
| Card grid | Cards for the active folder, favourites or search results. | Loading (skeleton cards), empty, error |
| Preview pane | Replaces the card grid when a card is chosen. Full-width PDF viewer with Download and Close. Closing brings the grid back. | Closed, loading, ready, error. Viewer is a stub in phase 1. |
| Search | Round button at the top right that opens a search field. | Idle, typing, no results |

Document card: PDF thumbnail, name, up to 3 subject tags, last-updated date, favourite button (filled when favourited).

Folder tree:

| Folder | Children |
|---|---|
| Academic | Computer Science, Economics, Ecofin, CS+X, Philosophy, Psychology, Sociology, PPE, Physics, Biology, Chemistry |
| Student Life | none (flat) |
| General | none (flat) |

Mobile vs desktop:
- Desktop: sidebar and grid side by side. Opening a document replaces the grid with a full-width viewer (Download and Close buttons) until it is closed.
- Mobile: sidebar becomes a sheet opened from a Folders button. The viewer is full width, same as desktop.

Wireframe: no (the two reference images stand in).
Design direction: yes, chosen (existing design system only, no new colours, fonts or radii):
- Hierarchy: the card grid is the hero. The heart is the only crimson element on a card. Active folder uses `bg-primary/10` with crimson text.
- Cards: same recipe as the borrow-assets card (`rounded-xl border bg-card`, `shadow-sm` rising to `shadow-lg` on hover). The whole card opens the preview, the heart sits above it.
- Density: square cards, 1 column on mobile, 2 on tablet, 3 on wide screens. Tags capped at 3.
- Motion: heart press scales down, chevron rotates, thumbnail zooms 3% on hover. All honour reduced motion. Haptics on every control.
- Mobile: sidebar becomes a left sheet behind a Folders button. 
- Finish: skeleton cards match the real grid, friendly empty states, `/` opens search, `Esc` closes the preview.

## 5. Data

Phase 1: placeholder data in `data.ts` and types in `types.ts`. Strapi collections below are a proposal for the later swap, not built now.

| Collection (proposed) | Fields | Relations |
|---|---|---|
| `wiki-folder` | name, slug, order | parent (self), documents |
| `wiki-document` | title, slug, tags (json), pdf (media), thumbnail (media), updatedAt | folder |
| `wiki-favourite` | user email | document |

Favourites are per user. They never get a server cache. In phase 1 they live in the page's client state (and TBD whether to keep them in `localStorage` as a stopgap).

## 6. API contract

Phase 1: none. Page reads `data.ts` on the server.
Later (TBD, to be designed with `/platform route`): `GET /api/platform/platform-resources` (folders and documents), `POST` and `DELETE` for favourites.

## 7. Live data

None. Load on open.

## 8. Caching & cost

| Dataset | Shared or per user | Staleness allowed | Volume |
|---|---|---|---|
| Folders and documents | Shared | Minutes to hours | Low, TBD |
| Thumbnails | Shared | Long (immutable per upload) | One image per PDF |
| Favourites | Per user | None | One row per favourite |

Tier choice for the later routes is made with `.agents/blueprints/caching.md` at route time.

## 9. Integrations

Phase 1: none. Later: Cloudinary for PDFs and thumbnails (thumbnail from page 1). New env keys: none now.

## 10. Launch

Sidebar category and icon: TBD (entry goes in `src/components/sidebar/platform.ts`). Guided tour, what's-new entry and credits: after phase 2.

## 11. Milestones

- [ ] M1: Page shell, header, folder sidebar with the full tree, placeholder data · acceptance: all 13 folders navigate, typecheck passes
- [ ] M2: Card grid with thumbnail, name, tags, date, favourite button · acceptance: cards render for every folder, empty and loading states exist
- [ ] M3: Favourites landing and empty state · acceptance: favourite on a card shows it on landing without reload
- [ ] M4: Preview pane (stub viewer) and search · acceptance: pane opens and closes, grid reflows, search filters by name and tag
- [ ] M5: Mobile layout · acceptance: works at 360 px, sidebar and preview as sheets
- [ ] M6 (later): Strapi, Cloudinary and uploads · acceptance: TBD with the backend work

## 12. Non-goals

- Uploads, moderation, versioning and comments.
- File types other than PDF.
- Real-time updates.
- Nested folders under Student Life or General (flat for now).
- Real data in phase 1.

## 13. Risks & open questions

| Risk or question | Plan |
|---|---|
| Favourites would be lost on a new device without Strapi | Accept in phase 1, state it in the UI copy or avoid persisting |
| Thumbnail generation for PDFs | Decide at M6, likely Cloudinary page-1 transform |
| Tagline copy | TBD, owner supplies |
| Who may upload | TBD |
| Sidebar category and icon | TBD |
