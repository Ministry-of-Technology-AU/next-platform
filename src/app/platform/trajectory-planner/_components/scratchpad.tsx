"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Check, NotebookPen, Trash2, TriangleAlert } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { useAutoSave } from "@/hooks/use-auto-save"
import { haptic } from "@/lib/haptics"
import { htmlToPlainText, readStorage } from "@/lib/utils"
import { SCRATCHPAD_SAVE_DELAY_MS, STORAGE_KEYS } from "../data"

/**
 * A notepad in a side sheet, for jotting things down while planning. Notes live in this
 * browser's localStorage only: nothing is sent to the server.
 */

// Tiptap is heavy and most visits never open the scratchpad, so the editor loads with the sheet.
const MinimalTiptap = dynamic(() => import("@/components/ui/shadcn-io/minimal-tiptap").then((mod) => mod.MinimalTiptap), {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
})

/** Throws when storage is full or blocked, so the status can say the note wasn't kept. */
async function saveLocally(html: string): Promise<void> {
    if (htmlToPlainText(html).trim()) window.localStorage.setItem(STORAGE_KEYS.scratchpad, JSON.stringify(html))
    else window.localStorage.removeItem(STORAGE_KEYS.scratchpad)
}

export function ScratchpadSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [html, setHtml] = React.useState("")
    const [loaded, setLoaded] = React.useState(false)

    // Read on first open, not on page load: most visits never open the scratchpad.
    React.useEffect(() => {
        if (!open || loaded) return
        setHtml(readStorage<string>(STORAGE_KEYS.scratchpad) ?? "")
        setLoaded(true)
    }, [open, loaded])

    const { status } = useAutoSave(html, saveLocally, {
        enabled: loaded,
        delay: SCRATCHPAD_SAVE_DELAY_MS,
        warnOnUnload: false,
        onError: (err) => platform.warn("Scratchpad: saving to localStorage failed", err),
    })

    const clear = () => {
        const previous = html
        setHtml("")
        void haptic.press()
        toast("Scratchpad cleared", {
            action: { label: "Undo", onClick: () => setHtml(previous) },
        })
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
                <SheetHeader className="border-b border-border p-4 text-left">
                    <SheetTitle className="flex items-center gap-2 !text-left">
                        <NotebookPen className="size-5" aria-hidden />
                        Scratchpad
                    </SheetTitle>
                    <SheetDescription>Notes while you plan: courses to ask about, options to compare. They save as you type.</SheetDescription>
                </SheetHeader>

                <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
                    <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200">
                        <TriangleAlert className="size-4" aria-hidden />
                        <AlertDescription className="text-current">
                            This scratchpad lives only in this browser. It isn&apos;t saved to your account, won&apos;t show
                            on your other devices, and is gone if you clear site data or use a private window.
                        </AlertDescription>
                    </Alert>

                    {loaded && (
                        <MinimalTiptap
                            content={html}
                            onChange={setHtml}
                            placeholder="Jot something down…"
                            className="[&_.prose]:max-w-none [&_.prose]:text-sm [&_.ProseMirror_:is(h1,h2,h3)]:!text-left"
                        />
                    )}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-border p-4">
                    <p role="status" aria-live="polite" className="flex items-center gap-1 text-xs text-muted-foreground">
                        {status === "error" ? (
                            <span className="text-destructive">Couldn&apos;t save. This browser&apos;s storage may be full or blocked.</span>
                        ) : status === "saved" ? (
                            <>
                                <Check className="size-3.5 text-green-dark dark:text-green-light" aria-hidden />
                                Saved in this browser
                            </>
                        ) : status === "pending" || status === "saving" ? (
                            "Saving…"
                        ) : null}
                    </p>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clear}
                        disabled={!htmlToPlainText(html).trim()}
                        className="cursor-pointer gap-1.5 text-muted-foreground hover:text-destructive"
                    >
                        <Trash2 className="size-4" aria-hidden />
                        Clear
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
