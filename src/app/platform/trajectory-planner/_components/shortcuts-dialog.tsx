"use client"

import { ShortcutsDialog as SharedShortcutsDialog, type Shortcut } from "@/components/shortcuts-dialog"

/** Every shortcut on the page, in one place. Bare keys only fire when you're not typing. */
export const SHORTCUTS: ReadonlyArray<Shortcut> = [
    { keys: ["N"], action: "New course" },
    { keys: ["A"], action: "Add semester" },
    { keys: ["S"], action: "Save to your account" },
    { keys: ["I"], action: "Ideal trajectory" },
    { keys: ["B"], action: "Show or hide the credit breakdown" },
    { keys: ["?"], action: "Show this list" },
]

export function ShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    return <SharedShortcutsDialog open={open} onOpenChange={onOpenChange} shortcuts={SHORTCUTS} />
}
