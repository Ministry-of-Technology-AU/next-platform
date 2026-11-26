import { withCacheControl } from "@/lib/cache/headers"
import { jsonError, jsonOk } from "@/lib/forms/api-helpers"
import { UpdatePoolSchema } from "@/app/platform/games/secret-santa/schema"
import { loadPoolContext, requireHost } from "@/app/platform/games/secret-santa/_server/access"
import { cleanRichText, readBody } from "@/app/platform/games/secret-santa/_server/http"
import { deletePool, updatePool, type PoolPatch } from "@/app/platform/games/secret-santa/_server/pools"
import { buildPoolView } from "@/app/platform/games/secret-santa/_server/view"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ uid: string }> }

/** The pool, shaped for the caller (PRD §2). */
export async function GET(_request: Request, { params }: Params) {
    try {
        const { uid } = await params
        const context = await loadPoolContext(uid)
        if (!context.ok) return context.response
        return withCacheControl(jsonOk(await buildPoolView(context.value)), "private")
    } catch (err) {
        platform.error("GET /api/platform/games/secret-santa/[uid] failed:", err)
        return jsonError("This Secret Santa didn't load. Try again in a minute.", 500)
    }
}

/** Host edits title, budget, date or note. Allowed after the draw too. */
export async function PATCH(request: Request, { params }: Params) {
    try {
        const { uid } = await params
        const context = await loadPoolContext(uid)
        if (!context.ok) return context.response
        const denied = requireHost(context.value)
        if (denied) return denied

        const body = await readBody(request, UpdatePoolSchema)
        if (!body.ok) return body.response

        const patch: PoolPatch = {}
        if (body.value.title !== undefined) patch.title = body.value.title
        if (body.value.budget !== undefined) patch.budget = body.value.budget
        if (body.value.eventDate !== undefined) patch.event_date = body.value.eventDate
        if (body.value.hostNote !== undefined) {
            const note = cleanRichText(body.value.hostNote)
            if (!note.ok) return note.response
            patch.host_note = note.value
        }

        await updatePool(context.value.pool, patch)
        return jsonOk({ updated: true })
    } catch (err) {
        platform.error("PATCH /api/platform/games/secret-santa/[uid] failed:", err)
        return jsonError("Your changes didn't save. Try again in a minute.", 500)
    }
}

/** Host deletes the pool and everyone in it. Nobody is emailed. */
export async function DELETE(_request: Request, { params }: Params) {
    try {
        const { uid } = await params
        const context = await loadPoolContext(uid)
        if (!context.ok) return context.response
        const denied = requireHost(context.value)
        if (denied) return denied

        await deletePool(context.value.pool)
        return jsonOk({ deleted: true })
    } catch (err) {
        platform.error("DELETE /api/platform/games/secret-santa/[uid] failed:", err)
        return jsonError("The Secret Santa wasn't deleted. Try again in a minute.", 500)
    }
}
