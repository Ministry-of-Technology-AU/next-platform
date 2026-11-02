"use client";

import { ShortcutsDialog as SharedShortcutsDialog, type Shortcut } from "@/components/shortcuts-dialog";

/** Every shortcut on the page, in one place. Bare keys only fire when you're not typing. */
export const SHORTCUTS: ReadonlyArray<Shortcut> = [
  { keys: ["1"], action: "Terms" },
  { keys: ["2"], action: "Grade planner" },
  { keys: ["3"], action: "Goals" },
  { keys: ["["], action: "Previous term" },
  { keys: ["]"], action: "Next term" },
  { keys: ["U"], action: "Update from AMS" },
  { keys: ["?"], action: "Show this list" },
];

export function ShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return <SharedShortcutsDialog open={open} onOpenChange={onOpenChange} shortcuts={SHORTCUTS} />;
}
