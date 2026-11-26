import { getAuthenticatedUser } from "@/lib/auth"
import { withCacheControl } from "@/lib/cache/headers"
import { jsonError, jsonOk } from "@/lib/forms/api-helpers"
import { CreatePoolSchema } from "@/app/platform/games/secret-santa/schema"
import { fallbackName } from "@/app/platform/games/secret-santa/utils"
import { HOUR, cleanRichText, limit, readBody } from "@/app/platform/games/secret-santa/_server/http"
import { addParticipant } from "@/app/platform/games/secret-santa/_server/participants"
import { createPool, listMyPools } from "@/app/platform/games/secret-santa/_server/pools"

export const dynamic = "force-dynamic"

/** Pools the caller hosts or is in. Per-user, so `private` and never cached on the server. */
export async function GET() {
    try {
        const user = await getAuthenticatedUser()
        if (!user) return jsonError("Sign in to continue.", 401)
        const pools = await listMyPools(user.email.toLowerCase(), user.uid)
        return withCacheControl(jsonOk(pools), "private")
    } catch (err) {
        platform.error("GET /api/platform/games/secret-santa failed:", err)
        return jsonError("Your Secret Santas didn't load. Try again in a minute.", 500)
    }
}

/** Creates a pool. The host joins it too unless `hostPlays` is false. */
export async function POST(request: Request) {
    try {
        const user = await getAuthenticatedUser()
        if (!user) return jsonError("Sign in to continue.", 401)
        if (user.uid === null) return jsonError("Your platform account isn't set up yet. Sign out and in again.", 403)

        const limited = limit(`create:${user.email}`, 10, HOUR)
        if (limited) return limited

        const body = await readBody(request, CreatePoolSchema)
        if (!body.ok) return body.response
        const note = cleanRichText(body.value.hostNote)
        if (!note.ok) return note.response

        const { id, uid } = await createPool(user.uid, {
            title: body.value.title,
            budget: body.value.budget,
            eventDate: body.value.eventDate,
            hostNote: note.value,
        })

        if (body.value.hostPlays) {
            const email = user.email.toLowerCase()
            await addParticipant(id, {
                email,
                name: body.value.hostName ?? fallbackName(email),
                wishlist: "",
                source: "link",
                userId: user.uid,
            })
        }

        return jsonOk({ uid }, 201)
    } catch (err) {
        platform.error("POST /api/platform/games/secret-santa failed:", err)
        return jsonError("The Secret Santa wasn't created. Try again in a minute.", 500)
    }
}
