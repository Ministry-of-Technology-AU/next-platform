import "server-only"

import { strapiGet } from "@/lib/apis/strapi"
import { LIMITS } from "../data"
import { cleanExclusions, drawPairs, isValidDraw } from "../utils"
import { sendDrawEmail } from "./emails"
import { updateParticipant } from "./participants"
import { updatePool } from "./pools"
import { PARTICIPANTS, entriesOf, toParticipantDetail, toParticipantRecord, type ParticipantRecord, type PoolRecord } from "./records"

/**
 * The draw (PRD §6). Strapi has no transactions, so `drawing` acts as a lock while giftees are
 * written, and any failed write puts the pool back to `open` with every giftee cleared.
 * Pairs are never logged and never returned.
 */

export type DrawOutcome =
    | { ok: true; participantCount: number }
    | { ok: false; status: 409 | 422 | 500; error: string }

/** Writes in small batches so one draw doesn't fire 100 requests at Strapi at once. */
async function inBatches<T>(items: readonly T[], size: number, run: (item: T) => Promise<void>): Promise<void> {
    for (let start = 0; start < items.length; start += size) {
        await Promise.all(items.slice(start, start + size).map(run))
    }
}

export async function runDraw(pool: PoolRecord): Promise<DrawOutcome> {
    if (pool.status !== "open") {
        return { ok: false, status: 409, error: "Names have already been drawn for this Secret Santa." }
    }
    const people = pool.participants
    if (people.length < LIMITS.minParticipants) {
        return { ok: false, status: 409, error: `You need at least ${LIMITS.minParticipants} people to draw names.` }
    }

    const ids = people.map((p) => p.id)
    const exclusions = cleanExclusions(pool.exclusions, ids)
    const pairs = drawPairs(ids, exclusions)
    if (!pairs || !isValidDraw(pairs, ids, exclusions)) {
        return {
            ok: false,
            status: 422,
            error: "No valid draw exists with these exclusions. Remove a pair and try again.",
        }
    }

    await updatePool(pool, { status: "drawing" })
    try {
        await inBatches(people, 10, async (participant) => {
            const giftee = pairs.get(participant.id)
            if (giftee === undefined) throw new Error("A participant has no giftee")
            await updateParticipant(participant, { giftee, email_status: "none" })
        })
        await updatePool(pool, { status: "drawn", drawn_at: new Date().toISOString() })
        return { ok: true, participantCount: people.length }
    } catch (err) {
        platform.error("Secret Santa: the draw failed while writing, rolling back:", err)
        await inBatches(people, 10, (participant) => updateParticipant(participant, { giftee: null })).catch(
            (rollbackErr: unknown) => platform.error("Secret Santa: rolling back giftees failed:", rollbackErr),
        )
        await updatePool(pool, { status: "open" }).catch((resetErr: unknown) =>
            platform.error("Secret Santa: reopening the pool failed:", resetErr),
        )
        return { ok: false, status: 500, error: "The draw didn't save. Nothing was sent. Try again in a minute." }
    }
}

interface DrawRow {
    participant: ParticipantRecord
    giftee: { name: string; wishlist: string } | null
}

/** Every participant with their giftee, read on the server only to build the emails. */
async function getDrawRows(pool: PoolRecord): Promise<DrawRow[]> {
    const response: unknown = await strapiGet(PARTICIPANTS, {
        filters: { pool: { id: { $eq: pool.id } } },
        fields: ["name", "email", "source", "email_status", "revealed_at"],
        populate: { giftee: { fields: ["name", "email", "wishlist"] } },
        pagination: { pageSize: LIMITS.maxParticipants },
    })
    return entriesOf(response).flatMap((raw) => {
        const participant = toParticipantRecord(raw)
        if (!participant) return []
        return [{ participant, giftee: toParticipantDetail(raw).giftee }]
    })
}

/**
 * Sends draw emails one at a time (Gmail SMTP) and records each result. `onlyFailed` is the
 * resend path. Runs after the response in `after()`, so it never blocks the host.
 */
export async function sendDrawEmails(pool: PoolRecord, onlyFailed = false): Promise<{ sent: number; failed: number }> {
    const rows = await getDrawRows(pool)
    let sent = 0
    let failed = 0
    for (const { participant, giftee } of rows) {
        if (onlyFailed && participant.emailStatus !== "failed") continue
        if (!giftee) continue
        try {
            await sendDrawEmail(pool, {
                to: participant.email,
                giverName: participant.name,
                gifteeName: giftee.name,
                gifteeWishlist: giftee.wishlist,
            })
            sent++
            await updateParticipant(participant, { email_status: "sent" })
        } catch (err) {
            failed++
            platform.error("Secret Santa: a draw email failed:", err)
            await updateParticipant(participant, { email_status: "failed" }).catch((statusErr: unknown) =>
                platform.error("Secret Santa: recording a failed email failed:", statusErr),
            )
        }
    }
    return { sent, failed }
}
