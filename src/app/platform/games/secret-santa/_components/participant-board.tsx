"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type { ParticipantPublic } from "../types"
import { POP_SPRING } from "./festive"
import { GiftTag, toneFor } from "./gift-tag"

interface ParticipantBoardProps {
    participants: ParticipantPublic[]
    minimum: number
}

/** Everyone in the pool as hanging tags. New people swing in; people who leave drop out. */
export function ParticipantBoard({ participants, minimum }: ParticipantBoardProps) {
    const reduce = useReducedMotion()
    const missing = Math.max(0, minimum - participants.length)

    return (
        <section aria-labelledby="santa-people" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-3">
                <h3 id="santa-people" className="font-heading !text-lg !font-semibold !text-left">
                    Who&apos;s in
                </h3>
                <span className="text-sm text-muted-foreground">
                    {participants.length} {participants.length === 1 ? "person" : "people"}
                </span>
            </div>
            <ul className="mt-4 flex flex-wrap gap-3">
                <AnimatePresence initial={false}>
                    {participants.map((person, index) => (
                        <motion.li
                            key={person.id}
                            layout={!reduce}
                            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -18, rotate: -8, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96, transition: { duration: 0.18 } }}
                            transition={POP_SPRING}
                            style={{ transformOrigin: "0% 50%" }}
                        >
                            <GiftTag tone={toneFor(index)} className="flex h-10 items-center py-0 text-sm font-semibold">
                                {person.name}
                                {person.isMe && <span className="ml-1.5 font-normal opacity-80">(you)</span>}
                            </GiftTag>
                        </motion.li>
                    ))}
                </AnimatePresence>
                {Array.from({ length: missing }, (_, i) => (
                    <li
                        key={`empty-${i}`}
                        className="flex h-10 items-center rounded-xl border-2 border-dashed border-border px-4 text-sm text-muted-foreground"
                    >
                        Waiting for someone
                    </li>
                ))}
            </ul>
            {missing > 0 && (
                <p className="mt-3 text-sm text-muted-foreground">
                    {missing} more {missing === 1 ? "person" : "people"} needed before names can be drawn.
                </p>
            )}
        </section>
    )
}
