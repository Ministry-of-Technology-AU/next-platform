"use client";

import { useEffect } from "react";
import { useTour } from "@/components/guided-tour";

const STORAGE_KEY = "TRAJECTORY_PLANNER_TOUR_SEEN_V1";

export function TourManager() {
    const { startTour, isActive } = useTour();

    useEffect(() => {
        // Check if user has seen the tour for this version
        const hasSeenTour = localStorage.getItem(STORAGE_KEY);

        if (!hasSeenTour) {
            // Small delay to ensure everything is mounted
            const timer = setTimeout(() => {
                startTour();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [startTour]);

    // Monitor when tour finishes (isActive becomes false after being true)
    useEffect(() => {
        if (!isActive) {

            const handleTourCompleted = () => {
                localStorage.setItem(STORAGE_KEY, "true");
            };
        }
    }, [isActive]);

    // We'll wrap the startTour call to set the storage key.
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
    }, []);

    return null;
}
