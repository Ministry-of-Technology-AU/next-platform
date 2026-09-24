---
name: guided-tour
description: How to add a guided tour to a tool page in next-platform using the guided-tour component. Use when creating a new tool, adding a walkthrough to an existing tool, editing tour steps, or reviewing a tour for accessibility. Covers picking targets, ordering steps by user flow, writing step text, handling hidden or portal targets, auto-launch on first visit, and screen reader support.
metadata:
  author: next-platform
  version: "1.0"
---

# Add a Guided Tour to a Page

A guided tour is a short walkthrough that shows a new user what each part of a page does. It dims the page, highlights one element at a time, and shows a small card with a title and one or two sentences. The user clicks Next to move on.

This skill tells you how to add one. The component itself is documented in `.agents/blueprints/components.md` under "GUIDED TOUR". Read that section first for props and examples. This file is about doing it well.

## When to use this skill

- You are building a new tool page (also see `.agents/blueprints/page.md`).
- You are adding a tour to a tool that does not have one.
- You are changing, adding, or removing tour steps.
- You are checking a tour for accessibility.

## What you get for free

The tour system is already set up. You do not need to mount anything global.

- `TourProvider` is mounted in `src/app/platform/layout.tsx` and `src/app/organisations/layout.tsx`. Never add another one.
- The help button in the navbar starts the tour on any page that has steps.
- Keyboard support, focus handling, screen reader labels, scroll lock, and skipping of missing steps are built into the component.

Your job is only to decide **what** to highlight, **in what order**, and **what to say**.

## Step 1: Map the user flow before writing any code

Do not start by wrapping elements. Start by writing down how a real user uses the page from start to finish.

Ask these questions in order:

1. What does the user want to get done on this page? (One sentence.)
2. What is the very first thing they look at or touch?
3. What do they do next? And after that? Keep going until the task is done.
4. What are the side things they may use on the way (filters, settings, help)?
5. Where do they end up? (A result, a saved item, a submitted form.)

Write this as a numbered list in your working notes. Example for a course search page:

```
Goal: pick courses for next semester.
1. Search for a course by name.
2. Filter the results by department.
3. Look at the results table.
4. Click a course to see details.
5. Add it to the plan.
6. See the plan update on the right.
7. Save the plan.
```

The tour step order must match this list exactly. The tour should feel like someone sitting next to the user, pointing at things in the same order the user would use them. Never order steps by where they sit on screen. Order them by when the user needs them.

## Step 2: List every major component and give each one a step

Every major part of the page gets a step. "Major" means anything the user must touch or read to finish the task, plus anything they will wonder about.

Include:

- Every input the user fills in (search, selects, text fields, date pickers, file upload).
- Every button that changes state or submits (Add, Save, Submit, Cancel, Export).
- Every area that shows results or data (tables, cards, calendars, charts, previews).
- Every side panel, tab set, or drawer the user opens as part of the flow.
- Every status or summary area (totals, credit counts, progress).

Skip:

- Page title, developer credits, banners, and other chrome that repeats on every page.
- Decorative elements.
- Things that appear only in error states.

If the page has a lot of parts, the tour will be long. That is fine. Long and complete is better than short and confusing. Ten to fifteen steps is normal for a full tool. If it goes past twenty, ask the user if the page should be split into more than one tour.

## Step 3: Put the step where the element lives

`TourStep` works from any depth. It does not have to be in `page.tsx`. Put the `TourStep` wrapper directly around the element inside whatever component renders it.

Do this:

```tsx
// src/app/platform/my-tool/_components/search-bar.tsx
import { TourStep } from "@/components/guided-tour";

export function SearchBar({ onSearch }: Props) {
  return (
    <TourStep
      id="my-tool-search"
      order={1}
      title="Search for a course"
      content="Type a course name, code, or professor. Results update as you type."
      position="bottom"
    >
      <Input placeholder="Search courses" onChange={(e) => onSearch(e.target.value)} />
    </TourStep>
  );
}
```

Do not do this:

```tsx
// page.tsx wrapping a whole section that contains five separate controls
<TourStep id="controls" order={1} title="Controls" content="Use these to filter.">
  <FilterPanel />
</TourStep>
```

Wrapping a whole section gives the user a big glowing box and no idea what to do. Go inside `FilterPanel` and wrap each control that matters.

## Step 4: Write the step text

Each step has a `title` and a `content`. Follow the platform writing style in
`.agents/context/writing.md` (no em dashes, plain words, no "click here", Indian English), and
run its `/humanizer` pass over all step text once the tour is written. Tour-specific rules:

