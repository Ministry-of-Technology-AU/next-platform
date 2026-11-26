"use client"

import { useId, useState } from "react"
import { Gift, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { TourStep } from "@/components/guided-tour"
import { haptic } from "@/lib/haptics"
import { LIMITS } from "../data"
import { burst } from "./festive"
import { useSantaAction } from "./use-santa-action"

interface JoinCardProps {
    uid: string
    defaultName: string
}

/** For someone with the link who isn't in yet. */
export function JoinCard({ uid, defaultName }: JoinCardProps) {
    const ids = useId()
    const { busy, run } = useSantaAction(uid)
    const [name, setName] = useState(defaultName)
    const [wishlist, setWishlist] = useState("")
    const [error, setError] = useState<string | null>(null)

    const join = async () => {
        if (name.trim().length < LIMITS.nameMin) {
            setError("Add your name so your Santa knows who you are.")
            void haptic.error()
            return
        }
        setError(null)
        const result = await run<{ id: number }>("join", "/join", "POST", { name, wishlist }, { success: "You're in." })
        if (result) burst({ x: 0.5, y: 0.4 })
    }

    return (
        <section aria-labelledby="santa-join" className="rounded-2xl border-2 border-green/50 bg-card p-5 shadow-sm sm:p-7">
            <h3 id="santa-join" className="font-heading !text-xl !font-semibold !text-left">
                Join this Secret Santa
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Your name goes in the draw. The wish list is optional, and only the person who draws you will see it.
            </p>
            <div className="mt-5 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <Label htmlFor={`${ids}-name`}>Your name</Label>
                    <Input
                        id={`${ids}-name`}
                        value={name}
                        maxLength={LIMITS.nameMax}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <TourStep
                    id="santa-wishlist"
                    title="Your wish list"
                    content="Add ideas, sizes or links. Only the person who draws your name sees it. You can edit it any time, even after the draw."
                    order={2}
                >
                    <div className="flex flex-col gap-2">
                        <Label>Wish list (optional)</Label>
                        <RichTextEditor
                            value={wishlist}
                            onChange={setWishlist}
                            placeholder="Books, chocolate, anything green. No candles, please."
                        />
                    </div>
                </TourStep>
                <p role="alert" className="min-h-5 text-sm text-destructive-text">
                    {error}
                </p>
                <Button
                    type="button"
                    size="lg"
                    className="button-animated w-full rounded-full sm:w-fit"
                    disabled={busy === "join"}
                    onClick={() => {
                        void haptic.press()
                        void join()
                    }}
                >
                    {busy === "join" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Gift aria-hidden="true" />}
                    Join Secret Santa
                </Button>
            </div>
        </section>
    )
}
