# FRONTEND GUIDELINES

Scope: **frontend only.** Codebase orientation, backend/route work, typechecks, build checks,
graphify re-indexing and deploy steps are handled by the orchestrator instruction set — not here.
Do not do them from this file.

This file covers: which skills to load, the design system rules, what to reference, and the
practices that make a surface feel finished.

`context/` = guidelines (this file). `blueprints/` = templates you copy.

---

## 1. Skills

### Always
| Skill | Why |
|-------|-----|
| `/ui-ux-pro-max` | Layout, interaction patterns, UX quality control |
| `/frontend-design` | Aesthetic direction — stops UI reading as templated default |
| `/web-haptics` | Haptics are native to this platform — every page, every interactive element |

### By task
| If you are... | Load |
|---------------|------|
| Designing a **new component** from scratch | `/building-components` |
| Adding **any motion** — transitions, hover, enter/exit, micro-interactions | `/design-motion-principles` (create mode) |
| Reaching for a **primitive** (dialog, table, combobox…) | `/shadcn-ui` + shadcn MCP |
| Generating a **wireframe** | `/stitch-generate-design`, `/stitch-react-components` |
| **Auditing** UI before handoff | `/web-design-guidelines`, `/design-motion-principles` (audit mode) |

Skills live in `.agents/skills/<name>/SKILL.md`. Read the `SKILL.md` only — go into
`references/` or `workflows/` only when that skill tells you to.

---

## 2. What to reference

Read only what the current task needs. Do not preload all of these.

| Path | Read when |
|------|-----------|
| `.agents/context/design.md` | **Always.** The design system — colour roles, type scale, component styling, layout rhythm. |
| `src/app/globals.css` | **Always.** Every colour, radius, font and animation token. |
| `src/components/ui/` | Before building anything — the installed shadcn primitives. |
| `src/components/` | Before building anything — platform-wide components. |
| `src/hooks/` | You need `use-mobile`, `use-theme`, `useClickOutside`, `useIsMac`, `usePreventScroll`. |
| `.agents/blueprints/components.md` | Touching Page Title, Developer Credits, Orientation Dialog, Guided Tour, Form, Editor, Sidebar, banners/dialogs. |
| `.agents/blueprints/page.md` | Laying out a new page's file structure. |
| `src/app/platform/semester-planner/` | Unsure of structure — this is the reference implementation. |
| `src/components/custom-components.css` | Bespoke CSS that doesn't belong in `globals.css`. |

---

## 3. Wireframing

Only when the orchestrator says a wireframe is wanted.

1. Load `/stitch-generate-design`. Prompt in the language of `design.md` §6: *"modern academic,
   spacious fluid grid, clean utilitarian, subtle drop shadows, tactile micro-interactions,
   crimson accents."* Never ask for heavy gradients or stark black/white.
2. Feed it `.agents/design/rules.yaml` + `.agents/design/stitch.context` so output lands
   on-system.
3. Convert with `/stitch-react-components`.

---

## 4. Rules

### 4.1 Never hardcode colours
Every colour comes from a variable in `src/app/globals.css`, used through a Tailwind token.

```tsx
// NO
<div className="bg-[#87281b] text-white border-[#e0e0e0]" />
<div style={{ color: '#767371' }} />

// YES
<div className="bg-primary text-primary-foreground border-border" />
<p className="text-muted-foreground" />
```

