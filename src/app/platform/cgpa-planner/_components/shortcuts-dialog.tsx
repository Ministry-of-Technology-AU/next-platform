"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/** Every shortcut on the page, in one place. Bare keys only fire when you're not typing. */
export const SHORTCUTS: ReadonlyArray<{ keys: string[]; action: string }> = [
  { keys: ["1"], action: "Terms" },
  { keys: ["2"], action: "Grade planner" },
  { keys: ["3"], action: "Goals" },
  { keys: ["["], action: "Previous term" },
  { keys: ["]"], action: "Next term" },
  { keys: ["U"], action: "Update from AMS" },
  { keys: ["?"], action: "Show this list" },
];

export function ShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>These work anywhere on the page except inside a text field.</DialogDescription>
        </DialogHeader>
        <dl className="divide-y divide-border">
          {SHORTCUTS.map((shortcut) => (
            <div key={shortcut.action} className="flex items-center justify-between py-2 text-sm">
              <dt>{shortcut.action}</dt>
              <dd className="flex gap-1">
                {shortcut.keys.map((key) => (
                  <kbd key={key} className="min-w-6 rounded border border-border bg-muted px-1.5 py-0.5 text-center font-mono text-xs">
                    {key}
                  </kbd>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
