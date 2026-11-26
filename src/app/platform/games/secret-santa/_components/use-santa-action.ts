"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { haptic } from "@/lib/haptics"
import { santaRequest } from "../api"

type Method = "POST" | "PATCH" | "PUT" | "DELETE"

interface RunOptions {
    /** Toast on success. Omit for silent actions. */
    success?: string
    /** Re-render the server page afterwards. Defaults to true. */
    refresh?: boolean
}

/**
 * Runs one Secret Santa action for the pool at `uid`: request, haptic, toast, refresh.
 * `busy` names the action in flight so its button can show progress.
 */
export function useSantaAction(uid: string) {
    const router = useRouter()
    const [busy, setBusy] = useState<string | null>(null)

    const run = useCallback(
        async <T,>(key: string, path: string, method: Method, body?: unknown, options: RunOptions = {}): Promise<T | null> => {
            setBusy(key)
            const response = await santaRequest<T>(`/${uid}${path}`, method, body)
            setBusy(null)
            if (!response.success) {
                void haptic.error()
                toast.error(response.error)
                return null
            }
            void haptic.confirm()
            if (options.success) toast.success(options.success)
            if (options.refresh !== false) router.refresh()
            return response.data
        },
        [router, uid],
    )

    return { busy, run }
}
