import type { ExclusionPair } from "./types"

/** Order-independent key for a pair of participant ids. */
export function pairKey(a: number, b: number): string {
    return a < b ? `${a}:${b}` : `${b}:${a}`
}

/** Drops self-pairs, duplicates and pairs that mention ids outside `ids`. */
export function cleanExclusions(pairs: readonly ExclusionPair[], ids: readonly number[]): ExclusionPair[] {
    const known = new Set(ids)
    const seen = new Set<string>()
    const clean: ExclusionPair[] = []
    for (const [a, b] of pairs) {
        if (a === b || !known.has(a) || !known.has(b)) continue
        const key = pairKey(a, b)
        if (seen.has(key)) continue
        seen.add(key)
        clean.push(a < b ? [a, b] : [b, a])
    }
    return clean
}

function shuffled<T>(items: readonly T[], random: () => number): T[] {
    const copy = [...items]
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        const held = copy[i]
        const swap = copy[j]
        if (held === undefined || swap === undefined) continue
        copy[i] = swap
        copy[j] = held
    }
    return copy
}

/**
 * Draws Secret Santa pairs. Returns giver id to giftee id, or null when no valid draw exists
 * (or none was found within `maxSteps`).
 *
 * Rules: everyone gives once and receives once, nobody draws themselves, and no excluded pair
 * draws each other in either direction. Randomised backtracking: givers and candidates are
 * shuffled, so every valid draw can come out, and impossible exclusion sets are detected
 * instead of looping forever.
 */
export function drawPairs(
    ids: readonly number[],
    exclusions: readonly ExclusionPair[],
    random: () => number = Math.random,
    maxSteps = 200_000,
): Map<number, number> | null {
    if (ids.length < 2 || new Set(ids).size !== ids.length) return null

    const blocked = new Set(exclusions.map(([a, b]) => pairKey(a, b)))
    const givers = shuffled(ids, random)
    const taken = new Set<number>()
    const result = new Map<number, number>()
    let steps = 0

    const allowed = (giver: number, giftee: number) =>
        giver !== giftee && !taken.has(giftee) && !blocked.has(pairKey(giver, giftee))

    const assign = (index: number): boolean => {
        if (index === givers.length) return true
        if (++steps > maxSteps) return false
        const giver = givers[index]
        if (giver === undefined) return false
        for (const giftee of shuffled(ids, random)) {
            if (!allowed(giver, giftee)) continue
            taken.add(giftee)
            result.set(giver, giftee)
            if (assign(index + 1)) return true
            taken.delete(giftee)
            result.delete(giver)
        }
        return false
    }

    return assign(0) ? result : null
}

/** True when `pairs` is a valid draw for `ids` under `exclusions`. Used to double-check a draw. */
export function isValidDraw(
    pairs: ReadonlyMap<number, number>,
    ids: readonly number[],
    exclusions: readonly ExclusionPair[],
): boolean {
    if (pairs.size !== ids.length) return false
    const blocked = new Set(exclusions.map(([a, b]) => pairKey(a, b)))
    const received = new Set<number>()
    for (const id of ids) {
        const giftee = pairs.get(id)
        if (giftee === undefined || giftee === id || blocked.has(pairKey(id, giftee))) return false
        if (!ids.includes(giftee) || received.has(giftee)) return false
        received.add(giftee)
    }
    return true
}

/** Whole days from now until `iso`, never negative. */
export function daysUntil(iso: string, now: Date = new Date()): number {
    const target = new Date(iso).getTime()
    if (Number.isNaN(target)) return 0
    return Math.max(0, Math.ceil((target - now.getTime()) / 86_400_000))
}

export function formatRupees(amount: number): string {
    return `₹${amount.toLocaleString("en-IN")}`
}

export function formatEventDate(iso: string): string {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return "Date TBD"
    return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
}

/** "Sun, 20 Dec". For tight spaces like the email fact cards. */
export function formatShortDate(iso: string): string {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return "TBD"
    return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
}

/** Strips tags to measure how much text a rich text value really holds. */
export function plainTextLength(html: string): number {
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length
}

/** Name to show when a host-added person hasn't set one yet. */
export function fallbackName(email: string): string {
    const local = email.split("@")[0] ?? email
    return local
        .split(/[._]/)
        .filter((part) => part.length > 0 && !/^(ug|pg|asp|ma|phd|ysp)\d*$/i.test(part))
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ") || local
}
