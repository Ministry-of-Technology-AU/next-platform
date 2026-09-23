# Component Guidelines for next-platform

Guidelines, specifications, and replicable implementations for platform-wide components.

---

## NEW TOOL BANNER

### Overview
- Located at `@/components/new-tool-banner` (`src/components/new-tool-banner.tsx`).
- Used to announce the release of a brand-new tool directly inside that tool's view.
- Provides a sticky alert ribbon underneath the navigation bar with a configurable icon, welcome message, an optional direct trigger to the `FeedbackDialog` (`@/components/navbar/FeedbackDialog`), and a dismiss/close button.
- Built on top of shadcn banner primitives (`@/components/ui/shadcn-io/banner`) and styled with negative margins across breakpoints to stretch full-width across page margins (the "bleed" behavior, toggleable via the `bleed` prop).
- Responsive text sizing: `text-xs` on mobile, `text-sm` on `sm:` and up.

### Component Props
```tsx
import { type LucideIcon } from 'lucide-react';

export interface NewToolBannerProps {
  title?: string;           // Main banner message (default: generic welcome text)
  actionLabel?: string;     // Label for the feedback button (default: "Submit Feedback")
  icon?: LucideIcon;        // Icon component (default: Info from lucide-react)
  className?: string;       // Optional class overrides (most commonly negative top margin)
  showFeedback?: boolean;   // Whether to render the feedback CTA (default: true)
  feedbackPageName?: string;// Page name passed to FeedbackDialog for page-specific feedback
  bleed?: boolean;          // Whether the banner bleeds edge-to-edge beyond parent padding (default: true)
}
```

### Where to Use
- Place at the top of the newly launched tool's root `layout.tsx` (if a tool layout exists) or in `page.tsx` (if single-page without a tool-specific layout).
- Once the tool is no longer in its initial launch period, remove the component from the layout/page.

### How to Use & Implementation
- Because the root layouts (`/platform/layout.tsx` and `/organisations/layout.tsx`) wrap content in `<main className="flex-1 pt-6 pb-4 px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">`, there is a default top padding of `pt-6` (24px).
- To make the banner sit flush below the sticky navbar (`top-16`), apply `className="mt-[-24px]"` when mounting.
- All props have sensible defaults — a bare `<NewToolBanner />` renders a fully functional banner with the generic welcome message and feedback CTA.

#### Example: Placement in Tool `layout.tsx`
```tsx
import React from 'react';
import PageTitle from '@/components/page-title';
import DeveloperCredits from '@/components/developer-credits';
import { Megaphone } from 'lucide-react';
import { NewToolBanner } from '@/components/new-tool-banner';

export default function NewFeatureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const developers = [
    { name: "Developer Name", role: "Lead Developer" },
  ];

  return (
    <>
      {/* Banner placed at the top with negative margin to negate main's pt-6 */}
      <NewToolBanner className="mt-[-24px]" />
      
      <div className="w-full flex flex-col min-h-screen">
        <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
          <PageTitle
            text="New Feature Name"
            subheading="Short description of what this tool accomplishes."
            icon={Megaphone}
          />
          {children}
          <DeveloperCredits developers={developers} />
        </div>
      </div>
    </>
  );
}
```

#### Example: Custom Text and No Feedback CTA
```tsx
<NewToolBanner
  title="This tool is in beta. Some features may not work as expected."
  showFeedback={false}
  className="mt-[-24px]"
/>
```

### Guidelines & Gotchas
- **Sticky Offset**: The banner internally has `sticky top-16 z-40`, positioning it directly below the 64px (`h-16`) navigation bar.
- **Feedback Integration**: The feedback button inside `NewToolBanner` automatically opens `FeedbackDialog` via a `<Dialog>` / `<DialogTrigger>` wrapper. No additional state or handlers need to be passed. Pass `feedbackPageName` if you want the feedback to be tagged for a specific page.
- **Bleed Behavior**: When `bleed={true}` (default), the banner uses responsive negative margins to stretch past parent padding. Set `bleed={false}` if the banner is placed in a container that already handles full-width layout.
- **Lifecycle**: Do not keep `NewToolBanner` permanently. Remove it after the initial launch phase (e.g., 2-4 weeks post-launch).

---

## GUIDED TOUR

> [!IMPORTANT]
> **Before adding or editing a tour, invoke the `guided-tour` skill (`.agents/skills/guided-tour/SKILL.md`).** It holds the step-writing conventions, copy tone, and per-tool checklist. This section documents the component API; the skill documents how to author a good tour with it.

### Overview
- Located at `@/components/guided-tour` (`src/components/guided-tour.tsx`).
- Exports: `TourProvider` (default export too), `TourStep`, `TourTrigger`, `useTour`, and types `TourStepConfig`, `TourPosition`.
- A spotlight-style walkthrough: dims the page with a four-panel overlay, cuts a highlighted window around the current target, and floats a `Card` popover (title, step counter, progress bar, Back / Next / Skip) next to it.
- Steps are **registered declaratively** by wrapping page elements in `<TourStep>`; the provider collects them, sorts by `order`, and drives the walkthrough. Nothing needs to be listed centrally.
- Already mounted globally in `src/app/platform/layout.tsx` and `src/app/organisations/layout.tsx` with `autoStart={false}`. **Do not mount a second `TourProvider` inside a tool.**
- The navbar help button (`src/components/navbar/navbar.tsx`) is a `<TourTrigger asChild>` — every tool with registered steps gets a "start tour" entry point for free.
- Steps whose target never appears in the DOM (timeout 2s) are skipped with a `platform.warn`; walking off the end finishes the tour. `Escape` always exits. Body scroll is locked while active (scrollbar width compensated).

