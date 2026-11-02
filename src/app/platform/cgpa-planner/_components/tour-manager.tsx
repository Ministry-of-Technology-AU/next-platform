"use client";

import { useEffect } from "react";
import { useTour } from "@/components/guided-tour";

// Bump the version when the tour changes so returning users see it again.
const STORAGE_KEY = "CGPA_PLANNER_TOUR_SEEN_V2";

/** Starts the CGPA planner tour on a student's first visit. The navbar help button replays it. */
export function TourManager() {
  const { startTour } = useTour();

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      // Storage can be blocked. Treat as not seen.
    }
    if (seen) return;

    // Wait a moment so every TourStep on the page has registered.
    const timer = setTimeout(() => {
      startTour();
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // Ignore. The tour still runs this time.
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [startTour]);

  return null;
}
