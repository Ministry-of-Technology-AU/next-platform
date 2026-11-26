import "server-only"

import { z } from "zod"
import type { EmailStatus, ExclusionPair, ParticipantSource, PoolStatus } from "../types"
import { fallbackName } from "../utils"

/**
 * Turns Strapi entries into flat records. Handles v4 (`{ id, attributes }`, relations as
 * `{ data }`) and v5 (flat) so the rest of the tool never sees either shape.
 */

type Raw = Record<string, unknown>

export const POOLS = "/secret-santa-pools"
export const PARTICIPANTS = "/secret-santa-participants"

function isObject(value: unknown): value is Raw {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function flatten(entry: unknown): Raw | null {
    if (!isObject(entry)) return null
    const attributes = isObject(entry.attributes) ? entry.attributes : entry
    return { ...attributes, id: entry.id, documentId: entry.documentId ?? attributes.documentId }
}

function relationOne(raw: unknown): Raw | null {
    if (isObject(raw) && "data" in raw) return flatten(raw.data)
    return flatten(raw)
}

function relationMany(raw: unknown): Raw[] {
    const node = isObject(raw) && "data" in raw ? raw.data : raw
    if (!Array.isArray(node)) return []
    return node.flatMap((item): Raw[] => {
        const flat = flatten(item)
        return flat ? [flat] : []
    })
}

/** List responses: `{ data: [...] }` from collection endpoints, a bare array from `/users`. */
export function entriesOf(response: unknown): Raw[] {
    const node = isObject(response) && "data" in response ? response.data : response
    if (Array.isArray(node)) return relationMany(node)
    const single = flatten(node)
    return single ? [single] : []
}

/** The path segment Strapi addresses an entry by: documentId in v5, id in v4. */
function refOf(raw: Raw): string | null {
    if (typeof raw.documentId === "string" && raw.documentId.length > 0) return raw.documentId
    if (typeof raw.id === "number") return String(raw.id)
    return null
}

export interface ParticipantRecord {
    id: number
    ref: string
    name: string
    email: string
    source: ParticipantSource
    emailStatus: EmailStatus
    revealedAt: string | null
    userId: number | null
}

export interface PoolRecord {
    id: number
    ref: string
    uid: string
    title: string
    budget: number
    eventDate: string
    hostNote: string
    status: PoolStatus
    drawnAt: string | null
    exclusions: ExclusionPair[]
    hostId: number | null
    hostName: string
    hostEmail: string
    participants: ParticipantRecord[]
}

const ParticipantFields = z.object({
    id: z.number(),
    name: z.string().nullable().catch(null),
    email: z.string().catch(""),
    source: z.enum(["link", "host"]).catch("link"),
    email_status: z.enum(["none", "sent", "failed"]).catch("none"),
    revealed_at: z.string().nullable().catch(null),
})

export function toParticipantRecord(raw: Raw): ParticipantRecord | null {
    const parsed = ParticipantFields.safeParse(raw)
    const ref = refOf(raw)
    if (!parsed.success || ref === null || parsed.data.email === "") return null
    const email = parsed.data.email.toLowerCase()
    const user = relationOne(raw.user)
    return {
        id: parsed.data.id,
        ref,
        name: parsed.data.name?.trim() || fallbackName(email),
        email,
        source: parsed.data.source,
        emailStatus: parsed.data.email_status,
        revealedAt: parsed.data.revealed_at,
        userId: typeof user?.id === "number" ? user.id : null,
    }
}

const PairSchema = z.tuple([z.number().int(), z.number().int()])

const PoolFields = z.object({
    id: z.number(),
    uid: z.string(),
    title: z.string().catch("Secret Santa"),
    budget: z.coerce.number().catch(0),
    event_date: z.string().catch(""),
    host_note: z.string().nullable().catch(""),
    status: z.enum(["open", "drawing", "drawn"]).catch("open"),
    drawn_at: z.string().nullable().catch(null),
    exclusions: z
        .unknown()
        .transform((value): ExclusionPair[] => {
            if (!Array.isArray(value)) return []
            const pairs: ExclusionPair[] = []
            for (const pair of value) {
                const parsed = PairSchema.safeParse(pair)
                if (parsed.success) pairs.push(parsed.data)
            }
            return pairs
        }),
})

export function toPoolRecord(raw: Raw): PoolRecord | null {
    const parsed = PoolFields.safeParse(raw)
    const ref = refOf(raw)
    if (!parsed.success || ref === null) return null
    const host = relationOne(raw.host)
    const hostEmail = typeof host?.email === "string" ? host.email.toLowerCase() : ""
    const hostUsername = typeof host?.username === "string" ? host.username : ""
    return {
        id: parsed.data.id,
        ref,
        uid: parsed.data.uid,
        title: parsed.data.title,
        budget: parsed.data.budget,
        eventDate: parsed.data.event_date,
        hostNote: parsed.data.host_note ?? "",
        status: parsed.data.status,
        drawnAt: parsed.data.drawn_at,
        exclusions: parsed.data.exclusions,
        hostId: typeof host?.id === "number" ? host.id : null,
        hostName: hostUsername || (hostEmail ? fallbackName(hostEmail) : "The host"),
        hostEmail,
        participants: relationMany(raw.participants).flatMap((p) => toParticipantRecord(p) ?? []),
    }
}

/** Wish list and giftee for one participant. Read only for the caller's own row. */
export interface ParticipantDetail {
    wishlist: string
    giftee: { name: string; wishlist: string } | null
}

export function toParticipantDetail(raw: Raw): ParticipantDetail {
    const giftee = relationOne(raw.giftee)
    const gifteeEmail = typeof giftee?.email === "string" ? giftee.email : ""
    const gifteeName = typeof giftee?.name === "string" && giftee.name.trim() ? giftee.name.trim() : fallbackName(gifteeEmail)
    return {
        wishlist: typeof raw.wishlist === "string" ? raw.wishlist : "",
        giftee: giftee
            ? { name: gifteeName, wishlist: typeof giftee.wishlist === "string" ? giftee.wishlist : "" }
            : null,
    }
}
