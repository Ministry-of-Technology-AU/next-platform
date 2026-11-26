import { jsonError, jsonOk } from "@/lib/forms/api-helpers"
import { LIMITS } from "@/app/platform/games/secret-santa/data"
import { JoinSchema } from "@/app/platform/games/secret-santa/schema"
import { loadPoolContext, requireOpen } from "@/app/platform/games/secret-santa/_server/access"
import { HOUR, cleanRichText, limit, readBody } from "@/app/platform/games/secret-santa/_server/http"
import { addParticipant } from "@/app/platform/games/secret-santa/_server/participants"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ uid: string }> }

/** The caller joins through the share link. Joining twice is a no-op. */
export async function POST(request: Request, { params }: Params) {
    try {
        const { uid } = await params
        const context = await loadPoolContext(uid)
        if (!context.ok) return context.response
        const { pool, me, user } = context.value

        if (me) return jsonOk({ id: me.id, joined: false })
        const closed = requireOpen(context.value)
        if (closed) return closed
        if (pool.participants.length >= LIMITS.maxParticipants) {
            return jsonError(`This Secret Santa is full (${LIMITS.maxParticipants} people).`, 409)
        }

        const limited = limit(`join:${user.email}`, 30, HOUR)
        if (limited) return limited

        const body = await readBody(request, JoinSchema)
        if (!body.ok) return body.response
        const wishlist = cleanRichText(body.value.wishlist)
        if (!wishlist.ok) return wishlist.response

        const id = await addParticipant(pool.id, {
            email: user.email.toLowerCase(),
            name: body.value.name,
            wishlist: wishlist.value,
            source: "link",
            userId: user.uid,
        })
        return jsonOk({ id, joined: true }, 201)
    } catch (err) {
        platform.error("POST /api/platform/games/secret-santa/[uid]/join failed:", err)
        return jsonError("You weren't added. Try again in a minute.", 500)
    }
}