### Component Props & Types
```tsx
export type TourPosition = "top" | "bottom" | "left" | "right";

export interface TourStepConfig {
  id: string;               // Unique per portal. Becomes data-tour-step={id} on the wrapper div.
  title: string;            // Popover heading
  content: string;          // Popover body (plain text, 1-2 sentences)
  order: number;            // Sort key. Steps run ascending; gaps are fine.
  position?: TourPosition;  // Preferred popover side (default: "bottom"). Falls back automatically if no room.
  onOpen?: () => void;      // Called before the step shows (e.g. open a sheet, add sample data)
  selector?: string;        // Target a remote element (portal / dialog) instead of the wrapper div
  triggerSelector?: string; // Element to .click() before the step shows (e.g. a sidebar toggle)
}

// <TourStep {...TourStepConfig} className?: string; children?: ReactNode />

interface TourProviderProps {
  children: ReactNode;
  autoStart?: boolean;                               // Start automatically once steps register (default: false)
  ranOnce?: boolean;                                 // Persist completion in localStorage (default: true)
  storageKey?: string;                               // localStorage key (default: "rigidui-tour-completed")
  shouldStart?: boolean;                             // Gate for autoStart (default: true)
  onTourComplete?: () => void;
  onTourSkip?: () => void;
  onStepChange?: (step: TourStepConfig | null) => void; // null when the tour ends
}

interface TourTriggerProps {
  children: ReactNode;
  className?: string;
  hideAfterComplete?: boolean; // Hide once localStorage[storageKey] === "true" (default: false)
  storageKey?: string;         // Must match the provider's key (default: "rigidui-tour-completed")
  asChild?: boolean;           // Render the child as the trigger (Radix Slot) instead of wrapping in <button>
}

// useTour() → {
//   startTour, stopTour, nextStep, prevStep, resetTourCompletion,
//   isActive, currentStepId, currentStepIndex, totalSteps, currentStepData,
//   registerStep, unregisterStep   // internal, used by <TourStep>
// }
```

### Where to Use
- Every tool with more than two or three distinct interactive regions should ship a tour. Existing examples: Semester Planner, Trajectory Planner, Events Calendar, SG Compose, Course Reviews, When2Meet, Ashokan Around, platform landing page.
- Wrap the **smallest meaningful region** — a search input, a filter button, a table — not whole page sections. Large targets make the popover placement and highlight useless.
- Steps live wherever the element lives: `page.tsx`, a `_components/*.tsx`, or a layout. The provider collects them regardless of depth.
- For auto-launch on first visit, add a `_components/tour-manager.tsx` to the tool (see below). Do not use the provider's `autoStart` — it is global and would fire on every portal page.

### How to Use & Implementation

#### Step 1: Wrap Targets in `TourStep`
```tsx
import { TourStep } from "@/components/guided-tour";

<TourStep
  id="course-search"
  order={2}
  title="Search for Courses!"
  content="Find courses by name, code, or professor."
  position="bottom"
>
  <SearchInput onSearch={setQuery} />
</TourStep>
```
`TourStep` renders a plain `<div data-tour-step={id}>` around `children`. Pass `className` (e.g. `"w-full"`, `"contents"`) if the extra wrapper breaks a flex/grid layout.

#### Step 2 (optional): Auto-Launch on First Visit
```tsx
// src/app/platform/<tool>/_components/tour-manager.tsx
"use client";

import { useEffect } from "react";
import { useTour } from "@/components/guided-tour";

const STORAGE_KEY = "<TOOL>_TOUR_SEEN_V1";

export function TourManager() {
  const { startTour } = useTour();

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    // Small delay so all TourSteps have registered
    const timer = setTimeout(() => {
      startTour();
      localStorage.setItem(STORAGE_KEY, "true");
    }, 1000);
    return () => clearTimeout(timer);
  }, [startTour]);

  return null;
}
```
Mount `<TourManager />` once in the tool's `layout.tsx` or `page.tsx`. `startTour` is referentially stable, so the effect runs once per mount.

#### Example: Step Inside a Sheet / Dialog (Portal)
When the target only exists after something opens, either open it via `onOpen` / `triggerSelector`, or react to `currentStepId` in the owning component. The provider waits (up to 2s) for the target before showing the step.
```tsx
// Option A — click the toggle for us, then target the portal content
<TourStep
  id="calendar-preferences"
  order={3}
  title="Select a Date!"
  content="Select a date to view events for that date."
  triggerSelector="[data-tour-open-preferences]"
  selector="[data-tour-step='calendar-preferences']"
/>

// Option B — the owner opens/closes itself based on the active step (events-calendar.tsx)
const { isActive, currentStepId } = useTour();
useEffect(() => {
  const stepNeedsSidebar =
    currentStepId === "event-filters" || currentStepId === "calendar-preferences";
  setShowPreferences(isActive && stepNeedsSidebar);
}, [isActive, currentStepId]);
```
With Option B, keep the container open for **every** step that lives inside it, otherwise the target unmounts and the step gets skipped.

#### Example: Seed Data Before a Step
```tsx
<TourStep
  id="timetable-grid"
  order={4}
  title="Your Timetable"
  content="Courses you add appear here. Click a slot to remove it."
  onOpen={handleAddSampleCourse} // stable or inline — both are fine
>
  <TimetableGrid />
</TourStep>
```

#### Example: Custom Trigger
```tsx
import { TourTrigger } from "@/components/guided-tour";

<TourTrigger asChild hideAfterComplete>
  <Button variant="outline" size="sm">Show me around</Button>
</TourTrigger>
```

### Accessibility
- Popover is `role="dialog"` with `aria-modal`, `aria-labelledby` (title) and `aria-describedby` (content). A visually hidden "Step N of M" prefix is announced with the title.
- Focus moves into the popover on every step and is restored to the previously focused element when the tour ends. `Tab` / `Shift+Tab` are trapped inside the popover.
- Keyboard: `→` next, `←` back, `Escape` exit. Close button has `aria-label="Close tour"`; icons are `aria-hidden`.
- Progress uses the shadcn `Progress` (Radix `role="progressbar"`) with a descriptive `aria-label`.
- Overlay panels are `aria-hidden` and block pointer events everywhere except the highlighted target.

### Guidelines & Gotchas
- **Unique `id` per portal**: The registry is a `Map` keyed by `id`. Duplicates log a `platform.warn` and the last registration wins. Because `/platform` and `/organisations` have separate providers, ids only need to be unique within one portal.
- **`order` is global to the provider**: If two tools' pages are ever rendered together (rare), their orders interleave. Keep ids and orders tool-prefixed when in doubt.
- **`startTour` snapshots the step list**: Steps that register *after* `startTour()` is called are not part of that run. This is why `TourManager` uses a delay, and why portal-only steps should use `selector` / `triggerSelector` rather than expecting the `TourStep` to mount mid-tour.
- **Missing targets are skipped, not fatal**: If a target never appears within 2s, the step is skipped in the direction of travel and a warning is logged. If no step could be shown at all, the tour ends *without* marking completion.
- **`selector` must be a valid CSS selector**: Invalid selectors are caught, logged, and treated as "not found". Prefer `data-*` attributes over class names.
- **`onOpen` runs before the wait**: Anything `onOpen` mounts is picked up by the target wait — no need to add manual timeouts.
- **Wrapper `div`**: `TourStep` always wraps children in a `div`. Use `className="contents"` to make it layout-transparent, or `"w-full"` / `"flex-1"` to preserve sizing.
- **Two persistence layers**: The provider's `ranOnce` / `storageKey` only matter when `autoStart` is on (it is off globally). Per-tool "seen" state belongs in that tool's `TourManager` key. `TourTrigger hideAfterComplete` reads the *provider's* key, so it only makes sense alongside `autoStart`.
- **Scroll lock**: `document.body.style.overflow` is set to `hidden` while active. Inner scroll containers still scroll; `scrollIntoView` still works. Do not add a competing scroll lock in the tool.
- **Client component**: `guided-tour.tsx` is `"use client"`. `TourStep` can be rendered from a server component file as long as the file importing it is fine with a client boundary.

