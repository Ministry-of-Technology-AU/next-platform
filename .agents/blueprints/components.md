# Component Guidelines for next-platform

Guidelines, specifications, and replicable implementations for platform-wide components.

---

## NEW TOOL BANNER

### Overview
- Located at `@/components/new-tool-banner` (`src/components/new-tool-banner.tsx`).
- Used to announce the release of a brand-new tool directly inside that tool's view.
- Provides a sticky alert ribbon underneath the navigation bar with an `Info` icon, a welcome message, a direct trigger to the `FeedbackDialog` (`@/components/navbar/FeedbackDialog`), and a dismiss/close button.
- Built on top of shadcn banner primitives (`@/components/ui/shadcn-io/banner`) and styled with negative margins across breakpoints to stretch full-width across page margins.

### Component Props
```tsx
interface NewToolBannerProps {
  className?: string; // Optional class overrides (most commonly negative top margin)
}
```

### Where to Use
- Place at the top of the newly launched tool's root `layout.tsx` (if a tool layout exists) or in `page.tsx` (if single-page without a tool-specific layout).
- Once the tool is no longer in its initial launch period, remove the component from the layout/page.

### How to Use & Implementation
- Because the root layouts (`/platform/layout.tsx` and `/organisations/layout.tsx`) wrap content in `<main className="flex-1 pt-6 pb-4 px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">`, there is a default top padding of `pt-6` (24px).
- To make the banner sit flush below the sticky navbar (`top-16`), apply `className="mt-[-24px]"` when mounting.

#### Example: Placement in Tool `layout.tsx`
```tsx
import React from 'react';
import PageTitle from '@/components/page-title';
import DeveloperCredits from '@/components/developer-credits';
import { Megaphone } from 'lucide-react';
import { NewToolBanner } from '@/components/new-tool-banner';
import { DismissNewToolAlert } from '@/components/dismiss-new-tool-alert';

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
      <DismissNewToolAlert storageKey="NEW_FEATURE_ALERT_SEEN_V1" />
      
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

### Guidelines & Gotchas
- **Sticky Offset**: The banner internally has `sticky top-16 z-40`, positioning it directly below the 64px (`h-16`) navigation bar.
- **Feedback Integration**: The "Submit Feedback" button inside `NewToolBanner` automatically triggers `FeedbackDialog`. No additional feedback handlers need to be passed.
- **Lifecycle**: Do not keep `NewToolBanner` permanently. Remove it after the initial launch phase (e.g., 2-4 weeks post-launch).

---

## GUIDED TOUR

## NEW TOOL ALERT

### Overview
- Located at `@/components/new-tool-alert` (`src/components/new-tool-alert.tsx`).
- A floating announcement toast that appears in the top-right corner (`top-20 right-4 z-100`) on desktop viewports (`hidden md:block`) across the platform to direct users to a newly launched feature.
- Includes slide-in animation, a dismiss button (`X`), and an animated ghost button linking directly to the target route.
- Paired with `@/components/dismiss-new-tool-alert` (`src/components/dismiss-new-tool-alert.tsx`) to track whether the user has already visited the tool and prevent showing the notification again.

### Component Props
```tsx
interface NewToolAlertProps {
  href: string;                // Target route path (e.g. "/platform/ashokan-around" or "/organisations/ads")
  title: string;               // Display name of the tool (e.g. "Ashokan Around")
  className?: string;          // Optional styling overrides
  checkSeenKey?: string;       // localStorage key used to check if the user has already seen/visited the tool
  blockIfNewVersion?: boolean; // If true, hides alert until the user has dismissed the WhatsNewModal
}
```

### Paired Component: `DismissNewToolAlert`
- Located at `@/components/dismiss-new-tool-alert` (`src/components/dismiss-new-tool-alert.tsx`).
- Headless client component that automatically sets `localStorage.setItem(storageKey, 'true')` when the user lands on the tool.
```tsx
interface DismissNewToolAlertProps {
  storageKey: string; // Exact key matching checkSeenKey on NewToolAlert
}
```

### Where to Use
1. **`NewToolAlert`**:
   - Place in the platform or organisation layout (`src/app/platform/layout.tsx` or `src/app/organisations/layout.tsx`).
   - Only **one** active `NewToolAlert` should typically run per portal at a time.
2. **`DismissNewToolAlert`**:
   - Place inside the target tool's `layout.tsx` (or `page.tsx` if single-page).

### How to Use & Implementation

#### Step 1: Define a Unique Storage Key
Always name storage keys consistently with a version suffix so future alerts can be introduced without caching collisions:
- Format: `[TOOL_NAME]_ALERT_SEEN_V[N]` (e.g. `ASHOKA_AROUND_LAYOUT_ALERT_SEEN_V1`, `ADS_TOUR_SEEN_V1`, `ASHOKA_WHEN2MEET_ALERT_SEEN_V1`).

#### Step 2: Add `NewToolAlert` to Root Layout
Add the alert to `src/app/platform/layout.tsx` (or `src/app/organisations/layout.tsx`):
```tsx
import { NewToolAlert } from "@/components/new-tool-alert";
import { WhatsNewModal } from "@/components/whats-new-modal";

