"use client"

import { useEffect } from "react"
import { useTour } from "@/components/guided-tour"
import { STORAGE_KEYS } from "../data"
import { readStorage, writeStorage } from "../utils"

/** Starts the planner tour on a student's first visit. The navbar help button replays it. */
export function TourManager() {
    const { startTour } = useTour()

    useEffect(() => {
        if (readStorage<boolean>(STORAGE_KEYS.tourSeen)) return

        // Wait a moment so every TourStep on the page has registered.
        const timer = setTimeout(() => {
            startTour()
            writeStorage(STORAGE_KEYS.tourSeen, true)
        }, 1000)
        return () => clearTimeout(timer)
    }, [startTour])

    return null
}
