"use client"

import { useEffect, useId, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Ban, Check, Copy, Loader2, MailWarning, Send, Share2, Shuffle, Trash2, UserMinus, UserPlus, X } from "lucide-react"
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
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { TourStep } from "@/components/guided-tour"
import { haptic } from "@/lib/haptics"
import { cn } from "@/lib/utils"
import { LIMITS, SANTA_BASE_PATH, poolPath } from "../data"
import { splitEmails } from "../schema"
import type { AddParticipantsResult, ExclusionPair, PoolView, ResendResult } from "../types"
import { pairKey } from "../utils"
import { EditPoolDialog } from "./edit-pool-dialog"
import { useSantaAction } from "./use-santa-action"

interface HostPanelProps {
    view: PoolView
    onRequestDraw: () => void
}

const block = "flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
const heading = "font-heading !text-left !text-base !font-semibold"

/** Copies the share link. Exported so the page-level `C` shortcut uses the same code. */
export async function copyPoolLink(uid: string): Promise<void> {
    const url = `${window.location.origin}${poolPath(uid)}`
    try {
        await navigator.clipboard.writeText(url)
        void haptic.confirm()
        toast.success("Link copied. Send it to your group.")
    } catch {
        void haptic.error()
        toast.error("Couldn't copy. Select the link and copy it yourself.")
    }
}

function ShareBlock({ uid, title }: { uid: string; title: string }) {
    const [url, setUrl] = useState("")
    const [canShare, setCanShare] = useState(false)
    useEffect(() => {
        setUrl(`${window.location.origin}${poolPath(uid)}`)
        setCanShare(typeof navigator.share === "function")
    }, [uid])

    return (
        <TourStep
            id="santa-share"
            title="Share the link"
            content="Anyone with an Ashoka account can join through this link until you draw names. Shortcut: C copies it."
            order={1}
        >
            <section className={block} aria-label="Share link">
                <h3 className={heading}>Share the link</h3>
                <div className="flex gap-2">
                    <Input readOnly value={url} aria-label="Share link" className="h-10" onFocus={(e) => e.currentTarget.select()} />
                    <Button type="button" variant="outline" size="icon" className="size-10 shrink-0" aria-label="Copy link" onClick={() => void copyPoolLink(uid)}>
                        <Copy aria-hidden="true" />
                    </Button>
                    {canShare && (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-10 shrink-0"
                            aria-label="Share link"
                            onClick={() => {
                                void haptic.tap()
                                void navigator.share({ title, text: `Join "${title}" on Secret Santa`, url }).catch(() => undefined)
                            }}
                        >
                            <Share2 aria-hidden="true" />
                        </Button>
                    )}
                </div>
            </section>
        </TourStep>
    )
}

