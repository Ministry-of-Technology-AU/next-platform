"use client"

import { useCallback, useRef } from "react"
import { toast } from "sonner"
import { useAutoSave } from "@/hooks/use-auto-save"
import { haptic } from "@/lib/haptics"
import { useCoursePlanner } from "./course-planner-context"
import { AUTO_SAVE, KEEPALIVE_MAX_BYTES } from "./data"
import type { CoursePlannerState, SaveTrajectoryRequest, SaveTrajectoryResponse } from "./types"

async function saveToAccount(state: CoursePlannerState): Promise<void> {
    const body = JSON.stringify({ state } satisfies SaveTrajectoryRequest)
    const response = await fetch("/api/platform/trajectory-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        // Lets the last save finish when the tab closes, within the browser's 64 KB cap.
        keepalive: body.length < KEEPALIVE_MAX_BYTES,
    })
    const json = (await response.json().catch(() => null)) as SaveTrajectoryResponse | null
    if (!response.ok || !json?.success) {
        throw new Error((json && !json.success && json.error) || `Save failed with status ${response.status}`)
    }
}

/**
 * Keeps the board in the student's account. Saves a moment after each burst of edits;
 * `saveNow` is the Save button and the S shortcut. `savedState` is what the account held at
 * page load (null when nothing), so a plan that only lived on this device gets saved too.
 * `paused` (the account copy failed to load) turns auto-save off; Save still works.
 */
export function useTrajectorySync(savedState: CoursePlannerState | null, paused: boolean) {
    const { state, hydrated } = useCoursePlanner()
    // One toast per run of failures, not one per retry.
    const warned = useRef(false)

    const autoSave = useAutoSave(state, saveToAccount, {
        ...AUTO_SAVE,
        enabled: hydrated && !paused,
        savedValue: savedState,
        onSuccess: () => {
            warned.current = false
        },
        onError: (err) => {
            platform.error("Trajectory planner: save failed", err)
            if (warned.current) return
            warned.current = true
            toast.error("Couldn't save your plan. It's still on this device; we'll keep trying.")
        },
    })

    const { flush } = autoSave
    const saveNow = useCallback(async () => {
        // While paused the saver tracks nothing, so the button sends the board directly.
        const saved = paused ? await saveToAccount(state).then(() => true, () => false) : await flush()
        if (saved) {
            void haptic.confirm()
            toast.success("All changes saved to your account")
        } else {
            void haptic.error()
            toast.error("Couldn't save your plan. It's still on this device. Try Save again in a minute.")
        }
    }, [flush, paused, state])

    return { ...autoSave, saveNow }
}
