"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useReducedMotion } from "motion/react"
import { Lock, Settings2, Shuffle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { haptic } from "@/lib/haptics"
import { santaRequest } from "../api"
import { LIMITS } from "../data"
import type { DrawResult, PoolView } from "../types"
import { DrawOverlay, type DrawPhase } from "./draw-overlay"
import { isTyping } from "./festive"
import { GiftReveal } from "./gift-reveal"
import { HostPanel, copyPoolLink } from "./host-panel"
import { JoinCard } from "./join-card"
import { MyWishlist } from "./my-wishlist"
import { ParticipantBoard } from "./participant-board"
import { PoolHeader } from "./pool-header"
import { WaitingCard } from "./waiting-card"

interface PoolClientProps {
    view: PoolView
    defaultName: string
}

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

/** Pool page orchestrator: picks the state from PRD §4 and owns the draw moment. */
export function PoolClient({ view, defaultName }: PoolClientProps) {
    const router = useRouter()
    const isMobile = useIsMobile()
    const reduce = useReducedMotion()
    const isHost = view.viewerRole === "host"
    const isOpen = view.status === "open"
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [phase, setPhase] = useState<DrawPhase>("idle")
    const [drawnCount, setDrawnCount] = useState(view.participantCount)
    const canDraw = isHost && isOpen && view.participantCount >= LIMITS.minParticipants

    const requestDraw = useCallback(() => {
        setDrawerOpen(false)
        setConfirmOpen(true)
    }, [])

    const draw = async () => {
        setConfirmOpen(false)
        setPhase("mixing")
        void haptic.press()
        const started = Date.now()
        const response = await santaRequest<DrawResult>(`/${view.uid}/draw`, "POST")
        // Let the mix play out, even when the server is quick.
        await sleep(Math.max(0, (reduce ? 500 : 3800) - (Date.now() - started)))
        if (!response.success) {
            setPhase("idle")
            void haptic.error()
            toast.error(response.error)
            router.refresh()
            return
        }
        setDrawnCount(response.data.participantCount)
        // The overlay seals the envelope, then celebrates.
        setPhase("done")
    }

    // Host shortcuts: C copies the link, D opens the draw confirmation.
    useEffect(() => {
        if (!isHost || !isOpen) return
        const onKey = (event: KeyboardEvent) => {
            if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return
            const key = event.key.toLowerCase()
            if (key === "c") {
                event.preventDefault()
                void copyPoolLink(view.uid)
            } else if (key === "d" && canDraw) {
                event.preventDefault()
                requestDraw()
            }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [isHost, isOpen, canDraw, view.uid, requestDraw])

    const main = (
        <div className="flex min-w-0 flex-col gap-6">
            {view.viewerRole === "outsider" && isOpen && <JoinCard uid={view.uid} defaultName={defaultName} />}
            {view.viewerRole === "outsider" && !isOpen && (
                <section className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-10 text-center">
                    <Lock className="size-8 text-muted-foreground" aria-hidden="true" />
                    <h3 className="font-heading !text-lg !font-semibold !text-left">This draw is closed</h3>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Names were already drawn, so nobody new can join. Ask {view.hostName} if you think you should be in.
                    </p>
                </section>
            )}
            {view.status === "drawing" && (
                <section className="rounded-2xl border border-border bg-card p-6 text-center text-sm" aria-live="polite">
                    Names are being drawn right now. Reload in a moment.
                </section>
            )}
            {view.status === "drawn" && view.me && view.giftee && (
                <GiftReveal
                    uid={view.uid}
                    giftee={view.giftee}
                    revealed={view.me.revealed}
                    budget={view.budget}
                    eventDate={view.eventDate}
                />
            )}
            {view.me && isOpen && (
                <WaitingCard me={view.me} hostName={view.hostName} isHost={isHost} eventDate={view.eventDate} />
            )}
            {view.me && <MyWishlist uid={view.uid} me={view.me} status={view.status} isHost={isHost} />}
            {view.viewerRole !== "outsider" && (
                <ParticipantBoard participants={view.participants} minimum={isOpen ? LIMITS.minParticipants : 0} />
            )}
        </div>
    )

    return (
        <div className="flex flex-col gap-6 pb-24 lg:pb-0">
            <PoolHeader view={view} />

            {isHost && !isMobile ? (
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                    {main}
                    <aside className="lg:sticky lg:top-6" aria-label="Host controls">
                        <HostPanel view={view} onRequestDraw={requestDraw} />
                    </aside>
                </div>
            ) : (
                main
            )}

            {isHost && isMobile && (
                <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                    <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-border bg-background/95 p-3 backdrop-blur">
                        <DrawerTrigger asChild>
                            <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={() => void haptic.tap()}>
                                <Settings2 aria-hidden="true" /> Host controls
                            </Button>
                        </DrawerTrigger>
                        {isOpen && (
                            <Button
                                type="button"
                                className="flex-1 rounded-full"
                                disabled={!canDraw}
                                onClick={() => {
                                    void haptic.press()
                                    requestDraw()
                                }}
                            >
                                <Shuffle aria-hidden="true" /> Draw names
                            </Button>
                        )}
                    </div>
                    <DrawerContent className="max-h-[88dvh]">
                        <DrawerHeader>
                            <DrawerTitle>Host controls</DrawerTitle>
                            <DrawerDescription>Share, add people, keep pairs apart, and draw.</DrawerDescription>
                        </DrawerHeader>
                        <div className="overflow-y-auto px-4 pb-6">
                            <HostPanel view={view} onRequestDraw={requestDraw} />
                        </div>
                    </DrawerContent>
                </Drawer>
            )}

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Draw names for {view.participantCount} people?</DialogTitle>
                        <DialogDescription>
                            Everyone gets an email with their giftee and wish list. The pool locks: nobody can join, leave or be
                            removed, and the draw can&apos;t be redone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="ghost" onClick={() => void haptic.tap()}>
                                Not yet
                            </Button>
                        </DialogClose>
                        <Button className="button-animated" onClick={() => void draw()}>
                            <Shuffle aria-hidden="true" /> Draw names
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DrawOverlay
                phase={phase}
                names={view.participants.map((p) => p.name)}
                count={drawnCount}
                onClose={() => {
                    void haptic.tap()
                    setPhase("idle")
                    router.refresh()
                }}
            />
        </div>
    )
}