export default function PlatformRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <NewToolAlert
        href="/platform/ashokan-around"
        title="Ashokan Around"
        checkSeenKey="ASHOKA_AROUND_LAYOUT_ALERT_SEEN_V1"
        blockIfNewVersion={true}
      />
      <WhatsNewModal />
      {/* Rest of platform layout */}
      {children}
    </div>
  );
}
```

#### Step 3: Add `DismissNewToolAlert` to the Tool's Layout or Page
Add the dismiss trigger inside `src/app/platform/[tool-name]/layout.tsx` (or `page.tsx`):
```tsx
import { DismissNewToolAlert } from "@/components/dismiss-new-tool-alert";

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <DismissNewToolAlert storageKey="ASHOKA_AROUND_LAYOUT_ALERT_SEEN_V1" />
      {children}
    </div>
  );
}
```

### Guidelines & Gotchas
- **Route Suppression**: `NewToolAlert` automatically suppresses itself when `pathname === href` or `pathname.startsWith(href + '/')`. Users never see the alert while already inside the tool.
- **Priority Coordination (`blockIfNewVersion`)**: Always set `blockIfNewVersion={true}`. This ensures that if a new version modal (`WhatsNewModal`) is pending user review, the alert does not pop up over the modal on initial visit.
- **Key Consistency**: The `checkSeenKey` in `NewToolAlert` and the `storageKey` in `DismissNewToolAlert` must match character-for-character.
- **Desktop Only**: The alert renders with `hidden md:block`. It deliberately stays off mobile viewports to prevent layout clutter and obstructing core navigation.

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
- Advises the user to rotate their device into landscape mode for the best viewing experience, featuring a rotating phone icon illustration and an explicit "Continue Anyway" dismissal option.
- Automatically listens to viewport dimensions (`window.innerWidth < 768`) and orientation change events (`resize` and `orientationchange`).
- Automatically closes itself if the user rotates their device to landscape orientation.

### Component Props
```tsx
// Component takes no props
export function OrientationDialog(): JSX.Element;
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
Mount `<OrientationDialog />` near the top of your page or layout JSX. It is completely self-contained and renders `null` on desktop viewports or when orientation criteria are not met.

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

### Guidelines & Gotchas
- **Breakpoint Logic**: The dialog only triggers if **both** `window.innerHeight > window.innerWidth` (portrait) and `window.innerWidth < 768` (mobile screen below Tailwind's `md` breakpoint) are true. Tablets or desktops with taller windows will not trigger it.
- **Auto-Close Behavior**: If the user rotates the device to landscape, the dialog detects `!isPortrait` and automatically closes without requiring a user tap.
- **Graceful Dismissal**: Users can choose to bypass the recommendation by tapping "Continue Anyway", which sets local `isOpen` state to `false`.
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

## DEVELOPER CREDITS

### Overview
- Located at `@/components/developer-credits` (`src/components/developer-credits.tsx`).
- Default export: `import DeveloperCredits from "@/components/developer-credits";`.
- Mandatory footer component that provides consistent attribution to the students and developers who engineered or designed the tool.
- Renders a centered, muted footer with a top border (`border-t pt-8 mt-8`) formatted as:  
  `Feature developed by Name - Role, Name - Role`.
- Supports optional external profile links (e.g. LinkedIn, GitHub) which render with primary brand accent colors and open safely in a new tab (`target="_blank"`).

### Component Props & Types
```tsx
export interface Developer {
  name: string;        // Full name of contributor (Required)
  role?: string;       // Role/contribution title (e.g., "Lead Developer", "UI/UX Designer")
  profileUrl?: string; // Optional URL to LinkedIn, GitHub, or personal portfolio
}

export interface DeveloperProps {
  developers: Developer[];
}
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
- **Link Handling**: Ensure `profileUrl` includes the full URL protocol (e.g., `https://...`). Links open in a new tab (`target="_blank"`).
- **Separators & Fallbacks**: The component automatically joins developers with commas and omits the role dash (`-`) if `role` is omitted or empty.

## COLLABORATION BANNER