- **Title**: two to five words. Say what the thing is or what it does. Use a verb when the user is meant to act. Examples: "Search for a course", "Pick a department", "Your timetable", "Save your plan".
- **Content**: one or two short sentences. Say what to do and what happens. Do not describe how it looks (the user can see it). Do not use words like "simply", "just", or "easily".
- Use plain words. Write for a first year student who has never seen the tool.
- Never use an em dash. Use a comma, a full stop, or a new sentence.
- Do not mention the step number. The component adds "Step 3 of 12" for screen readers on its own.
- Do not say "click here". Screen reader users do not click and cannot see "here". Say what the control is: "Press Add to put the course in your plan."

Good:

```
title: "Filter by department"
content: "Pick a department to show only its courses. Leave it empty to see everything."
```

Bad:

```
title: "Department Filter Dropdown"
content: "This is the department filter dropdown which you can simply use to easily narrow down the list of courses shown in the results table below by clicking here."
```

## Step 5: Set the order and position

- `order` is a number. Steps run from lowest to highest. Use gaps of 10 (10, 20, 30) so you can insert a step later without renumbering everything.
- `id` must be unique across the whole portal. Prefix it with the tool name: `sem-planner-search`, `sg-compose-subject`. Duplicates log a warning and one of them is dropped.
- `position` is where the card sits relative to the element. Pick the side that has room and does not cover the next thing in the flow. The component falls back to another side if there is no room, so a wrong guess is not fatal, but a right guess looks better.
  - Inputs in a top bar: `"bottom"`.
  - Items in a left sidebar: `"right"`.
  - Items in a right sidebar: `"left"`.
  - Buttons at the bottom of a form: `"top"`.

## Step 6: Handle elements that are not on screen yet

Some targets only exist after the user opens something (a sheet, a dialog, a tab, a dropdown). The tour cannot highlight what is not in the page. You have three tools for this. Pick the simplest one that works.

### Option A: `onOpen`

A function that runs right before the step shows. Use it to set state that mounts the target.

```tsx
<TourStep
  id="my-tool-preferences-panel"
  order={30}
  title="Set your preferences"
  content="Choose which categories you want to see."
  onOpen={() => setShowPreferences(true)}
>
  ...
</TourStep>
```

### Option B: `triggerSelector`

A CSS selector for a button the tour should click before the step shows. Use this when the open button lives in another component and you do not want to lift state.

```tsx
<TourStep
  id="my-tool-filters"
  order={20}
  title="Filter the list"
  content="Open filters to narrow the list by date or category."
  triggerSelector="[data-tour-open-filters]"
>
  ...
</TourStep>
```

Add `data-tour-open-filters` to the button. Do not use class names as selectors. They change when styles change.

### Option C: `selector` for portal content

Dialogs and sheets render in a portal, which means the target is not inside the `TourStep` wrapper. Use `selector` to point at it, and leave `children` empty. The `TourStep` then only registers the step and renders nothing.

```tsx
// Registers the step. Renders nothing.
<TourStep
  id="my-tool-date-picker"
  order={40}
  title="Pick a date"
  content="Choose a day to see its events."
  triggerSelector="[data-tour-open-preferences]"
  selector="[data-tour-target='date-picker']"
/>

// Inside the sheet, on the real element:
<Calendar data-tour-target="date-picker" ... />
```

### Keep the container open for every step inside it

If a component opens itself when the tour reaches a step, it must stay open for every step that lives inside it, not only the first. Check `currentStepId` against all of them:

```tsx
const { isActive, currentStepId } = useTour();
const stepsInsideSheet = ["my-tool-filters", "my-tool-date-picker", "my-tool-categories"];

useEffect(() => {
  setShowSheet(isActive && stepsInsideSheet.includes(currentStepId ?? ""));
}, [isActive, currentStepId]);
```

If you forget one, the sheet closes, the target disappears, and that step is skipped.

### What happens if the target never shows up

The tour waits up to two seconds. If the element is still missing, it logs a warning with `platform.warn` and skips to the next step. The user never gets stuck. But a skipped step is a bug in your tour, so watch the console when testing.

## Step 7: Start the tour on first visit

The navbar help button always works. Most tools should also start the tour on their own the first time a user opens them. Add a small file for this:

```tsx
// src/app/platform/my-tool/_components/tour-manager.tsx
"use client";

import { useEffect } from "react";
import { useTour } from "@/components/guided-tour";

// Bump the version when the tour changes so returning users see it again.
const STORAGE_KEY = "MY_TOOL_TOUR_SEEN_V1";

export function TourManager() {
  const { startTour } = useTour();

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      // Storage can be blocked. Treat as not seen.
    }
    if (seen) return;

    // Wait a moment so every TourStep on the page has registered.
    const timer = setTimeout(() => {
      startTour();
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // Ignore. The tour still runs this time.
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [startTour]);

  return null;
}
```

