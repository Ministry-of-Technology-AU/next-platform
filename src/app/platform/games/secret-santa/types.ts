/**
 * Types shared by the Secret Santa pages and the routes under
 * `src/app/api/platform/games/secret-santa/`. Contract: PRD.md §6.
 */

export type PoolStatus = "open" | "drawing" | "drawn"
export type ParticipantSource = "link" | "host"
export type EmailStatus = "none" | "sent" | "failed"
export type ViewerRole = "outsider" | "participant" | "host"

/** An unordered pair of participant ids who must not draw each other. */
export type ExclusionPair = [number, number]

/** One row on the landing page. */
export interface PoolSummary {
    uid: string
    title: string
    budget: number
    eventDate: string
    status: PoolStatus
    participantCount: number
    isHost: boolean
}

/** What every participant sees about the others: a name, never an email. */
export interface ParticipantPublic {
    id: number
    name: string
    isMe: boolean
}

/** What only the host sees about each participant. Never the giftee. */
export interface ParticipantHostView extends ParticipantPublic {
    email: string
    source: ParticipantSource
    emailStatus: EmailStatus
}

/** The caller's own row. */
export interface ParticipantSelf {
    id: number
    name: string
    wishlist: string
    revealed: boolean
}

/** The person the caller drew. Only ever sent to the giver. */
export interface Giftee {
    name: string
    wishlist: string
}

export interface HostControls {
    participants: ParticipantHostView[]
    exclusions: ExclusionPair[]
    hostPlays: boolean
}

/** The pool page's data, shaped by who is looking (PRD §2). */
export interface PoolView {
    uid: string
    title: string
    budget: number
    eventDate: string
    hostNote: string
    status: PoolStatus
    drawnAt: string | null
    hostName: string
    participantCount: number
    viewerRole: ViewerRole
    me: ParticipantSelf | null
    /** Empty for outsiders. */
    participants: ParticipantPublic[]
    /** Only for the host. */
    host: HostControls | null
    /** Only after the draw, only the caller's own. */
    giftee: Giftee | null
}

export interface ApiSuccess<T> {
    success: true
    data: T
}

export interface ApiFailure {
    success: false
    error: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export interface AddParticipantsResult {
    added: string[]
    skipped: string[]
    rejected: string[]
    warnings: string[]
}

export interface DrawResult {
    status: "drawn"
    participantCount: number
}

export interface ResendResult {
    resent: number
    failed: number
}
