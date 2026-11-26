"use client"

import { useId, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ArrowLeft, ArrowRight, Gift, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { haptic } from "@/lib/haptics"
import { cn } from "@/lib/utils"
import { santaRequest } from "../api"
import { BUDGET_QUICK_PICKS, LIMITS, poolPath } from "../data"
import { CreatePoolSchema } from "../schema"
import { formatRupees } from "../utils"
import { EventDateField } from "./event-date-field"
import { EASE_OUT, burst } from "./festive"

const STEPS = ["Basics", "Budget and date", "Note"] as const

interface CreateStepperProps {
    defaultName: string
}

function Ornaments({ step }: { step: number }) {
    const fills = ["bg-primary", "bg-green", "bg-secondary"] as const
    return (
        <ol className="flex items-center gap-3" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
            {STEPS.map((label, index) => (
                <li key={label} className="flex items-center gap-2 sm:gap-3">
                    <span className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border">
                        <motion.span
                            className={cn("absolute inset-0", fills[index])}
                            initial={false}
                            animate={{ scale: index <= step ? 1 : 0.4, opacity: index <= step ? 1 : 0 }}
                            transition={{ type: "spring", stiffness: 420, damping: 24 }}
                            aria-hidden="true"
                        />
                        <span
                            className={cn(
                                "relative text-xs font-bold transition-colors",
                                index <= step ? (index === 2 ? "text-secondary-foreground" : "text-white") : "text-muted-foreground",
                            )}
                        >
                            {index + 1}
                        </span>
                    </span>
                    <span
                        className={cn(
                            "hidden text-sm sm:inline",
                            index === step ? "font-semibold" : "text-muted-foreground",
                        )}
                    >
                        {label}
                    </span>
                    {index < STEPS.length - 1 && <span className="h-px w-6 bg-border sm:w-10" aria-hidden="true" />}
                </li>
            ))}
        </ol>
    )
}

export function CreateStepper({ defaultName }: CreateStepperProps) {
    const router = useRouter()
    const reduce = useReducedMotion()
    const ids = useId()
    const [step, setStep] = useState(0)
    const [direction, setDirection] = useState(1)
    const [title, setTitle] = useState("")
    const [hostPlays, setHostPlays] = useState(true)
    const [hostName, setHostName] = useState(defaultName)
    const [budget, setBudget] = useState<string>("500")
    const [eventDate, setEventDate] = useState("")
    const [hostNote, setHostNote] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    const stepError = (index: number): string | null => {
        if (index === 0) {
            const t = title.trim()
            if (t.length < LIMITS.titleMin) return `Give it a name of at least ${LIMITS.titleMin} characters.`
            if (t.length > LIMITS.titleMax) return `Keep the name under ${LIMITS.titleMax} characters.`
            if (hostPlays && hostName.trim().length < LIMITS.nameMin) return "Add your name so your Santa knows you."
        }
        if (index === 1) {
            const amount = Number(budget)
            if (!Number.isInteger(amount) || amount < 0 || amount > LIMITS.budgetMax) {
                return `Pick a whole-rupee budget up to ${formatRupees(LIMITS.budgetMax)}.`
            }
            if (!eventDate) return "Pick the day of the gift exchange."
            if (new Date(eventDate).getTime() < Date.now() - 60_000) return "Pick a date that hasn't passed."
        }
        return null
    }

    const go = (next: number) => {
        if (next > step) {
            const problem = stepError(step)
            if (problem) {
                setError(problem)
                void haptic.error()
                return
            }
        }
        setError(null)
        setDirection(next > step ? 1 : -1)
        setStep(next)
        void haptic.select()
    }

    const submit = async () => {
        const parsed = CreatePoolSchema.safeParse({
            title,
            budget,
            eventDate,
            hostNote,
            hostPlays,
            hostName: hostPlays ? hostName : undefined,
        })
        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? "Check the form and try again.")
            void haptic.error()
            return
        }
        setSaving(true)
        setError(null)
        const response = await santaRequest<{ uid: string }>("", "POST", parsed.data)
        if (!response.success) {
            setSaving(false)
            setError(response.error)
            void haptic.error()
            return
        }
        void haptic.confirm()
        burst({ x: 0.5, y: 0.55 }, 120)
        toast.success("Your Secret Santa is ready. Share the link to bring people in.")
        router.push(poolPath(response.data.uid))
    }

    const onEnter = (event: React.KeyboardEvent) => {
        if (event.key !== "Enter") return
        event.preventDefault()
        if (step < STEPS.length - 1) go(step + 1)
    }

    const variants = {
        enter: (dir: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: 28 * dir, filter: "blur(4px)" }),
        center: { opacity: 1, x: 0, filter: "blur(0px)" },
        exit: (dir: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: -16 * dir, filter: "blur(2px)" }),
    }

    return (
        <div className="mx-auto w-full max-w-2xl">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <Ornaments step={step} />
                    <span className="text-xs text-muted-foreground">
                        {step + 1} / {STEPS.length}
                    </span>
                </div>

                <div className="relative -mx-1.5 min-h-[17rem] overflow-hidden px-1.5 pb-1.5">
                    <AnimatePresence mode="wait" custom={direction} initial={false}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.28, ease: EASE_OUT }}
                            className="flex flex-col gap-5"
                        >
                            {step === 0 && (
                                <>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor={`${ids}-title`}>What&apos;s it called?</Label>
                                        <Input
                                            id={`${ids}-title`}
                                            value={title}
                                            maxLength={LIMITS.titleMax}
                                            placeholder="Third floor Secret Santa"
                                            autoFocus
                                            onChange={(e) => setTitle(e.target.value)}
                                            onKeyDown={onEnter}
                                        />
                                    </div>
                                    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border p-3">
                                        <Checkbox
                                            checked={hostPlays}
                                            onCheckedChange={(checked) => {
                                                setHostPlays(checked === true)
                                                void haptic.select()
                                            }}
                                        />
                                        <span className="text-sm">
                                            <span className="font-semibold">I&apos;m playing too</span>
                                            <span className="block text-muted-foreground">
                                                You&apos;re in the draw like everyone else. You still won&apos;t see
                                                anyone else&apos;s pair.
                                            </span>
                                        </span>
                                    </label>
                                    {hostPlays && (
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor={`${ids}-name`}>Your name, as your Santa sees it</Label>
                                            <Input
                                                id={`${ids}-name`}
                                                value={hostName}
                                                maxLength={LIMITS.nameMax}
                                                onChange={(e) => setHostName(e.target.value)}
                                                onKeyDown={onEnter}
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            {step === 1 && (
                                <>
                                    <fieldset className="flex flex-col gap-3">
                                        <legend className="mb-2 text-sm font-medium">Budget per gift</legend>
                                        <div className="flex flex-wrap gap-2">
                                            {BUDGET_QUICK_PICKS.map((amount) => {
                                                const active = Number(budget) === amount
                                                return (
                                                    <button
                                                        key={amount}
                                                        type="button"
                                                        aria-pressed={active}
                                                        onClick={() => {
                                                            setBudget(String(amount))
                                                            void haptic.select()
                                                        }}
                                                        className={cn(
                                                            "min-h-11 rounded-full border-2 px-5 text-sm font-semibold transition-colors",
                                                            active
                                                                ? "border-green-dark bg-green-dark text-white"
                                                                : "border-border hover:border-green",
                                                        )}
                                                    >
                                                        {formatRupees(amount)}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        <div className="flex max-w-xs items-center gap-2">
                                            <span className="shrink-0 text-sm text-muted-foreground">Or type an amount, ₹</span>
                                            <Input
                                                className="h-11"
                                                aria-label="Custom budget in rupees"
                                                inputMode="numeric"
                                                value={budget}
                                                onChange={(e) => setBudget(e.target.value.replace(/[^\d]/g, ""))}
                                                onKeyDown={onEnter}
                                            />
                                        </div>
                                    </fieldset>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor={`${ids}-date`}>When do gifts get exchanged?</Label>
                                        <EventDateField id={`${ids}-date`} value={eventDate} onChange={setEventDate} />
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <div className="flex flex-col gap-2">
                                    <Label>A note for everyone (optional)</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Theme, venue, rules. It shows on the pool page and in every draw email.
                                    </p>
                                    <RichTextEditor
                                        value={hostNote}
                                        onChange={setHostNote}
                                        placeholder="Wrap it in newspaper. We swap at the hostel common room after dinner."
                                    />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <p role="alert" className="min-h-5 text-sm text-destructive-text">
                    {error}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={step === 0 || saving}
                        onClick={() => go(step - 1)}
                    >
                        <ArrowLeft aria-hidden="true" /> Back
                    </Button>
                    {step < STEPS.length - 1 ? (
                        <Button type="button" className="rounded-full" onClick={() => go(step + 1)}>
                            Next <ArrowRight aria-hidden="true" />
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            className="button-animated rounded-full"
                            disabled={saving}
                            onClick={() => {
                                void haptic.press()
                                void submit()
                            }}
                        >
                            {saving ? (
                                <Loader2 className="animate-spin" aria-hidden="true" />
                            ) : (
                                <Gift aria-hidden="true" />
                            )}
                            {saving ? "Wrapping it up" : "Create Secret Santa"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
