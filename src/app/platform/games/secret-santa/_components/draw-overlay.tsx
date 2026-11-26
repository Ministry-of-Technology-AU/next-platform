"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { haptic } from "@/lib/haptics"
import { EASE_OUT, burst } from "./festive"
import { Snowfall } from "./snowfall"

export type DrawPhase = "idle" | "mixing" | "done"

/**
 * gather: names deal out face up · flip: they turn face down · shuffle: they trade places
 * until the server answers · seal: they fly into the envelope and the wax seal stamps.
 */
type Stage = "gather" | "flip" | "shuffle" | "seal" | "finished"

interface DrawOverlayProps {
    phase: DrawPhase
    names: string[]
    count: number
    onClose: () => void
}

const MAX_CARDS = 10
const WHISPERS = ["Shuffling the names", "No peeking", "Whispering to the elves", "Mixing it up once more", "Almost there"]

/** Tartan card back, drawn with gradients over the red token. */
const CARD_BACK: React.CSSProperties = {
    backgroundImage:
        "repeating-linear-gradient(0deg, transparent 0 9px, rgb(0 0 0 / 0.22) 9px 15px), repeating-linear-gradient(90deg, transparent 0 9px, rgb(0 0 0 / 0.22) 9px 15px), repeating-linear-gradient(90deg, transparent 0 21px, rgb(255 255 255 / 0.35) 21px 22px)",
}

function shuffle(order: number[]): number[] {
    const next = [...order]
    for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const a = next[i]
        const b = next[j]
        if (a === undefined || b === undefined) continue
        next[i] = b
        next[j] = a
    }
    return next
}

function useRingRadius(): number {
    const [radius, setRadius] = useState(200)
    useEffect(() => {
        const update = () => setRadius(Math.min(240, window.innerWidth * 0.36))
        update()
        window.addEventListener("resize", update)
        return () => window.removeEventListener("resize", update)
    }, [])
    return radius
}

