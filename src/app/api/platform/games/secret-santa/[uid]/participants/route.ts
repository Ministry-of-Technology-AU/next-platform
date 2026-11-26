import { jsonError, jsonOk } from "@/lib/forms/api-helpers"
import { getUserIdByEmail } from "@/lib/userid"
import { LIMITS } from "@/app/platform/games/secret-santa/data"
import { AddParticipantsSchema, EmailSchema } from "@/app/platform/games/secret-santa/schema"
import type { AddParticipantsResult } from "@/app/platform/games/secret-santa/types"
import { fallbackName } from "@/app/platform/games/secret-santa/utils"
import { loadPoolContext, requireHost, requireOpen } from "@/app/platform/games/secret-santa/_server/access"
import { sendInviteEmail } from "@/app/platform/games/secret-santa/_server/emails"
import { HOUR, isAllowedEmail, limit, readBody } from "@/app/platform/games/secret-santa/_server/http"
import { addParticipant } from "@/app/platform/games/secret-santa/_server/participants"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ uid: string }> }

/**
 * Host adds people by email. They are in the pool at once and get an invite email.
 * Mail route: also counted in `MAIL_ROUTES` (src/lib/rate-limit.ts).
 */
export async function POST(request: Request, { params }: Params) {
    try {
        const { uid } = await params
        const context = await loadPoolContext(uid)
        if (!context.ok) return context.response
        const denied = requireHost(context.value)
        if (denied) return denied
        const closed = requireOpen(context.value)
        if (closed) return closed
        const { pool, user } = context.value

        const body = await readBody(request, AddParticipantsSchema)
        if (!body.ok) return body.response

        const existing = new Set(pool.participants.map((p) => p.email))
        const result: AddParticipantsResult = { added: [], skipped: [], rejected: [], warnings: [] }
        const toAdd: string[] = []
        for (const email of new Set(body.value.emails)) {
            if (!EmailSchema.safeParse(email).success || !isAllowedEmail(email)) result.rejected.push(email)
            else if (existing.has(email)) result.skipped.push(email)
            else toAdd.push(email)
        }

        const room = LIMITS.maxParticipants - pool.participants.length
        if (toAdd.length > room) {
            return jsonError(`This Secret Santa can hold ${room} more ${room === 1 ? "person" : "people"}.`, 409)
        }

        // 100 invite emails per host per hour (PRD §6).
        if (toAdd.length > 0) {
            const limited = limit(`invite:${user.email}`, 100, HOUR)
            if (limited) return limited
        }

        for (const email of toAdd) {
            await addParticipant(pool.id, {
                email,
                name: fallbackName(email),
                wishlist: "",
                source: "host",
                userId: await getUserIdByEmail(email),
            })
            result.added.push(email)
            try {
                await sendInviteEmail(pool, email)
            } catch (err) {
                platform.error("Secret Santa: an invite email failed:", err)
                result.warnings.push(`${email} was added, but the invite email didn't send.`)
            }
        }

        return jsonOk(result, result.added.length > 0 ? 201 : 200)
    } catch (err) {
        platform.error("POST /api/platform/games/secret-santa/[uid]/participants failed:", err)
        return jsonError("People weren't added. Try again in a minute.", 500)
    }
}
