import { jsonError, jsonOk } from "@/lib/forms/api-helpers"
import { UpdateMeSchema } from "@/app/platform/games/secret-santa/schema"
import {
    loadPoolContext,
    requireOpen,
    requireParticipant,
} from "@/app/platform/games/secret-santa/_server/access"
import { cleanRichText, readBody } from "@/app/platform/games/secret-santa/_server/http"
import {
    removeParticipant,
    updateParticipant,
    type ParticipantPatch,
} from "@/app/platform/games/secret-santa/_server/participants"
import { updatePool } from "@/app/platform/games/secret-santa/_server/pools"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ uid: string }> }

/** The caller edits their own name or wish list, or records their first unwrap. */
export async function PATCH(request: Request, { params }: Params) {
    try {
        const { uid } = await params
        const context = await loadPoolContext(uid)
        if (!context.ok) return context.response
        const missing = requireParticipant(context.value)
        if (missing) return missing
        const { me, pool } = context.value
        if (!me) return jsonError("You aren't in this Secret Santa.", 404)

        const body = await readBody(request, UpdateMeSchema)
        if (!body.ok) return body.response

        const patch: ParticipantPatch = {}
        if (body.value.name !== undefined) {
            // Givers were emailed this name, so it stays fixed after the draw.
            if (pool.status !== "open") return jsonError("Names can't change after the draw.", 409)
            patch.name = body.value.name
        }
        if (body.value.wishlist !== undefined) {
            const wishlist = cleanRichText(body.value.wishlist)
            if (!wishlist.ok) return wishlist.response
            patch.wishlist = wishlist.value
        }
        if (body.value.revealed && pool.status === "drawn" && me.revealedAt === null) {
            patch.revealed_at = new Date().toISOString()
        }

        if (Object.keys(patch).length > 0) await updateParticipant(me, patch)
        return jsonOk({ updated: true })
    } catch (err) {
        platform.error("PATCH /api/platform/games/secret-santa/[uid]/me failed:", err)
        return jsonError("Your changes didn't save. Try again in a minute.", 500)
    }
}

/** The caller leaves before the draw. Their exclusion pairs go with them. */
export async function DELETE(_request: Request, { params }: Params) {
    try {
        const { uid } = await params
        const context = await loadPoolContext(uid)
        if (!context.ok) return context.response
        const missing = requireParticipant(context.value)
        if (missing) return missing
        const closed = requireOpen(context.value)
        if (closed) return closed
        const { me, pool } = context.value
        if (!me) return jsonError("You aren't in this Secret Santa.", 404)

        await removeParticipant(me)
        const exclusions = pool.exclusions.filter(([a, b]) => a !== me.id && b !== me.id)
        if (exclusions.length !== pool.exclusions.length) await updatePool(pool, { exclusions })
        return jsonOk({ left: true })
    } catch (err) {
        platform.error("DELETE /api/platform/games/secret-santa/[uid]/me failed:", err)
        return jsonError("You weren't removed. Try again in a minute.", 500)
    }
}
