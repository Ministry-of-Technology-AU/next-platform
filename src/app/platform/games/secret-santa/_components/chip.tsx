import { cn } from "@/lib/utils"

/** One chip size for every fact (budget, date, count, countdown), so rows line up. */
export const CHIP = "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold leading-none"

/** `onColour` sits on red, green or gold surfaces; `muted` on cards. */
export const CHIP_TONE = {
    onColour: "bg-black/20",
    muted: "bg-muted text-foreground",
} as const

interface ChipProps {
    tone?: keyof typeof CHIP_TONE
    className?: string
    children: React.ReactNode
}

export function Chip({ tone = "onColour", className, children }: ChipProps) {
    return <span className={cn(CHIP, CHIP_TONE[tone], className)}>{children}</span>
}
