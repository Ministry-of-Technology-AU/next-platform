"use client";

import { useEffect } from "react";
import { useTour } from "@/components/guided-tour";

const STORAGE_KEY = "ASHOKAN_AROUND_TOUR_SEEN_V1";

export function TourManager() {
    const { startTour, isActive } = useTour();

    useEffect(() => {
        const hasSeenTour = localStorage.getItem(STORAGE_KEY);
        if (!hasSeenTour) {
            const timer = setTimeout(() => {
                startTour();
                localStorage.setItem(STORAGE_KEY, "true");
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [startTour]);

    return null;
}