/** Envelope with a flap that closes and a wax seal that stamps on. */
function Envelope({ sealed, reduce }: { sealed: boolean; reduce: boolean }) {
    return (
        <div className="relative h-28 w-40 sm:h-32 sm:w-48" style={{ perspective: 600 }} aria-hidden="true">
            <div className="absolute inset-0 rounded-xl bg-secondary-extralight shadow-2xl" />
            {/* Front pocket fold. */}
            <div className="absolute inset-0 rounded-xl bg-white/70" style={{ clipPath: "polygon(0 100%, 50% 45%, 100% 100%)" }} />
            <motion.div
                className="absolute inset-x-0 top-0 h-[62%] bg-green-dark"
                style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", transformOrigin: "50% 0%", backfaceVisibility: "hidden" }}
                initial={false}
                animate={{ rotateX: sealed ? 0 : 180 }}
                transition={reduce ? { duration: 0 } : { duration: 0.45, ease: EASE_OUT }}
            />
            <AnimatePresence>
                {sealed && (
                    <motion.div
                        className="absolute left-1/2 top-[52%] flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary-bright shadow-lg ring-4 ring-primary-dark/60 sm:size-14"
                        initial={reduce ? { opacity: 0 } : { scale: 1.8, opacity: 0, rotate: -25 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 520, damping: 18, delay: 0.35 }}
                    >
                        <Gift className="size-6 text-primary-foreground sm:size-7" strokeWidth={2} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/**
 * The draw moment. Deliberately a little mysterious: names are dealt, turned face down,
 * shuffled while the server draws, then sealed. No pair is ever shown here.
 */
export function DrawOverlay({ phase, names, count, onClose }: DrawOverlayProps) {
    const reduce = useReducedMotion() ?? false
    const radius = useRingRadius()
    const closeRef = useRef<HTMLButtonElement>(null)
    const cards = useMemo(() => names.slice(0, MAX_CARDS), [names])
    const [stage, setStage] = useState<Stage>("gather")
    const [slots, setSlots] = useState<number[]>(() => cards.map((_, i) => i))
    const [whisper, setWhisper] = useState(0)

    // Stage clock for the mixing part.
    useEffect(() => {
        if (phase !== "mixing") return
        setStage("gather")
        setSlots(cards.map((_, i) => i))
        setWhisper(0)
        const flip = window.setTimeout(() => setStage("flip"), 900)
        const mix = window.setTimeout(() => setStage("shuffle"), 1600)
        return () => {
            window.clearTimeout(flip)
            window.clearTimeout(mix)
        }
    }, [phase, cards])

    // Cards trade places and the whisper line changes while we wait for the server.
    useEffect(() => {
        if (stage !== "shuffle") return
        const swap = window.setInterval(() => {
            setSlots((order) => shuffle(order))
            void haptic.select()
        }, reduce ? 1200 : 620)
        const talk = window.setInterval(() => setWhisper((w) => (w + 1) % WHISPERS.length), 1300)
        return () => {
            window.clearInterval(swap)
            window.clearInterval(talk)
        }
    }, [stage, reduce])

    // The server answered: seal, then celebrate.
    useEffect(() => {
        if (phase !== "done") return
        setStage("seal")
        const finish = window.setTimeout(() => {
            setStage("finished")
            void haptic.confirm()
            burst({ x: 0.5, y: 0.42 }, 140)
        }, reduce ? 300 : 1300)
        return () => window.clearTimeout(finish)
    }, [phase, reduce])

    useEffect(() => {
        if (stage === "finished") closeRef.current?.focus()
    }, [stage])

    if (typeof document === "undefined") return null

    const faceDown = stage !== "gather"
    const gathered = stage === "seal" || stage === "finished"

    return createPortal(
        <AnimatePresence>
            {phase !== "idle" && (
                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="santa-draw-title"
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-green-extradark text-primary-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Candlelit spotlight and vignette. */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background:
                                "radial-gradient(ellipse at 50% 42%, rgb(255 255 255 / 0.10) 0%, transparent 45%), radial-gradient(ellipse at center, transparent 40%, rgb(0 0 0 / 0.65) 100%)",
                        }}
                    />
                    <Snowfall count={30} />

                    {/* The ring of name cards. */}
                    {!reduce && (
                        <div className="pointer-events-none absolute left-1/2 top-[38%]" aria-hidden="true">
                            {cards.map((name, i) => {
                                const slot = slots[i] ?? i
                                const angle = (slot / Math.max(cards.length, 1)) * Math.PI * 2 - Math.PI / 2
                                const x = gathered ? 0 : Math.cos(angle) * radius
                                const y = gathered ? 90 : Math.sin(angle) * radius * 0.62
                                return (
                                    <motion.div
                                        key={`${name}-${i}`}
                                        className="absolute"
                                        style={{ perspective: 700 }}
                                        initial={{ x: 0, y: 40, opacity: 0, scale: 0.6 }}
                                        animate={{
                                            x,
                                            y,
                                            opacity: gathered ? 0 : 1,
                                            scale: gathered ? 0.25 : 1,
                                            rotate: gathered ? 0 : slot % 2 === 0 ? -6 : 6,
                                        }}
                                        transition={
                                            gathered
                                                ? { duration: 0.55, ease: [0.55, 0, 0.75, 0.2], delay: i * 0.04 }
                                                : { type: "spring", stiffness: 140, damping: 18, delay: stage === "gather" ? i * 0.07 : 0 }
                                        }
                                    >
                                        <motion.div
                                            className="relative -translate-x-1/2 -translate-y-1/2"
                                            style={{ transformStyle: "preserve-3d" }}
                                            animate={{ rotateY: faceDown ? 180 : 0 }}
                                            transition={{ duration: 0.5, ease: EASE_OUT, delay: stage === "flip" ? i * 0.05 : 0 }}
                                        >
                                            <div
                                                className="flex h-16 w-28 items-center justify-center rounded-xl bg-secondary-extralight px-2 text-center text-sm font-semibold text-green-extradark shadow-xl sm:h-20 sm:w-32"
                                                style={{ backfaceVisibility: "hidden" }}
                                            >
                                                <span className="line-clamp-2">{name}</span>
                                            </div>
                                            <div
                                                className="absolute inset-0 flex items-center justify-center rounded-xl bg-primary-bright shadow-xl ring-2 ring-white/20"
                                                style={{ ...CARD_BACK, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                                            >
                                                <span className="font-heading text-3xl font-bold text-white/90 drop-shadow">?</span>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}

                    <div className="relative mt-[24vh] flex flex-col items-center gap-5 px-6 text-center">
                        <AnimatePresence mode="wait">
                            {gathered ? (
                                <motion.div
                                    key="envelope"
                                    initial={{ opacity: 0, scale: 0.85, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ duration: 0.4, ease: EASE_OUT, delay: reduce ? 0 : 0.35 }}
                                >
                                    <Envelope sealed reduce={reduce} />
                                </motion.div>
                            ) : (
                                <motion.span
                                    key="question"
                                    className="font-heading text-6xl font-bold text-green-light/80"
                                    initial={{ opacity: 0 }}
                                    animate={reduce ? { opacity: 1 } : { opacity: [0.35, 0.9, 0.35] }}
                                    exit={{ opacity: 0 }}
                                    transition={reduce ? { duration: 0.2 } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                                    aria-hidden="true"
                                >
                                    ?
                                </motion.span>
                            )}
                        </AnimatePresence>

                        {stage !== "finished" ? (
                            <div>
                                <h2 id="santa-draw-title" className="font-heading !text-center !text-2xl !font-bold sm:!text-3xl">
                                    {stage === "seal" ? "Sealing the envelopes" : "Drawing names"}
                                </h2>
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={stage === "seal" ? "seal" : whisper}
                                        className="mt-2 text-primary-foreground/70"
                                        initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                        exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                                        transition={{ duration: 0.35 }}
                                        aria-hidden="true"
                                    >
                                        {stage === "seal" ? "Each one only opens for its Santa" : `${WHISPERS[whisper] ?? ""}…`}
                                    </motion.p>
                                </AnimatePresence>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: EASE_OUT }}
                                className="flex flex-col items-center gap-4"
                            >
                                <h2 id="santa-draw-title" className="font-heading !text-center !text-2xl !font-bold sm:!text-3xl">
                                    Names drawn and sealed
                                </h2>
                                <p className="max-w-sm text-primary-foreground/80" aria-live="polite">
                                    Emails are on their way to {count} {count === 1 ? "person" : "people"}. Each one only knows
                                    their own giftee. Not even you can peek.
                                </p>
                                <Button
                                    ref={closeRef}
                                    size="lg"
                                    className="rounded-full bg-green text-white hover:bg-green-dark"
                                    onClick={onClose}
                                >
                                    Back to the pool
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    )
}