---

## NEW TOOL ALERT

### Overview
- Located at `@/components/new-tool-alert` (`src/components/new-tool-alert.tsx`).
- A floating announcement toast that appears in the top-right corner (`top-20 right-4 z-[100]`) across all viewports to direct users to a newly launched feature.
- Includes slide-in animation, a dismiss button (`X`), and an animated ghost button linking directly to the target route using Next.js `router.push()`.
- **Auto-derives a localStorage key from the `href` prop** so you never need to manually invent or track storage keys.
- **Auto-dismisses when the user visits the target page** — no companion component needed. The old `DismissNewToolAlert` component has been removed.
- Responsive: visible on all screen sizes. On mobile, constrained to `max-w-[calc(100vw-2rem)]` to avoid obstructing the viewport. On `xs:` breakpoint and below, the tag pill is hidden to save space.

### Component Props
```tsx
export interface NewToolAlertProps {
  href: string;                          // Target route path (e.g. "/platform/ashokan-around"). Also used to auto-derive the storage key.
  title?: string;                        // Display name of the tool (default: "our new feature")
  className?: string;                    // Optional styling overrides
  storageKey?: string;                   // Explicit localStorage key override. When omitted, derived as "new-tool-alert:{href}".
  hideUntilWhatsNewDismissed?: boolean;  // If true, hides alert until WhatsNewModal has been dismissed (default: false)
  tagText?: string;                      // Text inside the tag pill (default: "New Feature Added!")
  linkText?: string;                     // Text on the link button (default: "Check out {title}!")
  children?: React.ReactNode;            // Fully custom content — replaces the default Announcement body
}
```

### Where to Use
- Place in the platform or organisation root layout (`src/app/platform/layout.tsx` or `src/app/organisations/layout.tsx`).
- Only **one** active `NewToolAlert` should typically run per portal at a time.
- **No companion component needed on the target page.** The alert auto-dismisses when the user navigates to `href`.

### How to Use & Implementation

#### Single Step: Add `NewToolAlert` to Root Layout
Add the alert to `src/app/platform/layout.tsx` (or `src/app/organisations/layout.tsx`). The only required prop is `href`:
```tsx
import { NewToolAlert } from "@/components/new-tool-alert";
import { WhatsNewModal } from "@/components/whats-new-modal";

export default function PlatformRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <NewToolAlert
        href="/platform/ashokan-around"
        title="Ashokan Around"
        hideUntilWhatsNewDismissed
      />
      <WhatsNewModal />
      {/* Rest of platform layout */}
      {children}
    </div>
  );
}
```

That's it — no storage keys to invent, no `DismissNewToolAlert` to place on the target page.

#### Example: Custom Text
```tsx
<NewToolAlert
  href="/organisations/ads"
  title="Create Advertisements"
  tagText="Beta Launch"
  linkText="Try the new ads builder →"
/>
```

### Guidelines & Gotchas
- **Route Suppression**: `NewToolAlert` automatically suppresses itself when `pathname === href` or `pathname.startsWith(href + '/')`. Users never see the alert while already inside the tool.
- **Auto-Dismiss on Visit**: When the user navigates to the `href` route, the component writes `localStorage.setItem(derivedKey, 'true')` automatically. On subsequent loads, the alert does not reappear.
- **Priority Coordination (`hideUntilWhatsNewDismissed`)**: Set this to `true` when `WhatsNewModal` is also mounted. This ensures the alert does not pop up over the modal on initial visit — it waits until the user has dismissed the modal.
- **Storage Key Derivation**: The key is auto-derived as `"new-tool-alert:{href}"` (e.g. `"new-tool-alert:/platform/ashokan-around"`). You can override this with the `storageKey` prop if needed, but in practice you should never need to.
- **Responsive Layout**: The alert is visible on all screen sizes. On mobile, it is constrained in width and the tag pill is hidden (`hidden xs:block`) to keep the toast compact.

---

## WHAT'S NEW DIALOG

### Overview
- Component: `@/components/whats-new-modal` (`src/components/whats-new-modal.tsx`).
- Data File: `/public/whats-new.json`.
- A centralized popup dialog that informs users of recent updates, new features, improvements, and bug fixes across the entire platform.
- Already mounted globally in root layouts (`src/app/platform/layout.tsx` and `src/app/organisations/layout.tsx`). **Do not mount it inside individual pages or tool directories.**
- Triggers automatically when `whats-new.json` contains a `version` higher or different from the user's stored `whats-new-dismissed-version` in `localStorage`.

### Data Schema (`public/whats-new.json`)
The modal fetches its content directly from `public/whats-new.json` on client load:
```json
{
  "version": "1.1.0",
  "lastUpdated": "2026-09-15",
  "updates": [
    {
      "id": "ashokan-around-launch",
      "title": "NEW FEATURE: Ashokan Around!",
      "description": "Find and share accommodation during this internship season! Connect with other Ashokans to find roommates or offer spare rooms.",
      "type": "new",
      "link": "/platform/ashokan-around"
    },
    {
      "id": "sem-planner-export-fix",
      "title": "Calendar Export Fixed",
      "description": "Resolved an issue where ICS files failed to export for specific course slot arrangements.",
      "type": "fix"
    }
  ]
}
```

### TypeScript Data Types
```tsx
interface UpdateItem {
  id: string;                                          // Unique identifier for the item
  title: string;                                       // Headline of the update
  description: string;                                 // 1-2 sentence description
  type: 'new' | 'improvement' | 'feature' | 'fix';    // Badge category
  link?: string;                                       // Optional internal route to feature
  icon?: string;                                       // Optional icon identifier
}

interface WhatsNewData {
  version: string;     // Semantic version string (e.g., "1.1.0")
  lastUpdated: string; // ISO date string (YYYY-MM-DD)
  updates: UpdateItem[];
}
```

