"use client"

import { useEffect } from "react"
import { useTour } from "@/components/guided-tour"
import { STORAGE_KEYS } from "../data"

/** Starts the Secret Santa tour on the first visit. The navbar help button replays it. */
export function TourManager() {
    const { startTour } = useTour()

    useEffect(() => {
        let seen = false
        try {
            seen = window.localStorage.getItem(STORAGE_KEYS.tourSeen) === "1"
        } catch {
            seen = true
        }
        if (seen) return

        // Wait a moment so every TourStep on the page has registered.
        const timer = setTimeout(() => {
            startTour()
            try {
                window.localStorage.setItem(STORAGE_KEYS.tourSeen, "1")
            } catch {
                // Private mode: the tour shows again next time, which is fine.
            }
        }, 1000)
        return () => clearTimeout(timer)
    }, [startTour])

    return null
}
