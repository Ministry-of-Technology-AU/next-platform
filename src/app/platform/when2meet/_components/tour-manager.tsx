"use client";

import { useEffect } from "react";
import { useTour } from "@/components/guided-tour";

const STORAGE_KEY = "WHEN2MEET_TOUR_SEEN_V1";

export function TourManager() {
    const { startTour, isActive } = useTour();

    useEffect(() => {
        const hasSeenTour = localStorage.getItem(STORAGE_KEY);
        if (!hasSeenTour) {
            const timer = setTimeout(() => {
                startTour();
                // We mark it as seen immediately when we launch it. 
                // This ensures it doesn't pop up again on refresh.
                localStorage.setItem(STORAGE_KEY, "true");
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [startTour]);

    return null;
}