### Badge Types & Color Mapping
The modal automatically assigns styled badges based on the `type` property:
- `'new'`: Green badge (`bg-green/20 text-green-dark border-green/30`)
- `'improvement'`: Blue badge (`bg-blue/20 text-blue-dark border-blue/30`)
- `'feature'`: Purple badge (`bg-purple/20 text-purple-dark border-purple/30`)
- `'fix'`: Orange badge (`bg-orange/20 text-orange-dark border-orange/30`)

### Release Workflow (How to Trigger an Update)
When releasing a new tool or platform update:
1. **Open `public/whats-new.json`**.
2. **Increment the `version` field** (e.g. `"1.0.9"` -> `"1.1.0"`).
   - Changing this version string is what causes the modal to reappear for all users.
3. **Set `lastUpdated`** to the current date (`YYYY-MM-DD`).
4. **Prepend your update object(s)** to the top of the `updates` array:
   ```json
   {
     "id": "unique-kebab-slug",
     "title": "Headline in Title Case or CAPS",
     "description": "Clear explanation of the feature and how it benefits the user.",
     "type": "new",
     "link": "/platform/tool-route"
   }
   ```
5. **No changes to React components required**. The globally mounted `<WhatsNewModal />` handles detection, delay timers, and dismissal storage.

### Modal Behavior & Gotchas
- **Delay & Dismiss Lockout**:
  - Modal opens 1500ms after initial page load to let the primary UI render first.
  - The close button (`X`) and "Got it!" button are locked for the first 1500ms after opening (`canDismiss = false`). This prevents reflexive dismissals and ensures users read the announcement.
- **Route Exclusion**: The modal skips displaying on `/when2meet` (`pathname.includes('/when2meet')`) to avoid interrupting user scheduling workflows.
- **Storage Persistence**: Clicking "Got it!" writes `localStorage.setItem('whats-new-dismissed-version', data.version)`. The modal will not display again until `version` is bumped in `public/whats-new.json`.

---

## ORIENTATION DIALOG

### Overview
- Located at `@/components/orientation-dialog` (`src/components/orientation-dialog.tsx`).
- A responsive helper dialog that detects when a user is accessing a wide or desktop-optimized tool on a mobile device in portrait orientation.
- Advises the user to rotate their device into landscape mode for the best viewing experience, featuring a configurable icon illustration and an explicit dismiss button.
- Automatically listens to viewport dimensions and orientation change events (`resize` and `orientationchange`).
- Automatically closes itself if the user rotates their device to landscape orientation.
- Supports both **uncontrolled** (self-managing, default) and **controlled** modes via optional `open` / `onOpenChange` props.

### Dismissal Behavior
- Dismissal is **mount-scoped**: once the user taps "Continue Anyway" (or presses Escape / clicks the overlay), the dialog stays hidden for the rest of that component mount.
- If the user **navigates away and comes back**, or **reloads the page**, the dialog will show again (because the component remounts and the internal ref resets).
- If a **child component re-renders** or any state update causes the parent to re-render, the dialog does **not** reappear — the `useRef` persists across re-renders within the same mount.
- This is intentional: the dialog is a gentle nudge, not a one-time gate.

### Component Props
```tsx
import { type LucideIcon } from 'lucide-react';

export interface OrientationDialogProps {
  title?: string;                        // Dialog title (default: "Rotate Your Device")
  description?: string;                  // Body text (default: landscape prompt message)
  dismissLabel?: string;                 // Dismiss button label (default: "Continue Anyway")
  breakpoint?: number;                   // Viewport width breakpoint in px (default: 768)
  icon?: LucideIcon;                     // Icon component (default: RotateCcw)
  open?: boolean;                        // Controlled open state
  onOpenChange?: (open: boolean) => void;// Controlled callback
}
```

### Where to Use
- Mandatory on tools with dense multi-column grids, weekly timetable views, large data tables, or canvas workflows that cannot cleanly adapt to narrow portrait mobile screens (< 768px).
- Examples in codebase:
  - **Semester Planner** (`src/app/platform/semester-planner/layout.tsx`): 5-day / 7-day slot timetable grid.
  - **Trajectory Planner** (`src/app/platform/trajectory-planner/layout.tsx`): 8-semester course planning matrix.
  - **Events Calendar** (`src/app/platform/events-calendar/events-calendar.tsx`): Monthly/weekly calendar scheduling views.
- Per `.agents/blueprints/page.md`: "In case a page cannot be made responsive properly, flag it with the user, and add the `@/components/orientation-dialog.tsx` component."
- Mount inside the tool's `layout.tsx` (or `page.tsx` if single-page).

### How to Use & Implementation
Mount `<OrientationDialog />` near the top of your page or layout JSX. It is completely self-contained and renders nothing on desktop viewports or when orientation criteria are not met. All props have sensible defaults — a bare `<OrientationDialog />` works out of the box.

#### Example: Placement in Tool `layout.tsx`
```tsx
import { OrientationDialog } from "@/components/orientation-dialog";

export default function TimetableToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* Prompts mobile portrait users to rotate to landscape */}
      <OrientationDialog />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
```

#### Example: Custom Text and Breakpoint
```tsx
<OrientationDialog
  title="Best Viewed in Landscape"
  description="This calendar grid works best when your device is held sideways."
  breakpoint={640}
/>
```

