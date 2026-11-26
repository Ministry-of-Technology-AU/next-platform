import "server-only"

import { v4 as uuidv4 } from "uuid"
import { strapiDelete, strapiGet, strapiPost, strapiPut, type StrapiFilters } from "@/lib/apis/strapi"
import type { ExclusionPair, PoolStatus, PoolSummary } from "../types"
import {
    PARTICIPANTS,
    POOLS,
    entriesOf,
    flatten,
    toParticipantDetail,
    toPoolRecord,
    type ParticipantDetail,
    type PoolRecord,
} from "./records"

/**
 * Strapi access for `secret-santa-pool`. Everything here is per-user or per-pool and is
 * never cached on the server (caching.md §2: the responses name the viewer).
 */

const POOL_FIELDS = ["uid", "title", "budget", "event_date", "host_note", "status", "drawn_at", "exclusions"]
const PARTICIPANT_FIELDS = ["name", "email", "source", "email_status", "revealed_at"]

const POOL_POPULATE = {
    host: { fields: ["username", "email"] },
    participants: { fields: PARTICIPANT_FIELDS, populate: { user: { fields: ["id"] } } },
}

/** The full pool by its share uid, or null. Callers shape it per viewer before it leaves the server. */
export async function getPoolRecord(uid: string): Promise<PoolRecord | null> {
    const response: unknown = await strapiGet(POOLS, {
        filters: { uid: { $eq: uid } },
        fields: POOL_FIELDS,
        populate: POOL_POPULATE,
        pagination: { pageSize: 1 },
    })
    const raw = entriesOf(response)[0]
    return raw ? toPoolRecord(raw) : null
}

/** Pools the user hosts or is in, soonest event first. */
export async function listMyPools(email: string, userId: number | null): Promise<PoolSummary[]> {
    const or: StrapiFilters[] = [{ participants: { email: { $eq: email } } }]
    if (userId !== null) or.push({ host: { id: { $eq: userId } } })
    const response: unknown = await strapiGet(POOLS, {
        filters: { $or: or },
        fields: ["uid", "title", "budget", "event_date", "status"],
        populate: { host: { fields: ["id"] }, participants: { fields: ["email"] } },
        sort: ["event_date:asc"],
        pagination: { pageSize: 50 },
    })
    return entriesOf(response).flatMap((raw) => {
        const pool = toPoolRecord(raw)
        if (!pool) return []
        return [
            {
                uid: pool.uid,
                title: pool.title,
                budget: pool.budget,
                eventDate: pool.eventDate,
                status: pool.status,
                participantCount: pool.participants.length,
                isHost: userId !== null && pool.hostId === userId,
            },
        ]
    })
}

export interface NewPool {
    title: string
    budget: number
    eventDate: string
    hostNote: string
}

/** Creates a pool owned by `hostId` and returns its record id and share uid. */
export async function createPool(hostId: number, input: NewPool): Promise<{ id: number; uid: string }> {
    const uid = uuidv4()
    const response: unknown = await strapiPost(POOLS, {
        data: {
            uid,
            title: input.title,
            budget: input.budget,
            event_date: input.eventDate,
            host_note: input.hostNote,
            status: "open",
            exclusions: [],
            host: hostId,
        },
    })
    const created = flatten((response as { data?: unknown } | null)?.data)
    if (!created || typeof created.id !== "number") throw new Error("Strapi did not return the new pool")
    return { id: created.id, uid }
}

export interface PoolPatch {
    title?: string
    budget?: number
    event_date?: string
    host_note?: string
    status?: PoolStatus
    drawn_at?: string | null
    exclusions?: ExclusionPair[]
}

export async function updatePool(pool: PoolRecord, patch: PoolPatch): Promise<void> {
    await strapiPut(`${POOLS}/${pool.ref}`, { data: { ...patch } })
}

/** Deletes the pool and every participant row in it. */
export async function deletePool(pool: PoolRecord): Promise<void> {
    await Promise.all(pool.participants.map((p) => strapiDelete(`${PARTICIPANTS}/${p.ref}`)))
    await strapiDelete(`${POOLS}/${pool.ref}`)
}

/** The caller's own wish list and, after the draw, their giftee. */
export async function getParticipantDetail(ref: string): Promise<ParticipantDetail> {
    const response: unknown = await strapiGet(`${PARTICIPANTS}/${ref}`, {
        fields: ["wishlist"],
        populate: { giftee: { fields: ["name", "email", "wishlist"] } },
    })
    const raw = entriesOf(response)[0]
    return raw ? toParticipantDetail(raw) : { wishlist: "", giftee: null }
}
