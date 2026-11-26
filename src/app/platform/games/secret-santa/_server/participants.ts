import "server-only"

import { strapiDelete, strapiPost, strapiPut } from "@/lib/apis/strapi"
import type { EmailStatus, ParticipantSource } from "../types"
import { PARTICIPANTS, flatten, type ParticipantRecord } from "./records"

/** Strapi access for `secret-santa-participant`. */

export interface NewParticipant {
    email: string
    name: string
    wishlist: string
    source: ParticipantSource
    userId: number | null
}

export async function addParticipant(poolId: number, input: NewParticipant): Promise<number> {
    const response: unknown = await strapiPost(PARTICIPANTS, {
        data: {
            pool: poolId,
            email: input.email.toLowerCase(),
            name: input.name,
            wishlist: input.wishlist,
            source: input.source,
            email_status: "none",
            ...(input.userId !== null ? { user: input.userId } : {}),
        },
    })
    const created = flatten((response as { data?: unknown } | null)?.data)
    if (!created || typeof created.id !== "number") throw new Error("Strapi did not return the new participant")
    return created.id
}

export interface ParticipantPatch {
    name?: string
    wishlist?: string
    revealed_at?: string
    email_status?: EmailStatus
    giftee?: number | null
    user?: number
}

export async function updateParticipant(participant: ParticipantRecord, patch: ParticipantPatch): Promise<void> {
    await strapiPut(`${PARTICIPANTS}/${participant.ref}`, { data: { ...patch } })
}

export async function removeParticipant(participant: ParticipantRecord): Promise<void> {
    await strapiDelete(`${PARTICIPANTS}/${participant.ref}`)
}
