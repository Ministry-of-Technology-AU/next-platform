import "server-only"

import { getAuthenticatedUser } from "@/lib/auth"
import type { PoolView } from "../types"
import { contextFor, type PoolContext } from "./access"
import { updateParticipant } from "./participants"
import { getParticipantDetail, getPoolRecord } from "./pools"

/**
 * Shapes a pool for the person looking at it (PRD §2). This is the only place pool data is
 * turned into a response, so the privacy rules live here: emails only for the host, and the
 * giftee only for the giver, never anyone else's.
 */
export async function buildPoolView(context: PoolContext): Promise<PoolView> {
    const { pool, role, me, user } = context
    const isMember = role !== "outsider"
    const detail = me ? await getParticipantDetail(me.ref) : null

    // A host-added person is linked to their account the first time they open the pool.
    if (me && me.userId === null && user.uid !== null) {
        updateParticipant(me, { user: user.uid }).catch((err: unknown) =>
            platform.warn("Secret Santa: linking a participant to their account failed:", err),
        )
    }

    return {
        uid: pool.uid,
        title: pool.title,
        budget: pool.budget,
        eventDate: pool.eventDate,
        hostNote: pool.hostNote,
        status: pool.status,
        drawnAt: pool.drawnAt,
        hostName: pool.hostName,
        participantCount: pool.participants.length,
        viewerRole: role,
        me: me
            ? { id: me.id, name: me.name, wishlist: detail?.wishlist ?? "", revealed: me.revealedAt !== null }
            : null,
        participants: isMember
            ? pool.participants.map((p) => ({ id: p.id, name: p.name, isMe: p.id === me?.id }))
            : [],
        host:
            role === "host"
                ? {
                      participants: pool.participants.map((p) => ({
                          id: p.id,
                          name: p.name,
                          isMe: p.id === me?.id,
                          email: p.email,
                          source: p.source,
                          emailStatus: p.emailStatus,
                      })),
                      exclusions: pool.exclusions,
                      hostPlays: me !== null,
                  }
                : null,
        giftee: pool.status === "drawn" && detail?.giftee ? detail.giftee : null,
    }
}

export type LoadedPoolView =
    | { kind: "ok"; view: PoolView }
    | { kind: "not-found" }
    | { kind: "signed-out" }
    | { kind: "error"; message: string }

/** For `[uid]/page.tsx`, which calls this directly instead of fetching our own route (caching.md §8 rule 7). */
export async function loadPoolView(uid: string): Promise<LoadedPoolView> {
    try {
        const user = await getAuthenticatedUser()
        if (!user) return { kind: "signed-out" }
        const pool = await getPoolRecord(uid)
        if (!pool) return { kind: "not-found" }
        return { kind: "ok", view: await buildPoolView(contextFor(pool, user)) }
    } catch (err) {
        platform.error("Secret Santa: loading a pool failed:", err)
        return { kind: "error", message: "This Secret Santa didn't load. Reload the page in a minute." }
    }
}
