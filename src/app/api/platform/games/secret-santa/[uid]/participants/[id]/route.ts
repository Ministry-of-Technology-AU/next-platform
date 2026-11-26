import { jsonError, jsonOk } from "@/lib/forms/api-helpers"
import { loadPoolContext, requireHost, requireOpen } from "@/app/platform/games/secret-santa/_server/access"
import { removeParticipant } from "@/app/platform/games/secret-santa/_server/participants"
import { updatePool } from "@/app/platform/games/secret-santa/_server/pools"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ uid: string; id: string }> }

/** Host removes someone before the draw. Their exclusion pairs go with them. */
export async function DELETE(_request: Request, { params }: Params) {
    try {
        const { uid, id } = await params
        const context = await loadPoolContext(uid)
        if (!context.ok) return context.response
        const denied = requireHost(context.value)
        if (denied) return denied
        const closed = requireOpen(context.value)
        if (closed) return closed

        const { pool } = context.value
        const target = pool.participants.find((p) => String(p.id) === id)
        if (!target) return jsonError("That person isn't in this Secret Santa.", 404)

        await removeParticipant(target)
        const exclusions = pool.exclusions.filter(([a, b]) => a !== target.id && b !== target.id)
        if (exclusions.length !== pool.exclusions.length) await updatePool(pool, { exclusions })
        return jsonOk({ removed: true })
    } catch (err) {
        platform.error("DELETE /api/platform/games/secret-santa/[uid]/participants/[id] failed:", err)
        return jsonError("That person wasn't removed. Try again in a minute.", 500)
    }
}
