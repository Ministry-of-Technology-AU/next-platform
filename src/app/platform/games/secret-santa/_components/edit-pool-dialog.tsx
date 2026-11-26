"use client"

import { useId, useState } from "react"
import { Loader2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { haptic } from "@/lib/haptics"
import { LIMITS } from "../data"
import { UpdatePoolSchema } from "../schema"
import type { PoolView } from "../types"
import { EventDateField } from "./event-date-field"
import { useSantaAction } from "./use-santa-action"

export function EditPoolDialog({ view }: { view: PoolView }) {
    const ids = useId()
    const { busy, run } = useSantaAction(view.uid)
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState(view.title)
    const [budget, setBudget] = useState(String(view.budget))
    const [eventDate, setEventDate] = useState(view.eventDate)
    const [hostNote, setHostNote] = useState(view.hostNote)
    const [error, setError] = useState<string | null>(null)

    const save = async () => {
        const parsed = UpdatePoolSchema.safeParse({
            title,
            budget,
            eventDate: eventDate || undefined,
            hostNote,
        })
        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? "Check the form and try again.")
            void haptic.error()
            return
        }
        setError(null)
        const done = await run("edit", "", "PATCH", parsed.data, { success: "Saved." })
        if (done) setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="ghost" className="justify-start" onClick={() => void haptic.tap()}>
                    <Pencil aria-hidden="true" /> Edit details
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90dvh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit details</DialogTitle>
                    <DialogDescription>
                        Changes show on the pool page straight away. Emails already sent keep the old details.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor={`${ids}-title`}>Name</Label>
                        <Input id={`${ids}-title`} value={title} maxLength={LIMITS.titleMax} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor={`${ids}-date`}>Exchange on</Label>
                        <EventDateField id={`${ids}-date`} value={eventDate} onChange={setEventDate} />
                    </div>
                    <div className="flex flex-col gap-2 sm:max-w-[12rem]">
                        <Label htmlFor={`${ids}-budget`}>Budget (₹)</Label>
                        <Input
                            id={`${ids}-budget`}
                            inputMode="numeric"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value.replace(/[^\d]/g, ""))}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Note for everyone</Label>
                        <RichTextEditor value={hostNote} onChange={setHostNote} placeholder="Theme, venue, rules." />
                    </div>
                    <p role="alert" className="min-h-5 text-sm text-destructive-text">
                        {error}
                    </p>
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        disabled={busy === "edit"}
                        onClick={() => {
                            void haptic.press()
                            void save()
                        }}
                    >
                        {busy === "edit" && <Loader2 className="animate-spin" aria-hidden="true" />}
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
