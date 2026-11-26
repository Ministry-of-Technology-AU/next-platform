"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import { Check, Gift, PencilLine, Shuffle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ParticipantSelf } from "../types"
import { Countdown } from "./countdown"
import { EASE_OUT } from "./festive"

interface WaitingCardProps {
    me: ParticipantSelf
    hostName: string
    isHost: boolean
    eventDate: string
}

type StepState = "done" | "now" | "next"

/** Three dots that bounce in turn: "we're waiting on this". Still under reduced motion. */
function WaitingDots({ still }: { still: boolean }) {
    return (
        <span className="ml-1 inline-flex gap-0.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="block size-1.5 rounded-full bg-current"
                    animate={still ? undefined : { y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                />
            ))}
        </span>
    )
}

function Step({
    state,
    icon: Icon,
    title,
    detail,
    still,
    index,
}: {
    state: StepState
    icon: React.ComponentType<{ className?: string }>
    title: string
    detail: string
    still: boolean
    index: number
}) {
    return (
        <motion.li
            className="flex items-start gap-3"
            initial={still ? { opacity: 0 } : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT, delay: 0.25 + index * 0.08 }}
        >
            <span
                className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                    state === "done" && "bg-green text-white",
                    state === "now" && "bg-primary text-primary-foreground",
                    state === "next" && "border-2 border-dashed border-border text-muted-foreground",
                )}
            >
                {state === "done" ? <Check className="size-4" aria-hidden="true" /> : <Icon className="size-3.5" />}
            </span>
            <span className="min-w-0">
                <span className={cn("flex items-center text-sm font-semibold", state === "next" && "text-muted-foreground")}>
                    {title}
                    {state === "now" && <WaitingDots still={still} />}
                </span>
                <span className="block text-xs text-muted-foreground">{detail}</span>
            </span>
        </motion.li>
    )
}

/**
 * What a participant sees once they're in and names aren't drawn yet: a clear "you're in",
 * where things stand, and what happens next. Replaces the join form so joining feels done.
 */
export function WaitingCard({ me, hostName, isHost, eventDate }: WaitingCardProps) {
    const still = useReducedMotion() ?? false
    const firstName = me.name.split(" ")[0] ?? me.name
    const hasWishlist = me.wishlist.trim().length > 0

    return (
        <motion.section
            aria-labelledby="santa-waiting"
            className="overflow-hidden rounded-2xl border-2 border-green/50 bg-card shadow-sm"
            initial={still ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={still ? { duration: 0.2 } : { type: "spring", stiffness: 260, damping: 24 }}
        >
            <div className="flex items-center justify-between gap-3 bg-green px-5 py-2.5 text-white sm:px-6">
                <span className="text-xs font-bold uppercase tracking-widest">You&apos;re in the draw</span>
                <Countdown eventDate={eventDate} />
            </div>

            <div className="grid grid-cols-1 items-center gap-6 p-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:p-6">
                <motion.div
                    className="mx-auto flex size-36 items-center justify-center overflow-hidden rounded-full bg-white ring-4 ring-green/60 sm:size-40"
                    animate={still ? undefined : { y: [0, -6, 0], rotate: [0, -2, 0, 2, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Image
                        src="/secret-santa/email-cat.png"
                        alt=""
                        width={150}
                        height={190}
                        className="h-[88%] w-auto translate-y-2 object-contain"
                        priority
                    />
                </motion.div>

                <div className="min-w-0">
                    <h3 id="santa-waiting" className="font-heading !text-left !text-2xl !font-bold">
                        You&apos;re in, {firstName}!
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {isHost
                            ? "Share the link, wait for everyone to join, then draw names. You'll get your own giftee like everyone else."
                            : `Now we wait. When ${hostName} draws names, you'll get an email, and your giftee will be waiting here to unwrap.`}
                    </p>

                    <ol className="mt-5 flex flex-col gap-3" aria-label="Where things stand">
                        <Step index={0} still={still} state="done" icon={Check} title="Joined" detail="Your name is in the pool." />
                        <Step
                            index={1}
                            still={still}
                            state={hasWishlist ? "done" : "now"}
                            icon={PencilLine}
                            title={hasWishlist ? "Wish list added" : "Add a wish list"}
                            detail={hasWishlist ? "You can change it any time, even after the draw." : "Optional, but it saves your Santa some guessing."}
                        />
                        <Step
                            index={2}
                            still={still}
                            state={hasWishlist ? "now" : "next"}
                            icon={Shuffle}
                            title={isHost ? "Draw names" : "Waiting for the draw"}
                            detail={isHost ? "Press Draw names when everyone's in." : `${hostName} draws names when everyone's in.`}
                        />
                        <Step
                            index={3}
                            still={still}
                            state="next"
                            icon={Gift}
                            title="Unwrap your giftee"
                            detail="Right here, and in your inbox."
                        />
                    </ol>
                </div>
            </div>
        </motion.section>
    )
}
