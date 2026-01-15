"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function Tracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!pathname) return;

        // Filter out restricted paths or non-tool pages if necessary
        // We only want /platform/<tool-name>
        const parts = pathname.split('/').filter(Boolean);
        if (parts.length < 2 || parts[0] !== 'platform') return;

        const toolName = parts[1];
        const fullPath = `/platform/${toolName}`;

        // Get existing
        let visited: string[] = [];
        try {
            const stored = localStorage.getItem("recently-visited");
            if (stored) {
                visited = JSON.parse(stored);
            }
        } catch (e) {
            console.error("Error reading from local storage", e);
        }

        // Add new (remove if exists first to move to top)
        visited = visited.filter((p) => p !== fullPath);
        visited.unshift(fullPath);

        // Keep top 10 (or 4, but storing a few more is safer)
        visited = visited.slice(0, 10);

        try {
            localStorage.setItem("recently-visited", JSON.stringify(visited));
            // Dispatch a custom event so other components can update immediately if they listen
            window.dispatchEvent(new Event("recently-visited-updated"));
        } catch (e) {
            console.error("Error writing to local storage", e);
        }
    }, [pathname, searchParams]);

    return null;
}

export function RecentPageTracker() {
    return (
        <Suspense fallback={null}>
            <Tracker />
        </Suspense>
    );
}
