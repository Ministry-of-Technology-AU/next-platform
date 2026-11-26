"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "motion/react"
import { Crown, Plus, TreePine, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TourStep } from "@/components/guided-tour"
import { haptic } from "@/lib/haptics"
import { Chip } from "./_components/chip"
import { Countdown } from "./_components/countdown"
import { EASE_OUT, isTyping } from "./_components/festive"
import { GiftTag } from "./_components/gift-tag"
import { PoolHero } from "./_components/pool-hero"
import { SANTA_BASE_PATH, poolPath } from "./data"
import type { PoolSummary } from "./types"
import { formatEventDate, formatRupees } from "./utils"

const HOW_IT_WORKS = ["Share the link", "Everyone adds a wish list", "Draw names"] as const

interface LandingClientProps {
    pools: PoolSummary[]
    error: string | null
}

export function SecretSantaLandingClient({ pools, error }: LandingClientProps) {
    const router = useRouter()
    const reduce = useReducedMotion()
    const newPath = `${SANTA_BASE_PATH}/new`

    // N starts a new pool.
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() !== "n" || event.metaKey || event.ctrlKey || event.altKey) return
            if (isTyping(event.target)) return
            event.preventDefault()
            router.push(newPath)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [router, newPath])

    return (
        <div className="flex flex-col gap-8 pb-24 sm:pb-0">
            <PoolHero>
                <h2 className="font-heading !text-2xl !font-bold !leading-tight sm:!text-3xl !text-left">Run a Secret Santa for your group</h2>
                <p className="mt-2 max-w-md text-sm text-primary-foreground/85 sm:text-base">
                    Set a budget, share one link, and draw names when everyone&apos;s in. Each person only learns
                    who they&apos;re gifting.
                </p>
                <ol className="mt-5 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-x-5">
                    {HOW_IT_WORKS.map((step, index) => (
                        <li key={step} className="flex items-center gap-2">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-green text-xs font-bold text-white">
                                {index + 1}
                            </span>
                            {step}
                        </li>
                    ))}
                </ol>
                <TourStep
                    id="santa-start"
                    title="Start a Secret Santa"
                    content="Press Start a Secret Santa to set a budget and a date. You get a link to share with your group. Shortcut: N."
                    order={1}
                    className="mt-6 hidden w-fit sm:block"
                >
                    <Button asChild size="lg" className="rounded-full bg-green text-white hover:bg-green-dark">
                        <Link href={newPath} onClick={() => void haptic.press()}>
                            <Plus aria-hidden="true" /> Start a Secret Santa
                        </Link>
                    </Button>
                </TourStep>
            </PoolHero>

            <section aria-labelledby="my-pools" className="flex flex-col gap-4">
                <h2 id="my-pools" className="font-heading !text-xl !font-semibold !text-left">
                    Your Secret Santas
                </h2>

                {error ? (
                    <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
                        {error}{" "}
                        <button
                            type="button"
                            className="font-semibold underline"
                            onClick={() => {
                                void haptic.tap()
                                router.refresh()
                            }}
                        >
                            Try again
                        </button>
                    </div>
                ) : pools.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-green/40 px-6 py-12 text-center">
                        <TreePine className="size-10 text-green" strokeWidth={1.5} aria-hidden="true" />
                        <p className="font-semibold">No Secret Santas yet</p>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            Start one and share the link with your group. Anyone you invite can join with their
                            Ashoka account.
                        </p>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {pools.map((pool, index) => (
                            <motion.li
                                key={pool.uid}
                                initial={reduce ? { opacity: 0 } : { opacity: 0, y: -14, rotate: -5 }}
                                animate={{ opacity: 1, y: 0, rotate: 0 }}
                                transition={{ duration: 0.45, ease: EASE_OUT, delay: Math.min(index, 8) * 0.06 }}
                                style={{ transformOrigin: "0% 50%" }}
                                className="h-full"
                            >
                                <Link
                                    href={poolPath(pool.uid)}
                                    onClick={() => void haptic.press()}
                                    className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                >
                                    <GiftTag
                                        tone={pool.status === "drawn" ? "green" : "red"}
                                        className="flex h-full flex-col transition-transform duration-200 ease-out group-hover:-rotate-1 group-hover:translate-x-0.5"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="line-clamp-2 font-heading !text-lg !font-bold !leading-snug !text-left">
                                                {pool.title}
                                            </h3>
                                            <Chip>{pool.status === "drawn" ? "Drawn" : "Open"}</Chip>
                                        </div>
                                        <p className="mt-1 text-sm opacity-85">{formatEventDate(pool.eventDate)}</p>
                                        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
                                            <Chip>{formatRupees(pool.budget)}</Chip>
                                            <Chip>
                                                <Users className="size-3.5" aria-hidden="true" />
                                                {pool.participantCount}
                                            </Chip>
                                            {pool.isHost && (
                                                <Chip>
                                                    <Crown className="size-3.5" aria-hidden="true" /> Host
                                                </Chip>
                                            )}
                                            <Countdown eventDate={pool.eventDate} />
                                        </div>
                                    </GiftTag>
                                </Link>
                            </motion.li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Mobile: the primary action sits in thumb reach. */}
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur sm:hidden">
                <Button asChild size="lg" className="w-full rounded-full">
                    <Link href={newPath} onClick={() => void haptic.press()}>
                        <Plus aria-hidden="true" /> Start a Secret Santa
                    </Link>
                </Button>
            </div>
        </div>
    )
}
