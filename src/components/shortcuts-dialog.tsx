"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface Shortcut {
  keys: string[];
  action: string;
}

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortcuts: ReadonlyArray<Shortcut>;
  description?: string;
}

/** A tool's keyboard shortcuts, opened with `?`. Each tool passes its own list. */
export function ShortcutsDialog({
  open,
  onOpenChange,
  shortcuts,
  description = "These work anywhere on the page except inside a text field.",
}: ShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <dl className="divide-y divide-border">
          {shortcuts.map((shortcut) => (
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