function AddPeopleBlock({ uid, remaining }: { uid: string; remaining: number }) {
    const ids = useId()
    const { busy, run } = useSantaAction(uid)
    const [text, setText] = useState("")
    const [summary, setSummary] = useState<string | null>(null)

    const add = async () => {
        const emails = splitEmails(text)
        if (emails.length === 0) {
            void haptic.error()
            setSummary("Paste at least one email.")
            return
        }
        const result = await run<AddParticipantsResult>("add", "/participants", "POST", { emails })
        if (!result) return
        const parts = [
            result.added.length > 0 && `${result.added.length} added and invited`,
            result.skipped.length > 0 && `${result.skipped.length} already in`,
            result.rejected.length > 0 && `not added (not an Ashoka email): ${result.rejected.join(", ")}`,
        ].filter(Boolean)
        setSummary(parts.join(". ") + (result.warnings.length > 0 ? `. ${result.warnings.join(" ")}` : "."))
        setText(result.rejected.join("\n"))
        if (result.added.length > 0) toast.success(`${result.added.length} added. Invites are on their way.`)
    }

    return (
        <section className={block} aria-labelledby={`${ids}-add`}>
            <h3 id={`${ids}-add`} className={heading}>
                Add people by email
            </h3>
            <Label htmlFor={`${ids}-emails`} className="sr-only">
                Emails
            </Label>
            <Textarea
                id={`${ids}-emails`}
                rows={3}
                value={text}
                placeholder="first.last_ug2024@ashoka.edu.in, another@ashoka.edu.in"
                onChange={(e) => setText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
                Separate with commas or new lines. They&apos;re in straight away and get an invite email. {remaining} spots left.
            </p>
            <Button
                type="button"
                variant="outline"
                className="w-fit"
                disabled={busy === "add" || text.trim() === ""}
                onClick={() => {
                    void haptic.press()
                    void add()
                }}
            >
                {busy === "add" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <UserPlus aria-hidden="true" />}
                Add and invite
            </Button>
            {summary && (
                <p className="text-sm" aria-live="polite">
                    {summary}
                </p>
            )}
        </section>
    )
}

function PeopleBlock({ view }: { view: PoolView }) {
    const { busy, run } = useSantaAction(view.uid)
    const people = view.host?.participants ?? []
    const open = view.status === "open"

    return (
        <section className={block} aria-label="People">
            <h3 className={heading}>People</h3>
            {people.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nobody yet. Share the link or add emails.</p>
            ) : (
                <ul className="flex flex-col divide-y divide-border">
                    {people.map((person) => (
                        <li key={person.id} className="flex min-h-12 items-center justify-between gap-3 py-2">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">
                                    {person.name}
                                    {person.isMe && <span className="font-normal text-muted-foreground"> (you)</span>}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {person.email}
                                    {person.source === "host" && " · added by you"}
                                </p>
                            </div>
                            {open ? (
                                !person.isMe && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Remove ${person.name}`}
                                        disabled={busy === `remove-${person.id}`}
                                        onClick={() => {
                                            void haptic.warn()
                                            void run(`remove-${person.id}`, `/participants/${person.id}`, "DELETE", undefined, {
                                                success: `${person.name} removed.`,
                                            })
                                        }}
                                    >
                                        <UserMinus aria-hidden="true" />
                                    </Button>
                                )
                            ) : (
                                <span
                                    className={cn(
                                        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                                        person.emailStatus === "sent" && "bg-green/15 text-green-dark dark:text-green-light",
                                        person.emailStatus === "failed" && "bg-destructive/15 text-destructive-text",
                                        person.emailStatus === "none" && "bg-muted text-muted-foreground",
                                    )}
                                >
                                    {person.emailStatus === "sent" && <Check className="size-3" aria-hidden="true" />}
                                    {person.emailStatus === "failed" && <MailWarning className="size-3" aria-hidden="true" />}
                                    {person.emailStatus === "sent" ? "Emailed" : person.emailStatus === "failed" ? "Failed" : "Sending"}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

function PersonSelect({
    label,
    value,
    onChange,
    people,
}: {
    label: string
    value: string
    onChange: (value: string) => void
    people: { id: number; name: string }[]
}) {
    return (
        <Select
            value={value}
            onValueChange={(next) => {
                void haptic.select()
                onChange(next)
            }}
        >
            <SelectTrigger className="h-10 w-full" aria-label={label}>
                <SelectValue placeholder={label} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
                {people.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

function ExclusionsBlock({ view }: { view: PoolView }) {
    const ids = useId()
    const { busy, run } = useSantaAction(view.uid)
    const people = view.host?.participants ?? []
    const pairs = view.host?.exclusions ?? []
    const [a, setA] = useState("")
    const [b, setB] = useState("")
    const nameOf = useMemo(() => new Map(people.map((p) => [p.id, p.name])), [people])
    const keys = useMemo(() => new Set(pairs.map(([x, y]) => pairKey(x, y))), [pairs])

    const save = (next: ExclusionPair[], message: string) =>
        run("exclusions", "/exclusions", "PUT", { pairs: next }, { success: message })

    const add = () => {
        const first = Number(a)
        const second = Number(b)
        if (!first || !second || first === second || keys.has(pairKey(first, second))) {
            void haptic.error()
            toast.error("Pick two different people who aren't already a pair.")
            return
        }
        void haptic.press()
        void save([...pairs, [first, second]], "Pair saved. They won't draw each other.").then(() => {
            setA("")
            setB("")
        })
    }

    return (
        <section className={block} aria-labelledby={`${ids}-ex`}>
            <h3 id={`${ids}-ex`} className={heading}>
                Keep apart
            </h3>
            <p className="text-xs text-muted-foreground">
                Couples or roommates who shouldn&apos;t draw each other. Works both ways.
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <PersonSelect label="First person" value={a} onChange={setA} people={people} />
                <PersonSelect label="Second person" value={b} onChange={setB} people={people.filter((p) => String(p.id) !== a)} />
                <Button type="button" variant="outline" className="h-10" disabled={busy === "exclusions" || !a || !b} onClick={add}>
                    <Ban aria-hidden="true" /> Add
                </Button>
            </div>
            {pairs.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                    {pairs.map(([x, y]) => (
                        <li
                            key={pairKey(x, y)}
                            className="inline-flex items-center gap-1 rounded-full bg-muted py-1 pl-3 pr-1 text-xs font-semibold"
                        >
                            {nameOf.get(x) ?? "Someone"} ⟷ {nameOf.get(y) ?? "Someone"}
                            <button
                                type="button"
                                aria-label={`Remove pair ${nameOf.get(x) ?? ""} and ${nameOf.get(y) ?? ""}`}
                                className="flex size-7 items-center justify-center rounded-full hover:bg-background"
                                onClick={() => {
                                    void haptic.tap()
                                    void save(
                                        pairs.filter(([p, q]) => pairKey(p, q) !== pairKey(x, y)),
                                        "Pair removed.",
                                    )
                                }}
                            >
                                <X className="size-3.5" aria-hidden="true" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

function DeliveryBlock({ view }: { view: PoolView }) {
    const { busy, run } = useSantaAction(view.uid)
    const people = view.host?.participants ?? []
    const sent = people.filter((p) => p.emailStatus === "sent").length
    const failed = people.filter((p) => p.emailStatus === "failed").length
    const pending = people.length - sent - failed

    return (
        <section className={block} aria-label="Email delivery">
            <h3 className={heading}>Draw emails</h3>
            <p className="text-sm">
                {sent} sent{failed > 0 && `, ${failed} failed`}
                {pending > 0 && `, ${pending} still sending`}.
            </p>
            {pending > 0 && <p className="text-xs text-muted-foreground">Reload in a minute to see the latest.</p>}
            {failed > 0 && (
                <Button
                    type="button"
                    variant="outline"
                    className="w-fit"
                    disabled={busy === "resend"}
                    onClick={() => {
                        void haptic.press()
                        void run<ResendResult>("resend", "/draw/resend", "POST").then((result) => {
                            if (result) toast.success(`${result.resent} resent${result.failed > 0 ? `, ${result.failed} still failing` : ""}.`)
                        })
                    }}
                >
                    {busy === "resend" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
                    Resend failed
                </Button>
            )}
            <p className="text-xs text-muted-foreground">You see delivery only. Pairs stay secret, even from you.</p>
        </section>
    )
}

function DangerBlock({ view }: { view: PoolView }) {
    const router = useRouter()
    const { busy, run } = useSantaAction(view.uid)
    return (
        <section className={cn(block, "gap-1")} aria-label="Manage">
            <EditPoolDialog view={view} />
            <Dialog>
                <DialogTrigger asChild>
                    <Button type="button" variant="ghost" className="justify-start text-destructive-text" onClick={() => void haptic.warn()}>
                        <Trash2 aria-hidden="true" /> Delete Secret Santa
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete &ldquo;{view.title}&rdquo;?</DialogTitle>
                        <DialogDescription>
                            This deletes the pool and all {view.participantCount} people&apos;s wish lists. Nobody is emailed. This
                            can&apos;t be undone.
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
                            disabled={busy === "delete"}
                            onClick={() => {
                                void haptic.warn()
                                void run("delete", "", "DELETE", undefined, { success: "Deleted.", refresh: false }).then((done) => {
                                    if (done) router.push(SANTA_BASE_PATH)
                                })
                            }}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    )
}

/** Everything only the host can do. Desktop: a side column. Mobile: inside a drawer. */
export function HostPanel({ view, onRequestDraw }: HostPanelProps) {
    const open = view.status === "open"
    const count = view.participantCount
    const short = Math.max(0, LIMITS.minParticipants - count)

    return (
        <div className="flex flex-col gap-4">
            {open && (
                <TourStep
                    id="santa-draw"
                    title="Draw names"
                    content="When everyone's in, press Draw names. Everyone gets an email with their giftee. This can't be redone. Shortcut: D."
                    order={4}
                >
                    <section className={cn(block, "border-2 border-primary/40")} aria-label="Draw names">
                        <Button
                            type="button"
                            size="lg"
                            className="button-animated w-full rounded-full"
                            disabled={short > 0}
                            onClick={() => {
                                void haptic.press()
                                onRequestDraw()
                            }}
                        >
                            <Shuffle aria-hidden="true" /> Draw names
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">
                            {short > 0
                                ? `Needs at least ${LIMITS.minParticipants} people. ${short} to go.`
                                : `${count} people ready. Drawing locks the pool.`}
                        </p>
                    </section>
                </TourStep>
            )}
            {open && <ShareBlock uid={view.uid} title={view.title} />}
            {open && <AddPeopleBlock uid={view.uid} remaining={LIMITS.maxParticipants - count} />}
            {!open && <DeliveryBlock view={view} />}
            <PeopleBlock view={view} />
            {open && <ExclusionsBlock view={view} />}
            <DangerBlock view={view} />
        </div>
    )
}