Mount `<TourManager />` once in the tool's `layout.tsx`, or in `page.tsx` if there is no layout.

Do not use the provider's `autoStart` prop. The provider is global. Turning it on would start a tour on every page in the portal.

Do not start the tour if the page shows a modal on load (like the What's New dialog or the Orientation dialog). Two things fighting for attention is worse than one. If a tool has an orientation dialog, delay the tour until it is closed, or only start the tour on desktop widths.

## Step 8: Accessibility checklist

The component handles most of this. You still need to check your part.

Built in (do not redo these):

- The card is a `role="dialog"` with a real label and description.
- Focus moves into the card on every step and goes back where it was when the tour ends.
- Tab stays inside the card. Right arrow goes forward, left arrow goes back, Escape exits.
- Screen readers hear "Step 3 of 12" before the title.
- The progress bar is a real `progressbar`.
- The dim overlay is hidden from screen readers.
- The close button has a label.

Your part:

- **Every target must have an accessible name.** If you highlight an icon-only button, it needs `aria-label`. If you highlight an input, it needs a `<label>` or `aria-label`. The tour points at it, but the screen reader still needs to know what it is.
- **Write content that works without sight.** Do not say "the blue button on the left". Say "the Add button".
- **Do not put the only explanation inside the tour.** Screen reader users may skip tours. Inputs still need labels and hints on their own.
- **Targets must be reachable by keyboard.** If the tour highlights something a keyboard user cannot reach, fix the element, not the tour.
- **Do not make the tour the only way to open a panel.** `triggerSelector` and `onOpen` are helpers for the tour, not a replacement for a visible, labelled button.
- **Test with a screen reader.** On Mac, turn on VoiceOver (Cmd + F5), start the tour, and press Next through every step. Each step should read the step count, the title, then the content. Nothing else should be announced in between.
- **Test with keyboard only.** Unplug the mouse in your head. Start the tour from the navbar help button with Enter. Move with arrow keys. Exit with Escape. Focus should end up back on the help button.

## Step 9: Test the whole tour

Before you finish:

1. Load the page fresh (clear the tool's `STORAGE_KEY` from localStorage, or use a private window).
2. The tour should start on its own after about one second.
3. Press Next through every step. Each step should highlight the right thing and the card should not cover what it points at.
4. Press Back on a few steps. Panels that were open should stay open.
5. Watch the browser console. There should be no `[guided-tour]` warnings. A warning means a step was skipped or an id was duplicated.
6. Press Escape in the middle. The page should scroll again and focus should return to where it was.
7. Reload. The tour should not start again. Press the help button in the navbar. The tour should start.
8. Resize to a phone width and run it again. Cards should sit above or below the target and never go off screen.

## Quick checklist

Copy this into your notes and tick each line:

```
[ ] User flow written as a numbered list
[ ] One TourStep for every major input, button, result area, and panel
[ ] Steps ordered by the user flow, not by screen position
[ ] TourStep sits directly on each element, inside the component that renders it
[ ] ids prefixed with the tool name, unique across the portal
[ ] order uses gaps of 10
[ ] Titles are two to five words, plain, no em dashes
[ ] Content is one to two sentences, says what to do, no "click here"
[ ] Step text follows .agents/context/writing.md, /humanizer pass done, no em dashes
[ ] Hidden targets use onOpen, triggerSelector, or selector
[ ] Containers stay open for every step inside them
[ ] TourManager added with a versioned STORAGE_KEY
[ ] Every target has an accessible name
[ ] Tested with keyboard only
[ ] Tested with VoiceOver
[ ] No [guided-tour] warnings in the console
[ ] Tested at phone width
```

## Common mistakes

- **Ordering by layout.** The filters are at the top, so they get step 1, even though the user searches first. Fix: follow the flow, not the grid.
- **One giant step.** Wrapping a whole form in one step. Fix: one step per field.
- **Missing the result.** The tour explains every input but never shows where the output appears. Fix: end with the result area and the save or submit button.
- **Forgetting the second step in a sheet.** The sheet opens for step 3 and closes on step 4, which is also inside the sheet. Fix: keep the container open for every inner step.
- **Class name selectors.** `selector=".sheet-content > div:nth-child(2)"`. Fix: add a `data-tour-target` attribute and use that.
- **Reusing an id from another tool.** Both `sem-planner` and `trajectory-planner` use `id="search"`. Fix: prefix with the tool name.
- **Content that describes the look.** "This is the blue box on the right." Fix: say what it does. "Your chosen courses show up here."
- **Starting the tour under a modal.** Fix: delay until the modal is closed, or skip auto-start on that page.
