import { cn } from "@/lib/utils"
import styles from "./santa.module.css"

export type TagTone = "red" | "green" | "gold"

const TONES: Record<TagTone, string> = {
    red: "bg-primary text-primary-foreground",
    green: "bg-green-dark text-white",
    gold: "bg-secondary text-secondary-foreground",
}

interface GiftTagProps {
    tone: TagTone
    children: React.ReactNode
    className?: string
}

/** A notched gift tag with a punched hole. Pure markup; callers add motion around it. */
export function GiftTag({ tone, children, className }: GiftTagProps) {
    return (
        <div className={cn(styles.tag, "rounded-r-xl py-3 pl-7 pr-4 shadow-sm", TONES[tone], className)}>
            <span className={styles.tagHole} aria-hidden="true" />
            {children}
        </div>
    )
}

/** Cycles red, green, gold so a board of tags reads as festive, not random. */
export function toneFor(index: number): TagTone {
    const tones: TagTone[] = ["red", "green", "gold"]
    return tones[index % tones.length] ?? "red"
}
