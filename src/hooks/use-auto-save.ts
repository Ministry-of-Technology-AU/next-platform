"use client"

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react"
import { createAutoSaver, type AutoSaveOptions, type AutoSaveSnapshot, type AutoSaver } from "@/lib/auto-save"

export type { AutoSaveStatus, AutoSaveSnapshot } from "@/lib/auto-save"

export interface UseAutoSaveOptions<T> extends Omit<AutoSaveOptions<T>, "save"> {
    /**
     * Off while the value isn't the user's yet (still loading or hydrating). Nothing is saved
     * while off, and turning on sets the baseline (see `savedValue`).
     */
    enabled?: boolean
    /**
     * What the server already has, applied when saving turns on. Leave it out to treat the value
     * at that moment as saved. Pass `null` when the server has nothing, so that value saves too.
     */
    savedValue?: T | null
    /** Ask before closing the tab while changes are unsaved. On by default. */
    warnOnUnload?: boolean
    /**
     * Save straight away when the tab is hidden or the component unmounts. On by default.
     * A save that may run as the page closes should send its request with `keepalive: true`.
     */
    flushOnHide?: boolean
}

export interface UseAutoSaveResult extends AutoSaveSnapshot {
    /** Saves pending changes now (a Save button, a shortcut). Resolves true when all is saved. */
    flush: () => Promise<boolean>
    /** Drops the scheduled save without losing the changes. */
    cancel: () => void
}

const SERVER_SNAPSHOT: AutoSaveSnapshot = { status: "idle", isDirty: false, lastSavedAt: null, error: null }

/**
 * Saves `value` with `save` a moment after the user stops changing it. See `src/lib/auto-save.ts`
 * for the scheduling rules. `save` and the options can change every render; the latest are used.
 *
 * @example
 * const { status, flush } = useAutoSave(plan, (plan) => putPlan(plan), { enabled: hydrated, maxWait: 10_000 })
 */
export function useAutoSave<T>(value: T, save: (value: T) => Promise<void>, options: UseAutoSaveOptions<T> = {}): UseAutoSaveResult {
    const { enabled = true, warnOnUnload = true, flushOnHide = true, savedValue, ...saverOptions } = options

    const saverRef = useRef<AutoSaver<T> | null>(null)
    if (saverRef.current === null) saverRef.current = createAutoSaver<T>({ ...saverOptions, save })
    const saver = saverRef.current
    saver.setOptions({ ...saverOptions, save })

    const snapshot = useSyncExternalStore(saver.subscribe, saver.getSnapshot, () => SERVER_SNAPSHOT)

    // Read only when saving turns on, so a new object each render doesn't reset the baseline.
    const savedValueRef = useRef(savedValue)
    savedValueRef.current = savedValue

    // Turning on (or back on) sets the baseline; after that, every change counts.
    const wasEnabled = useRef(false)
    useEffect(() => {
        if (!enabled) {
            wasEnabled.current = false
            saver.cancel()
            return
        }
        if (!wasEnabled.current) {
            wasEnabled.current = true
            const baseline = savedValueRef.current
            if (baseline === undefined) {
                saver.markSaved(value)
                return
            }
            if (baseline === null) saver.markUnsaved()
            else saver.markSaved(baseline)
        }
        saver.update(value)
    }, [saver, value, enabled])

    useEffect(() => {
        if (!enabled || !flushOnHide) return
        const onHide = () => void saver.flush()
        const onVisibilityChange = () => {
            if (document.visibilityState === "hidden") onHide()
        }
        document.addEventListener("visibilitychange", onVisibilityChange)
        window.addEventListener("pagehide", onHide)
        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange)
            window.removeEventListener("pagehide", onHide)
            // Leaving the page in-app (or turning saving off) shouldn't drop the last edit.
            void saver.flush()
        }
    }, [saver, enabled, flushOnHide])

    useEffect(() => {
        if (!enabled || !warnOnUnload) return
        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            if (!saver.getSnapshot().isDirty) return
            void saver.flush()
            event.preventDefault()
        }
        window.addEventListener("beforeunload", onBeforeUnload)
        return () => window.removeEventListener("beforeunload", onBeforeUnload)
    }, [saver, enabled, warnOnUnload])

    const flush = useCallback(() => saver.flush(), [saver])
    const cancel = useCallback(() => saver.cancel(), [saver])

    return { ...snapshot, flush, cancel }
}
