"use client"

import { useId, useState } from "react"
import { Loader2, LogOut, PencilLine, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
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
import { TourStep } from "@/components/guided-tour"
import { haptic } from "@/lib/haptics"
import { LIMITS } from "../data"
import type { ParticipantSelf, PoolStatus } from "../types"
import { RichTextView } from "./rich-text-view"
import { useSantaAction } from "./use-santa-action"

interface MyWishlistProps {
    uid: string
    me: ParticipantSelf
    status: PoolStatus
    isHost: boolean
}

/**
 * The caller's own wish list. Shows what's saved, with Edit; the form only opens on demand,
 * so it never looks like the join form again. Leaving is only possible before the draw.
 */
export function MyWishlist({ uid, me, status, isHost }: MyWishlistProps) {
    const ids = useId()
    const { busy, run } = useSantaAction(uid)
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(me.name)
    const [wishlist, setWishlist] = useState(me.wishlist)
    const open = status === "open"
    const dirty = name.trim() !== me.name || wishlist !== me.wishlist

    const startEditing = () => {
        void haptic.tap()
        setName(me.name)
        setWishlist(me.wishlist)
        setEditing(true)
    }

    const save = async () => {
        void haptic.press()
        const body: { name?: string; wishlist: string } = { wishlist }
        if (open && name.trim() !== me.name) body.name = name
        const done = await run("save", "/me", "PATCH", body, { success: "Saved. Your Santa will see the latest." })
        if (done) setEditing(false)
    }

    return (
        <section aria-labelledby="santa-mine" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 id="santa-mine" className="font-heading !text-left !text-lg !font-semibold">
                        Your wish list
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">Only the person who draws you sees this.</p>
                </div>
                {!editing && me.wishlist.trim() && (
                    <Button type="button" variant="outline" size="sm" className="shrink-0 rounded-full" onClick={startEditing}>
                        <PencilLine aria-hidden="true" /> Edit
                    </Button>
                )}
            </div>

            <TourStep
                id="santa-wishlist"
                title="Your wish list"
                content="Add ideas, sizes or links. Only the person who draws your name sees it. You can edit it any time, even after the draw."
                order={2}
            >
                {editing ? (
                    <div className="mt-4 flex flex-col gap-4">
                        {open && (
                            <div className="flex flex-col gap-2">
                                <Label htmlFor={`${ids}-name`}>Your name</Label>
                                <Input id={`${ids}-name`} value={name} maxLength={LIMITS.nameMax} onChange={(e) => setName(e.target.value)} />
                            </div>
                        )}
                        <RichTextEditor value={wishlist} onChange={setWishlist} placeholder="Books, chocolate, anything green." />
                        <div className="flex flex-wrap gap-2">
                            <Button type="button" className="rounded-full" disabled={!dirty || busy === "save"} onClick={() => void save()}>
                                {busy === "save" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
                                Save
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    void haptic.tap()
                                    setEditing(false)
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : me.wishlist.trim() ? (
                    <RichTextView html={me.wishlist} empty="" className="mt-4 rounded-xl bg-muted/50 p-4" />
                ) : (
                    <div className="mt-4 flex flex-col items-start gap-3 rounded-xl border-2 border-dashed border-border p-4">
                        <p className="text-sm text-muted-foreground">
                            Nothing yet. A few ideas, sizes or links save your Santa from guessing.
                        </p>
                        <Button type="button" className="rounded-full" onClick={startEditing}>
                            <PencilLine aria-hidden="true" /> Add a wish list
                        </Button>
                    </div>
                )}
            </TourStep>

            {open && !editing && (
                <div className="mt-4 flex justify-end">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={() => void haptic.warn()}>
                                <LogOut aria-hidden="true" /> {isHost ? "Stop playing" : "Leave"}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{isHost ? "Stop playing?" : "Leave this Secret Santa?"}</DialogTitle>
                                <DialogDescription>
                                    {isHost
                                        ? "You stay the host but won't be in the draw. Your wish list is deleted."
                                        : "You're taken out of the draw and your wish list is deleted. You can join again with the link before names are drawn."}
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="ghost" onClick={() => void haptic.tap()}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    className="bg-destructive text-white hover:bg-destructive/90"
                                    disabled={busy === "leave"}
                                    onClick={() => {
                                        void haptic.warn()
                                        void run("leave", "/me", "DELETE", undefined, { success: "You've left." })
                                    }}
                                >
                                    {isHost ? "Stop playing" : "Leave"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </section>
    )
}
