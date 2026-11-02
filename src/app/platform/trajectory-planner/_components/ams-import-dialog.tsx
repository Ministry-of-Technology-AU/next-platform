"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { haptic } from "@/lib/haptics"
import { useCoursePlanner } from "../course-planner-context"

/** Pastes an AMS grade report in and turns it into semesters with grades. */
export function AmsImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { loadPreviousSemesters } = useCoursePlanner()
    const [text, setText] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const close = (next: boolean) => {
        onOpenChange(next)
        if (!next) {
            setText("")
            setError(null)
        }
    }

    const load = async () => {
        if (!text.trim()) {
            void haptic.error()
            setError("Paste your AMS grade report into the box first.")
            return
        }
        setLoading(true)
        const result = await loadPreviousSemesters(text)
        setLoading(false)
        if (!result.success) {
            void haptic.error()
            setError(result.message)
            return
        }
        void haptic.confirm()
        toast.success(result.message, { description: "Mark any Minor or Open credit courses with each course's menu." })
        close(false)
    }

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Import grades from AMS</DialogTitle>
                    <DialogDescription>
                        In AMS, open your grade report, select the whole page and copy it. Paste it below. This replaces the semesters on
                        your board with the ones in the report.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-1.5">
                    <Label htmlFor="ams-report">AMS grade report</Label>
                    <Textarea
                        id="ams-report"
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value)
                            setError(null)
                        }}
                        placeholder="Paste the copied page here"
                        aria-invalid={error !== null}
                        aria-describedby={error ? "ams-report-error" : undefined}
                        className="min-h-48 font-mono text-xs"
                    />
                    {error && (
                        <p id="ams-report-error" role="alert" className="text-sm text-destructive">
                            {error}
                        </p>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" className="h-11 cursor-pointer border-border sm:h-9" onClick={() => close(false)}>
                        Cancel
                    </Button>
                    <Button className="h-11 cursor-pointer gap-1.5 sm:h-9" onClick={() => void load()} disabled={loading} aria-busy={loading}>
                        {loading ? <Spinner className="size-4" /> : <Upload />}
                        {loading ? "Importing" : "Replace semesters"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
