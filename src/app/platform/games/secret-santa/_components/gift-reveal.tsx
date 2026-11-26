"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TourStep } from "@/components/guided-tour"
import { haptic } from "@/lib/haptics"
import { santaRequest } from "../api"
import type { Giftee } from "../types"
import { formatEventDate, formatRupees } from "../utils"
import { Chip } from "./chip"
import { Countdown } from "./countdown"
import { EASE_OUT, celebrate, isTyping } from "./festive"
import { RichTextView } from "./rich-text-view"

interface GiftRevealProps {
    uid: string
    giftee: Giftee
    revealed: boolean
    budget: number
    eventDate: string
}

/** The wrapped box. Lid, ribbon and bow are separate layers so the unwrap can pull them apart. */
function WrappedBox({ opening, reduce }: { opening: boolean; reduce: boolean }) {
    const lift = reduce ? { opacity: 0 } : { y: -150, x: 30, rotate: -24, opacity: 0 }
    return (
        <div className="relative mx-auto h-56 w-60 sm:h-64 sm:w-72" aria-hidden="true">
            {/* Box */}
            <motion.div
                className="absolute inset-x-3 bottom-0 top-16 overflow-hidden rounded-b-2xl rounded-t-md bg-primary shadow-xl"
                animate={opening ? (reduce ? { opacity: 0 } : { scale: 0.9, opacity: 0, y: 24 }) : { scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE_OUT, delay: opening ? 0.35 : 0 }}
            >
                <motion.div
                    className="absolute inset-y-0 left-1/2 w-8 -translate-x-1/2 bg-secondary"
                    style={{ originY: 0 }}
                    animate={{ scaleY: opening ? 0 : 1 }}
                    transition={{ duration: 0.35, ease: EASE_OUT }}
                />
                <div className="absolute inset-x-0 top-1/2 h-6 -translate-y-1/2 bg-green-dark/80" />
            </motion.div>
            {/* Lid + bow */}
            <motion.div
                className="absolute inset-x-0 top-10 h-12"
                animate={opening ? lift : { y: 0, x: 0, rotate: 0, opacity: 1 }}
                transition={opening ? { duration: 0.6, ease: EASE_OUT } : { duration: 0 }}
                style={{ transformOrigin: "20% 100%" }}
            >
                <div className="absolute inset-0 rounded-lg bg-primary-bright shadow-md" />
                <div className="absolute inset-y-0 left-1/2 w-8 -translate-x-1/2 bg-secondary" />
                <div className="absolute -top-8 left-1/2 flex -translate-x-1/2 gap-1">
                    <span className="block size-10 rotate-[-30deg] rounded-[60%_10%_60%_10%] border-4 border-secondary-dark bg-secondary" />
                    <span className="block size-10 rotate-[30deg] rounded-[10%_60%_10%_60%] border-4 border-secondary-dark bg-secondary" />
                </div>
            </motion.div>
        </div>
    )
}

function GifteeCard({ giftee, budget, eventDate }: { giftee: Giftee; budget: number; eventDate: string }) {
    return (
        <div className="overflow-hidden rounded-2xl border-2 border-green-dark/60 bg-card shadow-lg">
            <div className="bg-green-dark px-6 py-5 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-secondary">You&apos;re the Secret Santa for</p>
                <p className="mt-1 break-words font-heading text-3xl font-bold sm:text-4xl">{giftee.name}</p>
            </div>
            <div className="flex flex-col gap-4 p-6">
                <div>
                    <h4 className="mb-2 !text-sm !font-semibold text-muted-foreground !text-left">Their wish list</h4>
                    <RichTextView
                        html={giftee.wishlist}
                        empty={`${giftee.name} hasn't added a wish list yet. Check back here, it may change.`}
                    />
                </div>
                <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                    <Chip tone="muted">{formatRupees(budget)} budget</Chip>
                    <Chip tone="muted">{formatEventDate(eventDate)}</Chip>
                    <Countdown eventDate={eventDate} tone="muted" />
                </div>
                <p className="text-xs text-muted-foreground">Keep it a secret. Nobody else can see who you got.</p>
            </div>
        </div>
    )
}

/**
 * Unwrap on first visit after the draw (tap, Enter or Space); straight to the card after that,
 * with Play again. Reduced motion: a fade, no confetti.
 */
export function GiftReveal({ uid, giftee, revealed, budget, eventDate }: GiftRevealProps) {
    const reduce = useReducedMotion() ?? false
    const [phase, setPhase] = useState<"wrapped" | "opening" | "open">(revealed ? "open" : "wrapped")
    const recorded = useRef(revealed)

    const unwrap = useCallback(() => {
        if (phase !== "wrapped") return
        setPhase("opening")
        void haptic.confirm()
        window.setTimeout(() => {
            setPhase("open")
            celebrate()
        }, reduce ? 150 : 750)
        if (!recorded.current) {
            recorded.current = true
            void santaRequest(`/${uid}/me`, "PATCH", { revealed: true })
        }
    }, [phase, reduce, uid])

    // Space unwraps when the gift is waiting.
    useEffect(() => {
        if (phase !== "wrapped") return
        const onKey = (event: KeyboardEvent) => {
            if (event.code !== "Space" || isTyping(event.target)) return
            event.preventDefault()
            unwrap()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [phase, unwrap])

    return (
        <TourStep
            id="santa-reveal"
            title="Your giftee"
            content="After the draw, unwrap the gift to see who you're buying for and their wish list. Press Play again to watch it once more."
            order={3}
        >
            <section aria-labelledby="santa-reveal-heading" className="rounded-2xl border border-border bg-card p-5 sm:p-8">
                <h3 id="santa-reveal-heading" className="sr-only">
                    Your Secret Santa
                </h3>
                <AnimatePresence mode="wait" initial={false}>
                    {phase !== "open" ? (
                        <motion.div
                            key="wrapped"
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center gap-4 py-4"
                        >
                            <motion.button
                                type="button"
                                onClick={unwrap}
                                disabled={phase === "opening"}
                                aria-label="Unwrap your Secret Santa"
                                className="rounded-3xl p-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                initial={reduce ? false : { rotate: 0 }}
                                animate={reduce || phase === "opening" ? { rotate: 0 } : { rotate: [0, -4, 4, -2, 0] }}
                                transition={{ duration: 0.7, delay: 0.4, ease: "easeInOut" }}
                                whileHover={reduce ? undefined : { scale: 1.03 }}
                                whileTap={reduce ? undefined : { scale: 0.97 }}
                            >
                                <WrappedBox opening={phase === "opening"} reduce={reduce} />
                            </motion.button>
                            <p className="text-center text-sm text-muted-foreground">
                                Names are drawn. Tap the gift (or press Space) to see who you got.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 260, damping: 22 }}
                            className="flex flex-col gap-4"
                        >
                            <GifteeCard giftee={giftee} budget={budget} eventDate={eventDate} />
                            <Button
                                type="button"
                                variant="ghost"
                                className="self-center"
                                onClick={() => {
                                    void haptic.tap()
                                    setPhase("wrapped")
                                }}
                            >
                                <RotateCcw aria-hidden="true" /> Play again
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </TourStep>
    )
}
