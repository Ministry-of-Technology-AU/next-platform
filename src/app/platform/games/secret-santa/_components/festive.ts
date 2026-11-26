"use client"

import confetti from "canvas-confetti"

/** Reads a colour token from globals.css so confetti never hardcodes a hex. */
function token(name: string, fallback: string): string {
    if (typeof window === "undefined") return fallback
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    return value || fallback
}

export function prefersReducedMotion(): boolean {
    return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function festiveColours(): string[] {
    return [
        token("--color-primary", "#87281b"),
        token("--color-primary-bright", "#9C2414"),
        token("--color-green", "#519872"),
        token("--color-green-dark", "#2b6948"),
        token("--color-secondary", "#ffcd74"),
    ]
}

/** One burst from a point on screen (0..1 coordinates). Skipped under reduced motion. */
export function burst(origin: { x: number; y: number } = { x: 0.5, y: 0.6 }, particleCount = 90): void {
    if (prefersReducedMotion()) return
    void confetti({
        particleCount,
        spread: 75,
        startVelocity: 42,
        gravity: 0.9,
        ticks: 220,
        origin,
        colors: festiveColours(),
        shapes: ["square", "circle"],
        scalar: 0.9,
        zIndex: 9999,
        disableForReducedMotion: true,
    })
}

/** Two side cannons for the big reveal. */
export function celebrate(): void {
    if (prefersReducedMotion()) return
    const colors = festiveColours()
    const end = Date.now() + 1400
    const frame = () => {
        void confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.65 }, colors, zIndex: 9999 })
        void confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.65 }, colors, zIndex: 9999 })
        if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
}

/** True when a keyboard shortcut should be ignored because the user is typing. */
export function isTyping(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false
    return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
}

/** Shared spring for things that pop in. */
export const POP_SPRING = { type: "spring", stiffness: 380, damping: 26 } as const
export const EASE_OUT = [0.22, 1, 0.36, 1] as const
