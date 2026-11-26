import { CalendarDays, Crown, Users, Wallet } from "lucide-react"
import type { PoolView } from "../types"
import { formatEventDate, formatRupees } from "../utils"
import { Chip } from "./chip"
import { Countdown } from "./countdown"
import { PoolHero } from "./pool-hero"
import { RichTextView } from "./rich-text-view"

const STATUS_COPY = {
    open: { label: "Open to join", line: "Share the link. Names are drawn when the host is ready." },
    drawing: { label: "Drawing now", line: "Names are being drawn. Reload in a moment." },
    drawn: { label: "Names drawn", line: "Everyone has their person. Check your email or unwrap it below." },
} as const

/** Pool banner: status, the facts everyone needs, and the host's note. The title is the page title. */
export function PoolHeader({ view }: { view: PoolView }) {
    const status = STATUS_COPY[view.status]

    return (
        <PoolHero>
            <Chip className={view.status === "drawn" ? "bg-white text-green-dark" : "bg-green text-white"}>
                {status.label}
            </Chip>
            <p className="mt-3 max-w-md text-base font-semibold sm:text-lg">{status.line}</p>
            <div className="mt-4 flex flex-wrap gap-2">
                <Chip>
                    <Wallet className="size-3.5" aria-hidden="true" /> {formatRupees(view.budget)} per gift
                </Chip>
                <Chip>
                    <CalendarDays className="size-3.5" aria-hidden="true" /> {formatEventDate(view.eventDate)}
                </Chip>
                <Countdown eventDate={view.eventDate} />
                <Chip>
                    <Users className="size-3.5" aria-hidden="true" /> {view.participantCount}{" "}
                    {view.participantCount === 1 ? "person" : "people"}
                </Chip>
                {view.viewerRole === "host" && (
                    <Chip>
                        <Crown className="size-3.5" aria-hidden="true" /> You&apos;re hosting
                    </Chip>
                )}
            </div>
            {view.hostNote.trim() && (
                <div className="mt-5 max-w-xl rounded-xl bg-black/20 p-4">
                    <p className="text-sm font-semibold">A note from {view.hostName}</p>
                    <RichTextView html={view.hostNote} empty="" className="mt-2 text-primary-foreground/90 [&_a]:text-green-extralight" />
                </div>
            )}
        </PoolHero>
    )
}
