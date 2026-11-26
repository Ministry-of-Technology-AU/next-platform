import { jsonError, jsonOk } from "@/lib/forms/api-helpers"
import { ExclusionsSchema } from "@/app/platform/games/secret-santa/schema"
import { cleanExclusions } from "@/app/platform/games/secret-santa/utils"
import { loadPoolContext, requireHost, requireOpen } from "@/app/platform/games/secret-santa/_server/access"
import { readBody } from "@/app/platform/games/secret-santa/_server/http"
import { updatePool } from "@/app/platform/games/secret-santa/_server/pools"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ uid: string }> }

/** Host replaces the exclusion pairs. Ids outside the pool are dropped. */
export async function PUT(request: Request, { params }: Params) {
    try {
        const { uid } = await params
        const context = await loadPoolContext(uid)
        if (!context.ok) return context.response
        const denied = requireHost(context.value)
        if (denied) return denied
        const closed = requireOpen(context.value)
        if (closed) return closed

        const body = await readBody(request, ExclusionsSchema)
        if (!body.ok) return body.response

        const { pool } = context.value
        const pairs = cleanExclusions(
            body.value.pairs,
            pool.participants.map((p) => p.id),
        )
        await updatePool(pool, { exclusions: pairs })
        return jsonOk({ pairs })
    } catch (err) {
        platform.error("PUT /api/platform/games/secret-santa/[uid]/exclusions failed:", err)
        return jsonError("The pairs didn't save. Try again in a minute.", 500)
    }
}
