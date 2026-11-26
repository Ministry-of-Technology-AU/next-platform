import { after } from "next/server"
import { jsonError, jsonOk } from "@/lib/forms/api-helpers"
import type { DrawResult } from "@/app/platform/games/secret-santa/types"
import { loadPoolContext, requireHost } from "@/app/platform/games/secret-santa/_server/access"
import { runDraw, sendDrawEmails } from "@/app/platform/games/secret-santa/_server/draw"
import { HOUR, limit } from "@/app/platform/games/secret-santa/_server/http"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ uid: string }> }

/**
 * Host draws names. The response never contains a pair. Emails go out after the response
 * (`after()`), one at a time, and each result is recorded on the participant.
 */
export async function POST(_request: Request, { params }: Params) {
    try {
        const { uid } = await params
        const context = await loadPoolContext(uid)
        if (!context.ok) return context.response
        const denied = requireHost(context.value)
        if (denied) return denied

        const limited = limit(`draw:${uid}`, 5, HOUR)
        if (limited) return limited

        const { pool } = context.value
        const outcome = await runDraw(pool)
        if (!outcome.ok) return jsonError(outcome.error, outcome.status)

        after(async () => {
            try {
                const { sent, failed } = await sendDrawEmails(pool)
                platform.log(`Secret Santa: draw emails for pool ${pool.id}: ${sent} sent, ${failed} failed`)
            } catch (err) {
                platform.error("Secret Santa: sending draw emails failed:", err)
            }
        })

        const result: DrawResult = { status: "drawn", participantCount: outcome.participantCount }
        return jsonOk(result)
    } catch (err) {
        platform.error("POST /api/platform/games/secret-santa/[uid]/draw failed:", err)
        return jsonError("The draw didn't run. Nothing was sent. Try again in a minute.", 500)
    }
}
