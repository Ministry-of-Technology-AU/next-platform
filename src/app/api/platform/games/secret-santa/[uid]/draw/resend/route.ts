import { jsonError, jsonOk } from "@/lib/forms/api-helpers"
import type { ResendResult } from "@/app/platform/games/secret-santa/types"
import { loadPoolContext, requireHost } from "@/app/platform/games/secret-santa/_server/access"
import { sendDrawEmails } from "@/app/platform/games/secret-santa/_server/draw"
import { HOUR, limit } from "@/app/platform/games/secret-santa/_server/http"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ uid: string }> }

/** Host resends draw emails that failed. Only failed ones are sent again. */
export async function POST(_request: Request, { params }: Params) {
    try {
        const { uid } = await params
        const context = await loadPoolContext(uid)
        if (!context.ok) return context.response
        const denied = requireHost(context.value)
        if (denied) return denied

        const { pool } = context.value
        if (pool.status !== "drawn") return jsonError("Names haven't been drawn yet.", 409)
        if (!pool.participants.some((p) => p.emailStatus === "failed")) {
            const none: ResendResult = { resent: 0, failed: 0 }
            return jsonOk(none)
        }

        const limited = limit(`resend:${uid}`, 5, HOUR)
        if (limited) return limited

        const { sent, failed } = await sendDrawEmails(pool, true)
        const result: ResendResult = { resent: sent, failed }
        return jsonOk(result)
    } catch (err) {
        platform.error("POST /api/platform/games/secret-santa/[uid]/draw/resend failed:", err)
        return jsonError("The emails weren't resent. Try again in a minute.", 500)
    }
}