### Guidelines & Gotchas
- **Breakpoint Logic**: The dialog only triggers if **both** `window.innerHeight > window.innerWidth` (portrait) and `window.innerWidth < breakpoint` (default 768, Tailwind's `md`) are true. Tablets or desktops with taller windows will not trigger it.
- **Auto-Close Behavior**: If the user rotates the device to landscape, the dialog detects the viewport change and automatically closes without requiring a user tap.
- **Mount-Scoped Dismissal**: Dismissing the dialog persists only for the current component mount. Navigating away and back, or reloading the page, resets the dismissal. Re-renders within the same mount do **not** re-trigger the dialog.
- **Responsive Dialog Width**: The dialog uses `max-w-[90vw] sm:max-w-md` to avoid overflowing on very small screens.
- **Controlled Mode**: For advanced use cases where the parent needs to control visibility (e.g., showing the dialog only when switching to a specific view), pass `open` and `onOpenChange` props. In controlled mode, auto-detection is disabled.
- **Client Component Only**: Because it attaches listeners to `window`, it is a `'use client'` component. It can be safely imported and rendered in server-side `layout.tsx` or `page.tsx` files.

## FORM

## EDITOR

### Overview
- Located at `@/components/editor` (`src/components/editor.tsx`).
- Rich text editor built on top of TipTap (`@tiptap/react`, `@tiptap/starter-kit`, and `@/components/ui/shadcn-io/minimal-tiptap`).
- Features a toolbar with rich formatting tools: Bold, Italic, Strikethrough, Inline Code, Headings (H1, H2, H3), Bullet Lists, Ordered Lists, Blockquotes, Horizontal Rules, and Undo/Redo.
- Consumes and outputs standard formatted **HTML strings** via `editor.getHTML()`.
- Uses client-side mounting protection internally, but **must** always be dynamically imported using `next/dynamic` with `ssr: false` in Next.js client components to prevent SSR hydration errors.

### Component Props
```tsx
interface EditorProps {
  value?: string;                                           // Current HTML content string
  onChange?: (value: string) => void;                       // Callback returning updated HTML string
  placeholder?: string;                                     // Placeholder text (default: "Start writing your content...")
  className?: string;                                       // Styling applied to outer container
  // Legacy props for backward compatibility
  editorData?: string;
  setEditorData?: React.Dispatch<React.SetStateAction<string>>;
  handleOnUpdate?: (editor: string, field: string) => void;
}
```

### CRITICAL RULE: Mandatory Rich Text Processing
> [!IMPORTANT]
> **Rich text content output by `Editor` MUST ALWAYS be processed and rendered as rich text on the frontend.**
> Never render rich text output as raw text (e.g. `{content}`). Rendering rich text as regular text will display raw HTML tags (`<p><strong>...</strong></p>`) to the user, completely breaking the UI design and readability.
> Rich text must never go across display surfaces as regular unformatted text unless an explicit unstyled plain-text excerpt is specifically requested.

#### How to Render Rich Text on the Frontend
1. **Always Use `dangerouslySetInnerHTML` with Tailwind's `prose`**:
   Because Tailwind resets all default HTML element styles, simply rendering HTML without typography utilities will strip out heading sizes, bullet points, numbers, and spacing. You must pair `dangerouslySetInnerHTML` with Tailwind's `prose` classes.
2. **Standard Rich Text Renderer Component**:
   Whenever rendering stored rich text, implement or wrap it using this pattern:
   ```tsx
   import { cn } from "@/lib/utils";

   interface RichTextRendererProps {
     html: string | null | undefined;
     className?: string;
   }

   export function RichTextRenderer({ html, className }: RichTextRendererProps) {
     if (!html || html.trim() === "") {
       return <p className="text-sm text-muted-foreground italic">No content available</p>;
     }

     return (
       <div
         className={cn(
           "prose prose-sm dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300",
           className
         )}
         dangerouslySetInnerHTML={{ __html: html }}
       />
     );
   }
   ```

### Where to Use
- **Input & Authoring Forms**:
  - Email draft composers (e.g. `src/app/platform/sg-compose/new/page.tsx`).
  - Induction form descriptions, questions, and submission prompts.
  - Club / organisation catalog descriptions and announcements (`src/app/platform/organisations-catalog`).
  - Event descriptions, job & internship posts, and survey instructions.
- **Display & Review Surfaces**:
  - Tables, review drawers, and modal dialogs displaying user-submitted rich content (e.g. `sg-compose/dashboard/columns.tsx`, `sg-compose/outbox/columns.tsx`).
  - Organisation profile cards and public feature showcases (`_components/organisation-card.tsx`).

### How to Use & Implementation

#### Step 1: Dynamic Import with `ssr: false`
Always import `Editor` using Next.js `dynamic()` inside a client component (`"use client"`):
```tsx
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

// Mandatory dynamic import to prevent TipTap SSR window errors
const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
  loading: () => (
    <div className="border rounded-md min-h-[200px] p-4 text-sm text-muted-foreground">
      Loading editor...
    </div>
  ),
});
```

#### Step 2: Integrate into Form State
```tsx
export function ExampleComposeForm() {
  const [content, setContent] = useState<string>("");

  const handleSubmit = async () => {
    // Send raw HTML string across the API
    await fetch("/api/platform/example-tool", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bodyHtml: content }),
    });
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Message Body</label>
      <div className="border rounded-md overflow-hidden">
        <Editor
          value={content}
          onChange={setContent}
          placeholder="Start typing your formatted content..."
          className="min-h-[250px]"
        />
      </div>
    </div>
  );
}
```

### Guidelines & Gotchas
- **Dynamic Import is Mandatory**: Never import `import Editor from "@/components/editor"` statically in an App Router file. TipTap accesses DOM window APIs that will throw hydration errors during server-side evaluation. Always use `dynamic(() => import("@/components/editor"), { ssr: false })`.
- **Prose Styling**: Without `prose prose-sm dark:prose-invert`, HTML tags (`<h2>`, `<ul>`, `<blockquote>`) inherit base CSS resets: lists lose bullets, headings lose sizing, and paragraphs lose bottom margins.
- **Container Borders**: The `Editor` component renders an inner rounded container, but enclosing it in `<div className="border rounded-md overflow-hidden">` gives it the standard border consistent with other form fields.
- **API Payloads**: Send the raw HTML string as-is in JSON payloads. In Strapi or databases, store it in rich-text / long-text fields. Do not strip HTML tags before storage.


## SIDEBAR

## PAGE TITLE

### Overview
- Located at `@/components/page-title` (`src/components/page-title.tsx`).
- Default export: `import PageTitle from "@/components/page-title";`.
- Mandatory header component for every tool and top-level page in the platform.
- Renders a prominent, responsive heading with an optional animated entry effect powered by `WritingText` (`@/components/ui/shadcn-io/writing-text`), an optional leading category/feature icon with theme-aware accent coloring (`text-primary dark:text-primary-bright`), and an optional expandable description (`ExpandableText`) for long explanations.
- Fully responsive: scales smoothly from mobile phones (`text-xl`) through tablet (`text-2xl`) to desktop (`text-3xl`), with responsive icon sizing (`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8`) and break-word safety.
- Highly composable: supports custom heading levels (`as="h1"` by default), action buttons slot (`actions`), and status badges/pills (`badge`).
- Custom styles: spreads HTML container attributes and merges `className` cleanly using `cn()`.

### Component Props & Types
```tsx
export interface PageTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly text: string;                                       // Primary title text (Required)
  readonly subheading?: string | React.ReactNode;              // Description text or custom node
  readonly icon?: React.ComponentType<{ className?: string }>; // Lucide or SVG icon component
  readonly actions?: React.ReactNode;                          // Action buttons / controls (aligned right on desktop, stacked on mobile)
  readonly badge?: React.ReactNode;                            // Status pill or badge next to title
  readonly animate?: boolean;                                  // Whether to run WritingText spring animation (default: true)
  readonly as?: "h1" | "h2" | "h3" | "div";                    // Semantic heading tag (default: "h1")
  readonly className?: string;                                 // Additional styling for the header container
}
```

### Where to Use
- **Mandatory on every tool page in the platform**.
- Place at the very top of the page's main content container:
  - In `page.tsx` if single-page tool without dedicated layout.
  - In `layout.tsx` if all sub-routes share the same primary tool title.
- Reference rule from `.agents/blueprints/page.md`:  
  "Always have a Page Title (`@/components/page-title.tsx`) and Developer Credits (`@/components/developer-credits.tsx`) component in the page. Developer Credits will be in `layout.tsx` if present, or `page.tsx` otherwise."

### How to Use & Implementation

#### Example: Standard Tool Page Header
```tsx
import PageTitle from "@/components/page-title";
import { Calendar } from "lucide-react";

export default function EventsCalendarPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <PageTitle
        text="Events Calendar"
        icon={Calendar}
        subheading="Discover upcoming student body and club events happening across campus."
      />
      {/* Tool content */}
    </div>
  );
}
```

#### Example: With Actions and Status Badge
```tsx
import PageTitle from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, WifiPen } from "lucide-react";

export default function WifiTicketsPage() {
  return (
    <PageTitle
      text="WiFi Tickets"
      icon={WifiPen}
      subheading="Report connectivity issues to IT and track resolution progress."
      badge={<Badge variant="secondary">Beta</Badge>}
      actions={
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Ticket
        </Button>
      }
      className="mb-6"
    />
  );
}
```

### Guidelines & Gotchas
- **Semantic Hierarchy**: Always keep `as="h1"` for top-level pages for SEO and accessibility. Use `as="h2"` only when mounting inside nested sub-sections or modal drawers.
- **Long Subheadings**: When passing a `string` to `subheading`, it automatically wraps with `ExpandableText`, cleanly truncating on small mobile viewports with a "read more" toggle. If passing custom JSX nodes, handle wrapping explicitly.
- **Icon Sizing**: Do not specify hardcoded icon sizes in the `icon` prop. The component internally handles responsive scaling (`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8`).
- **Layout Margins**: Use `className="mb-6"` or wrap with layout containers like `<div className="space-y-6">` to manage vertical spacing between the title and page content.

---

## DEVELOPER CREDITS

### Overview
- Located at `@/components/developer-credits` (`src/components/developer-credits.tsx`).
- Default export: `import DeveloperCredits from "@/components/developer-credits";`.
- Mandatory footer component that provides consistent attribution to the students and developers who engineered or designed the tool.
- Renders a semantic, centered, muted footer (`<footer>`) with responsive spacing (`border-t pt-6 sm:pt-8 mt-6 sm:mt-8`) and typography (`text-xs sm:text-sm`).
- Formatted as:  
  `Feature developed by Name - Role, Name - Role`.
- Fully responsive: uses a flex-wrapping inline layout with non-breaking capsules so contributor names and roles don't break awkwardly across line boundaries on mobile screens.
- Supports optional external profile links (e.g. LinkedIn, GitHub) which render with primary brand accent colors and open safely in a new tab (`target="_blank"` with `rel="noopener noreferrer"`).
- Null-safe: gracefully renders `null` if the `developers` array is undefined, null, or empty.

### Component Props & Types
```tsx
export interface Developer {
  readonly name: string;        // Full name of contributor (Required)
  readonly role?: string;       // Role/contribution title (e.g., "Lead Developer", "UI/UX Designer")
  readonly profileUrl?: string; // Optional URL to LinkedIn, GitHub, or personal portfolio
}

export interface DeveloperCreditsProps extends React.HTMLAttributes<HTMLElement> {
  readonly developers?: readonly Developer[]; // Array of contributors (renders null if empty)
  readonly label?: string;                    // Attribution prefix (default: "Feature developed by")
  readonly className?: string;                // Additional styling for footer element
}

export type DeveloperProps = DeveloperCreditsProps; // Backwards-compatible alias
```

### Where to Use
- **Mandatory on every tool page in the platform**.
- Always place at the very bottom of the tool's container:
  - Inside the tool's `layout.tsx` (if a multi-page tool layout exists).
  - Inside `page.tsx` (if the tool is single-page without a dedicated layout).
- Reference rule from `.agents/blueprints/page.md`:  
  "Always have a Page Title (`@/components/page-title.tsx`) and Developer Credits (`@/components/developer-credits.tsx`) component in the page. Developer Credits will be in `layout.tsx` if present, or `page.tsx` otherwise."

### How to Use & Implementation
Define a typed array of developer objects and pass it to `<DeveloperCredits developers={developers} />`. When generating a new tool, prompt the user to provide developer details if unknown.

#### Example: Placement in Tool `layout.tsx`
```tsx
import React from 'react';
import DeveloperCredits from '@/components/developer-credits';

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const developers = [
    {
      name: "Soham Tulsyan",
      role: "Lead Developer",
      profileUrl: "https://www.linkedin.com/in/soham-tulsyan-0902482a7/",
    },
    {
      name: "Vaani Goenka",
      role: "UI/UX Designer",
    },
    {
      name: "Previous Teams", // For legacy features ported to the new platform
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
      {children}
      
      {/* Placed at the bottom of the page container */}
      <DeveloperCredits developers={developers} />
    </div>
  );
}
```

### Guidelines & Gotchas
- **Prompting for Names**: If implementing a new tool from scratch or PRD, always ask the user for contributor names, roles, and profile links before committing.
- **Link Handling**: Ensure `profileUrl` includes the full URL protocol (e.g., `https://...`). Links automatically open in a new tab with `rel="noopener noreferrer"`.
- **Empty Array Handling**: If no developers are passed or the array is empty (`[]`), the component automatically returns `null` (no orphan border line or empty prefix is shown).
- **Custom Prefix**: Use the `label` prop if a different attribution is appropriate (e.g., `<DeveloperCredits label="Designed & built by" developers={developers} />`).
- **Separators & Fallbacks**: The component automatically joins developers with commas and omits the role dash (`-`) if `role` is omitted or empty.

## COLLABORATION BANNER (INITIATIVE CREDITS)

### Overview
- Located at `@/components/initiative-credits` (`src/components/initiative-credits.tsx`).
- Default export: `import InitiativeCredits from "@/components/initiative-credits";`.
- Footer attribution component used when a tool or portal module is built in cross-functional partnership with student bodies, student government departments, or campus organizations (e.g., Jazbaa, MAA, Office of Student Affairs).
- Formats partner names into an accessible grammatical sentence with proper Oxford commas and "and" conjunctions (e.g. *"A collaborative initiative with Techmin, Jazbaa, MAA, and Office of Student Affairs"*).
- Supports clickable external partner links with primary brand accent styling and secure tab attributes (`target="_blank"` with `rel="noopener noreferrer"`).
- Automatically pairs with `DeveloperCredits` at the bottom of tool layouts.

### Component Props & Types
```tsx
export interface InitiativePartner {
  name: string;        // Partner name (e.g., "Jazbaa", "Office of Student Affairs")
  role?: string;       // Optional partner role or descriptor
  url?: string;        // Optional website or social link
}

export interface InitiativeCreditsProps {
  title?: string;                                 // Attribution prefix (default: "A collaborative initiative with")
  partners?: (string | InitiativePartner)[];      // Array of partner names or partner objects (default: ['Techmin', 'Jazbaa', 'MAA', 'Office of Student Affairs'])
  className?: string;                             // Additional container classes
  hideBorder?: boolean;                           // Whether to omit top border and top spacing (default: false)
}
```

### Where to Use
- Bottom of layout wrappers for collaborative modules (e.g., `src/app/platform/inductions/layout.tsx` and `src/app/organisations/inductions/layout.tsx`).
- Place immediately after `{children}` and before/after `DeveloperCredits`.

---

## STATUS & FALLBACK SCREENS

Guidelines, specifications, and architecture for system status, downtime, work-in-progress, and 404 screens across the platform.

### Overview
- Standardized components representing platform states:
  1. **Under Maintenance** (`@/components/under-maintenance`): Displayed when a tool, database, or sub-route is undergoing scheduled maintenance or temporary repairs.
  2. **Under Construction** (`@/components/under-construction`): Displayed for newly announced tools, unreleased sections, or pages pending launch (e.g. root landing page `src/app/page.tsx`).
  3. **Not Found** (`@/components/not-found`): Displayed when a user navigates to an invalid URL, deleted resource, or unhandled 404 route (e.g. root 404 page `src/app/not-found.tsx`).
- Built around a unified design language:
  - **Platform Cat Mascot**: Custom character illustrations matching each specific state.
  - **Neutral, Restrained Chrome**: Plain muted status badges (`bg-muted border border-border text-muted-foreground`) without flashy yellow accents, vibrating animations, or distracting emoji sparkles.
  - **Co-located Mascot & Badge**: Badge and mascot tightly grouped inside a single flex-column block (`gap-4 mb-8`) to eliminate unwanted whitespace drift.
  - **Consistent Actions & Exploration**: Standardized navigation buttons with accessible 44px minimum touch targets and an opt-in suggestions grid highlighting core platform tools.
  - **Haptic Tactility**: Tactile vibrations via the centralized `@/lib/haptics` utility.

---

### Mascot & Haptic Feedback Architecture

#### 1. Mascot Illustration Assets
The platform utilizes dedicated illustrations of the platform cat mascot for each screen state:
- **Maintenance Mascot**: `/mascot-maintenance.png` — A grey tabby in round glasses and a work apron, holding a wrench and a gear.
  - Container sizing: `w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64`
- **Construction Mascot**: `/mascot-construction.png` — A grey tabby in glasses and a work apron, seated at a wooden workbench assembling glowing gears with a hard hat.
  - Container sizing: `w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96` (scaled larger for hero presentation without pushing content off-screen).
- **Not Found Mascot**: `/mascot-not-found.png` — A grey tabby in glasses and a work apron with X marks over both eyes, holding a magnifying glass and looking confused.
  - Container sizing: `w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64`

All mascots are rendered using Next.js `Image` with:
- `fill` and `className="object-contain"` to preserve intrinsic aspect ratios without stretching.
- `priority` flag enabled to prevent Largest Contentful Paint (LCP) delays.
- Descriptive, accessible `alt` text detailing the mascot's attire and posture for screen readers.

#### 2. Centralized Haptics Engine (`@/lib/haptics`)
Haptic feedback is routed exclusively through `@/lib/haptics` (`src/lib/haptics.ts`), which wraps `web-haptics`:
- **SSR Safety**: Guards against `window` / `navigator` access during Next.js server-side rendering by dynamically importing `web-haptics` inside a lazy client-side singleton.
- **Singleton Lifecycle**: Avoids creating multiple `WebHaptics` instances across re-renders and component mounts.
- **Semantic Named Presets**: Exposes clear semantic methods so call sites avoid hardcoding string literals:

```tsx
import { haptic } from "@/lib/haptics";

// Usage across UI interactions:
haptic.tap();     // Light tap — secondary buttons, back navigation, keyboard shortcuts
haptic.press();   // Standard press — primary CTA buttons, card clicks, committed actions
haptic.select();  // Discrete tick — tool exploration cards, tabs, segmented controls
haptic.confirm(); // Positive outcome — form submissions, success states
haptic.error();   // Negative outcome — validation errors, failed requests
haptic.warn();    // Cautionary — irreversible or destructive operations
```

---

### Component Specifications & Props

#### 1. Under Maintenance (`UnderMaintenance`)
- **Location**: `src/components/under-maintenance.tsx`
- **Export**: Default (`import UnderMaintenance from "@/components/under-maintenance"`)
- **Badge**: `<Wrench className="w-3 h-3" /> Under Maintenance`
- **Actions**: "Back to Platform" link (`/platform`) with `haptic.tap()`
- **Explore Grid**: Enabled by default (`showExploreSuggestions = true`)

```tsx
export interface UnderMaintenanceProps {
  /** Optional custom title (default: "We're tinkering under the hood") */
  title?: string;
  /** Optional custom description (default: "Our resident cat engineer is refactoring...") */
  description?: string;
  /** Show a "Back to Platform" button (default: true) */
  showBackButton?: boolean;
  /** Show the "explore other tools" suggestion grid (default: true) */
  showExploreSuggestions?: boolean;
  /** Optional additional classes for layout overrides */
  className?: string;
}
```

#### 2. Under Construction (`UnderConstruction`)
- **Location**: `src/components/under-construction.tsx`
- **Export**: Default (`import UnderConstruction from "@/components/under-construction"`)
- **Badge**: `<HardHat className="w-3 h-3" /> Under Construction`
- **Actions**: Primary CTA button linking to `buttonHref` with `haptic.press()`
- **Subtext**: Optional helper note beneath the primary CTA (e.g., revamp notices)
- **Explore Grid**: Disabled by default (`showExploreSuggestions = false`)

```tsx
export interface UnderConstructionProps {
  /** Page or section title (default: "This page is under construction") */
  title?: string;
  /** Explanatory description shown below the title (default: "We're working hard to get this page ready...") */
  description?: string;
  /** Label for the primary CTA button (default: "Head to the Platform") */
  buttonText?: string;
  /** Href for the primary CTA button (default: "/platform") */
  buttonHref?: string;
  /** Optional small sub-note displayed below the CTA */
  subtext?: string;
  /** Show the "explore other tools" suggestion grid (default: false) */
  showExploreSuggestions?: boolean;
  /** Optional additional classes for layout overrides */
  className?: string;
}
```

#### 3. Not Found (`NotFoundComponent`)
- **Location**: `src/components/not-found.tsx`
- **Export**: Default (`import NotFoundComponent from "@/components/not-found"`)
- **Badge**: `<SearchX className="w-3 h-3" /> 404 — Not Found`
- **Dual Actions**:
  - Primary: "Back to Platform" (`/platform`) with `haptic.press()`
  - Secondary: "Go back" (`router.back()`) with `haptic.tap()`
- **Keyboard Shortcut**: Pressing `Escape` navigates to `/platform` with `haptic.tap()`. Automatically suppressed when focus is within `<input>`, `<textarea>`, or content-editable elements.
- **Explore Grid**: Enabled by default (`showExploreSuggestions = true`)

```tsx
export interface NotFoundComponentProps {
  /** Optional custom title (default: "Hmm… nothing here") */
  title?: string;
  /** Optional custom description (default: "The page you're looking for wandered off...") */
  description?: string;
  /** Show the "explore other tools" suggestion grid (default: true) */
  showExploreSuggestions?: boolean;
  /** Optional additional classes for layout overrides */
  className?: string;
}
```

---

### Where to Use
- **Root Landing Page (`src/app/page.tsx`)**: When the public marketing or home page is undergoing renovation, delegate to `<UnderConstruction />`.
- **Global 404 Page (`src/app/not-found.tsx`)**: Default Next.js App Router 404 handler. Mount `<NotFoundComponent />`.
- **Tool-Level Maintenance**: Mount `<UnderMaintenance />` inside a tool's `page.tsx` when an external service is unavailable, during scheduled data migrations, or when a tool is taken offline for maintenance.
- **Dynamic Route Fallbacks**: Render `<NotFoundComponent />` with custom title and description when dynamic entities (such as an induction form ID, club slug, or ticket ID) cannot be located in the database.

---

### How to Use & Implementation

#### Example 1: Root Landing Page Delegator (`src/app/page.tsx`)
Keep the Next.js page route as a thin orchestrator:
```tsx
"use client";

import UnderConstruction from "@/components/under-construction";

export default function LandingPage() {
  return (
    <UnderConstruction
      subtext="We're revamping the SG Website too! Stay tuned!"
    />
  );
}
```

#### Example 2: Global 404 Handler (`src/app/not-found.tsx`)
```tsx
"use client";

import NotFoundComponent from "@/components/not-found";

export default function NotFound() {
  return <NotFoundComponent />;
}
```

#### Example 3: Tool-Specific Maintenance Guard
```tsx
import UnderMaintenance from "@/components/under-maintenance";

export default function ToolPage({ params }: { params: { slug: string } }) {
  const isToolUnderMaintenance = true; // Conditional check or feature flag

  if (isToolUnderMaintenance) {
    return (
      <UnderMaintenance
        title="Course Reviews is undergoing maintenance"
        description="We're syncing the latest course catalogs and instructor rosters. Check back soon!"
      />
    );
  }

  return <div>{/* Normal tool content */}</div>;
}
```

#### Example 4: Custom Scoped 404 with Custom Copy
```tsx
import NotFoundComponent from "@/components/not-found";

export default function ClubNotFound() {
  return (
    <NotFoundComponent
      title="Club or Department not found"
      description="We couldn't locate this organisation in the campus directory. It may have been archived or renamed."
      showExploreSuggestions={true}
    />
  );
}
```

---

### Guidelines & Gotchas
- **Co-locate Badge and Mascot**: Always keep the status badge pill and mascot illustration grouped inside a single `flex flex-col items-center gap-4 mb-8` container. Do not place large headings or arbitrary margins between the badge and image.
- **Avoid "Vibe-Coded" Aesthetics**: Keep status badges plain and restrained (`bg-muted border border-border text-muted-foreground`). Do **not** apply saturated yellow badges, rainbow gradients, glowing rings, or sparkle emoji. The cat mascot brings playful warmth; the UI chrome must remain clean and aligned with the platform design system.
- **Aspect-Ratio & Responsive Image Containers**: Mascots must always be placed inside an explicit container (`relative w-48 h-48 ...`) and rendered with Next.js `Image` using `fill` and `className="object-contain"`. Never hardcode static width and height attributes on the `Image` itself without aspect-ratio protection.
- **Button Touch Targets**: All action buttons must meet accessibility standards with a minimum touch target height of 44px (`min-h-[44px]`).
- **Semantic Button Markup**: Always use `Button asChild` when wrapping Next.js `Link` components. This preserves semantic `<a>` tags for keyboard focus, right-click "Open in new tab", and screen reader accessibility while keeping shadcn button styling.
- **Haptic Preset Discipline**:
  - Use `haptic.press()` for primary call-to-actions.
  - Use `haptic.tap()` for secondary actions, "Back" navigation, and Escape shortcuts.
  - Use `haptic.select()` for explore grid links.
  - Never call `new WebHaptics()` or import `web-haptics` directly in UI components — always import `{ haptic }` from `@/lib/haptics`.
- **Keyboard Shortcut Safety**: When binding global keyboard shortcuts (such as `Escape` in `NotFoundComponent`), always verify that the active event target is not an `<input>`, `<textarea>`, or content-editable element (`!target.isContentEditable`).
- **Thin Orchestrators**: Never put hundreds of lines of UI markup directly in `src/app/page.tsx` or `src/app/not-found.tsx`. Keep route files thin and delegate to the reusable component in `src/components/`.