Families: `primary` / `secondary` / `green` / `blue` / `gray`, each with `-light`,
`-extralight`, `-dark`, `-extradark`. Semantic set: `background`, `foreground`, `card`,
`popover`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart-1..5`,
`sidebar-*`.

Colour doesn't exist? Add it to `globals.css` with **both** light and dark values, and flag it
to the user. Never inline it.

Same for radius (`--radius`, `rounded-md`/`-xl`) and fonts (`--font-heading` Nunito for
headings, `--font-body` Nunito Sans for body — already applied globally).

### 4.2 Dark mode is not optional
Every surface must be legible in both themes. If you used only semantic tokens this is free —
that's the point. Check both before handing off.

### 4.3 Reuse before you build
1. `src/components/ui/` — primitive already installed?
2. `src/components/` — platform component already does this?
3. `/shadcn-ui` + shadcn MCP — does shadcn have it?
4. Only then build new, with `/building-components` loaded.

Component needs installing? **Ask the user to run the CLI command.** Write it yourself only if
explicitly asked.

### 4.4 Thin pages
Pages orchestrate, they don't render. Abstract into `_components/`. Used once and only meaningful
in context → stays in `_components/`. Used across 2+ pages → `src/components/`.

### 4.5 Client boundary
`'use client'` goes **as far down the tree as possible**. A leaf that needs state must not force
its parents client-side. Server-fetched data arrives as props — don't refetch it on the client.

### 4.6 Basics
- `platform.log()`, never `console.log()`.
- No `any`. Handle nulls explicitly — never `data!.field`.
- Components receive a valid shape always; the `{ data, error }` contract upstream guarantees it.

---

## 5. States

Every async surface needs **all four** designed. A spinner alone is not a loading state.

### Skeletons, not spinners
`src/components/ui/skeleton.tsx`. Skeleton must match the **real layout's dimensions** — same
rows, same card height, same grid. A skeleton that reflows on load is worse than none.
`loading.tsx` for route-level shells, `<Suspense>` for streaming sections.
`src/components/ui/spinner.tsx` is for in-button pending only.

### Optimistic UI
Any user-initiated mutation reflects **immediately**. `useOptimistic` (React 19) or local state
+ rollback — toggles, adds, removes, reorders, ratings, saves.

```
user acts → UI updates instantly → request fires → on error: roll back + toast
```

- Never block UI on a round trip the server will almost certainly accept.
- Always roll back visibly on failure, with a `sonner` toast saying what happened.
- Disable a control only when a second action would genuinely corrupt state.

### Empty & error
- **Empty:** say what would appear here, give the action that creates it. Never bare "No data".
- **Error:** page still renders — show fallback content plus retry. Never a blank screen or raw
  stack trace.

### The niceties
Expected, not bonus: focus returned after dialogs close, scroll position preserved on back-nav,
disabled buttons that say *why*, debounced search inputs, `aria-busy` while pending, no layout
shift when async content lands.

---

## 6. Motion & haptics

### Motion
Library is `motion` (v12). Load `/design-motion-principles` before writing any animation.

- Motion has a reason: explains a state change, directs attention, gives feedback. Decoration
  is not a reason.
- 150–250ms micro-interactions, 300–400ms layout/enter/exit. Global transition token `0.4s`.
  Theme switch uses the slower 0.9s curve.
- Animate `transform` and `opacity`. Avoid animating layout properties.
- Honour `prefers-reduced-motion`.
- Reuse what exists: `.button-animated` (crimson inner-shadow fill on hover, `scale(0.95)`
  active) and `--animate-aurora`, both in `globals.css`.

### Haptics — native, not optional
`web-haptics` is installed and `/web-haptics` is a repo skill. **Every interactive element on
every page gets haptic feedback.** It is what makes the platform feel responsive to the touch
on mobile, and it costs nothing on desktop.

- Buttons, toggles, switches, checkboxes, radio groups, tabs, sliders, pickers, drag handles,
  pull-to-refresh, form submits, destructive confirmations — all of them.
- Match intensity to consequence: light tick for selection and toggles, medium for a committed
  action, heavy/error pattern for destructive or failed actions. Success confirmations get the
  success pattern, not a generic tap.
- Wire it through **one shared helper in `src/lib/`**, not ad hoc imports in every component.
  If that helper doesn't exist yet, create it on the first task that needs haptics and route
  everything through it afterwards.
- Haptics are silent no-ops on desktop, so there's no guard to write — add them unconditionally.
- Do not stack haptics: a control inside a haptic-enabled wrapper fires once, not twice.

## 7. Responsiveness & accessibility

Desktop is where most usage sits today, and it gets full design attention. Mobile versions of
everything are being rolled out, so mobile is a first-class target too — **both surfaces are
designed, neither is a by-product of the other.**

### Mobile is a different design, not a narrower one
The failure mode to avoid is shipping the desktop layout scrunched into 375px. Mobile gets its
own thinking:

- **Remove.** Secondary metadata, decorative columns, redundant labels, at-a-glance stats that
  only make sense in a wide grid — cut them rather than stacking them into a scroll marathon.
- **Abstract.** Collapse a dense table into a card list. Fold a multi-column form into steps.
  Move a persistent sidebar into a `Sheet` or `Drawer`. Put secondary actions behind an
  overflow menu instead of wrapping a toolbar.
- **Restructure.** Reorder so the thing a phone user actually came for is first. Desktop reading
  order is not mobile priority order.
- **Improve.** Mobile can be *better* — bottom-anchored primary actions inside thumb reach,
  swipe and drag affordances, `Drawer` (vaul) instead of a cramped dialog, pull-to-refresh,
  sticky action bars. Reach for these rather than settling for parity.

Where the two diverge structurally, branch on `use-mobile` and render the right composition —
don't force one tree to serve both with a pile of conditional classes.

### Mechanics
- Author breakpoints mobile-first (Tailwind's default): base styles are the small layout,
  `sm:` / `md:` / `lg:` layer the wider ones on top. Custom `xs` breakpoint = 475px.
- Containers cap at `max-w-7xl`. Spacing rhythm `1.5rem` (`gap-6`, `p-6`). Page padding scales
  `px-2 py-2` (mobile) → `px-8 py-8` (large).
- Grids collapse: `grid-cols-1` → `sm:grid-cols-2` → `lg:grid-cols-4`.
- Tables are the usual failure point. Contained horizontal scroll or a card list — never let a
  table blow out the page width.
- Touch targets ≥ 44px. Nothing depends on hover alone — hover states need a tap equivalent.
- `use-mobile` for behavioural and structural branching. Pure visual layout uses CSS breakpoints.
- **A surface that genuinely resists any mobile composition** — a wide planner grid, a timetable —
  gets `@/components/orientation-dialog.tsx` to prompt rotation. Flag it to the user. It is a
  last resort after remove/abstract/restructure have been tried, not a first answer.

### Accessibility
- Every interactive element keyboard-reachable. Visible focus ring (global 3px
  `outline-ring/50`) — never remove it.
- Semantic HTML first, ARIA second. Radix handles most of this — don't reimplement it.

## 8. Shortcuts, tooltips & cognitive load

Everything that can be done with the mouse should have a keyboard route, and every
non-obvious control should explain itself without being clicked. These are the two halves of
the same goal: a platform you can move through fast without having to learn it first.

### Shortcuts are expected on every tool
Add them on both Mac and Windows. `useIsMac()` (`src/hooks/useIsMac.ts`) tells you which
modifier to *display* — the handler checks `e.metaKey || e.ctrlKey` and covers both.

Already global, do not reassign:

| Shortcut | Does |
|----------|------|
| `⌘K` / `Ctrl+K` | Command palette (`src/components/navbar/navbar.tsx`) |
| `⌘B` / `Ctrl+B` | Toggle sidebar (`src/components/ui/sidebar.tsx`) |

What to add per tool: the primary action, save/submit, create-new, search/filter focus, close or
cancel, and moving between views or tabs. If a user does it more than twice per session, it
earns a shortcut.

### Never collide with the browser or the OS
The platform runs in a browser tab. A shortcut that fights Chrome or the OS is worse than no
shortcut — the user loses a reflex they rely on everywhere else.

**Off limits**, Mac and Windows alike: `⌘/Ctrl` + `T` `W` `N` `Q` `R` `L` `D` `P` `S` `F` `O`
`H` `M` `+` `-` `0` `1`–`9`, plus `⌘⇧T`, `⌘⇧N`, `⌘⌥I`, `F5`, `F11`, `F12`, `Alt+Tab`,
`Alt+←/→`, and `Ctrl+Shift+` anything the browser already owns.

**Safe and preferred**, in this order:
1. **Bare keys when focus is not in a text field** — `n` new, `e` edit, `/` focus search,
   `Esc` close. This is what Linear and Gmail do, and it is the least likely to collide.
   Always bail out early when the event target is an `input`, `textarea` or `contenteditable`.
2. **`g` then a letter** for navigation — `g` `s` to Semester Planner, `g` `c` to CGPA Planner.
   Two-key sequences collide with nothing.
3. **`⌘/Ctrl` + an unclaimed letter** — only when the action is genuinely global and the bare
   key is taken.
4. **`?`** always opens the shortcut list for the current tool. Reserve it everywhere.

Register a tool's shortcuts in one place in that tool, not scattered across components, so
collisions inside the tool are visible in one read.

### Tooltips — as many as earn their place
Use `src/components/ui/tooltip.tsx`. `TooltipProvider` is already mounted in all three layouts.

- **Every icon-only control needs one.** No exceptions — an icon button with no tooltip and no
  `aria-label` is unusable for both new users and screen readers.
- **A control with a shortcut shows it in the tooltip**, right-aligned and formatted for the
  user's platform via `useIsMac()` — `⌘K` on Mac, `Ctrl+K` on Windows. This is the main way
  people discover shortcuts, so it is not optional.
- **Explain consequence, not the label.** "Delete" as a tooltip on a trash icon is noise;
  "Delete this draft — cannot be undone" is worth reading.
- **Disabled controls say why.** Wrap the disabled element so the tooltip still fires, and give
  the reason: "Select at least one course first."
- Tooltips are for supplementary detail. Never put information *only* in a tooltip if the user
  needs it to complete the task — touch devices have no hover.

Beyond tooltips, the guided tour (`.agents/blueprints/components.md`) is where a tool's
shortcuts and overall model get introduced. Mention the shortcuts there too.

### Keep cognitive load low
- Default to fewer visible controls. Secondary actions go behind an overflow menu, a
  `Popover`, or a shortcut — not the main toolbar.
- One primary action per screen, visually obvious. Everything else is quieter.
- Progressive disclosure: advanced options start collapsed.
- Reuse the platform's existing patterns rather than inventing a new interaction. A user who
  learned one tool should already know how the next one works.
- Never make someone remember a value across steps — carry it forward and show it.
- If a control needs a paragraph to explain, the control is wrong. Fix the control.

## 9. Before handing off

Frontend-level only. Build, typecheck and deploy checks belong to the orchestrator.

- [ ] Zero hardcoded colours; checked in both light and dark mode.
- [ ] Loading (skeleton), empty, error and optimistic states all exist.
- [ ] Verified at phone width **and** desktop width — mobile is its own composition, not a
      scrunched desktop. `OrientationDialog` only if nothing else works, and the user is told.
- [ ] Haptics on **every** interactive element, routed through the shared `src/lib/` helper.
- [ ] Touch targets ≥ 44px; nothing depends on hover alone.
- [ ] Keyboard navigable, focus ring intact.
- [ ] Shortcuts on the primary actions, working on Mac **and** Windows, colliding with nothing
      the browser or OS owns.
- [ ] Every icon-only control has a tooltip; shortcuts shown in tooltips, formatted per platform.
- [ ] Disabled controls explain why.
- [ ] Motion purposeful; `prefers-reduced-motion` honoured.
