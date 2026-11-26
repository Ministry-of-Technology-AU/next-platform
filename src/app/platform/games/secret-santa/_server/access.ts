import "server-only"

import type { NextResponse } from "next/server"
import { getAuthenticatedUser, type AuthenticatedUser } from "@/lib/auth"
import { jsonError } from "@/lib/forms/api-helpers"
import type { ViewerRole } from "../types"
import { getPoolRecord } from "./pools"
import type { ParticipantRecord, PoolRecord } from "./records"

/**
 * Record-level access for Secret Santa (auth.md §5.4). Every route calls `loadPoolContext`, then
 * the guard it needs. The pool is read fresh from Strapi on every call, so host and status
 * checks never rely on stale session claims.
 */

export interface PoolContext {
    user: AuthenticatedUser
    pool: PoolRecord
    role: ViewerRole
    /** The caller's own participant row, if they are in the pool. */
    me: ParticipantRecord | null
}

export type Guarded<T> = { ok: true; value: T } | { ok: false; response: NextResponse }

export function isPoolHost(pool: PoolRecord, user: AuthenticatedUser): boolean {
    if (user.uid !== null && pool.hostId !== null) return pool.hostId === user.uid
    return pool.hostEmail !== "" && pool.hostEmail === user.email.toLowerCase()
}

export function findMe(pool: PoolRecord, user: AuthenticatedUser): ParticipantRecord | null {
    const email = user.email.toLowerCase()
    return pool.participants.find((p) => p.email === email) ?? null
}

export function contextFor(pool: PoolRecord, user: AuthenticatedUser): PoolContext {
    const me = findMe(pool, user)
    const role: ViewerRole = isPoolHost(pool, user) ? "host" : me ? "participant" : "outsider"
    return { user, pool, role, me }
}

/** Signed-in caller plus the pool behind `uid`. 401 without a session, 404 for an unknown pool. */
export async function loadPoolContext(uid: string): Promise<Guarded<PoolContext>> {
    const user = await getAuthenticatedUser()
    if (!user) return { ok: false, response: jsonError("Sign in to continue.", 401) }
    const pool = await getPoolRecord(uid)
    if (!pool) return { ok: false, response: jsonError("This Secret Santa doesn't exist.", 404) }
    return { ok: true, value: contextFor(pool, user) }
}

/** Host-only routes answer 404 to everyone else, so they don't confirm what exists (auth.md §6). */
export function requireHost(context: PoolContext): NextResponse | null {
    return context.role === "host" ? null : jsonError("This Secret Santa doesn't exist.", 404)
}

export function requireParticipant(context: PoolContext): NextResponse | null {
    return context.me ? null : jsonError("You aren't in this Secret Santa.", 404)
}

export function requireOpen(context: PoolContext): NextResponse | null {
    if (context.pool.status === "open") return null
    return jsonError("Names have already been drawn, so this Secret Santa is locked.", 409)
}
