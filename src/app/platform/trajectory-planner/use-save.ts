"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"
import { haptic } from "@/lib/haptics"
import { useCoursePlanner } from "./course-planner-context"

/** Saves the board to the student's account. The board itself already survives reloads on this device. */
export function useSaveTrajectory() {
    const { state } = useCoursePlanner()
    const [isSaving, setIsSaving] = useState(false)

    const save = useCallback(async () => {
        setIsSaving(true)
        try {
            const response = await fetch("/api/platform/trajectory-planner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ state }),
            })
            if (!response.ok) throw new Error(`Save failed with status ${response.status}`)
            void haptic.confirm()
            toast.success("Saved to your account")
        } catch (err) {
            platform.error("Trajectory planner: save failed", err)
            void haptic.error()
            toast.error("Couldn't save your plan. It's still on this device. Try Save again in a minute.")
        } finally {
            setIsSaving(false)
        }
    }, [state])

    return { isSaving, save }
}
