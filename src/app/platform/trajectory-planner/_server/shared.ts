import "server-only"

import { revalidateTag } from "next/cache"
import { z } from "zod"
import { strapiDelete, strapiGet, strapiPost } from "@/lib/apis/strapi"
import { sharedCache } from "@/lib/cache/shared"
import { CACHE_TAGS } from "@/lib/cache/tags"
import { semesterLoad } from "../utils"
import { SharedSemestersSchema } from "../schema"
import type { SharedSemester, SharedTrajectory } from "../types"

/**
 * Strapi access for the shared-trajectory repository (`shared-trajectories`).
 * One trajectory per student. Grades are stripped before anything is stored (see the schema).
 */

const FIELDS = ["title", "description", "semesters", "total_credits", "createdAt"]
const AUTHOR = { user: { fields: ["username", "batch"] } }

type StrapiEntry = { id?: number; documentId?: string; attributes?: StrapiEntry; [key: string]: unknown }

const EntrySchema = z.object({
    title: z.string().catch("Untitled trajectory"),
    description: z.string().nullable().catch(""),
    semesters: z.array(z.unknown()).catch([]),
    total_credits: z.coerce.number().catch(0),
    createdAt: z.string().nullable().catch(null),
    user: z
        .unknown()
        .transform((raw) => {
            // v4: { data: { attributes } }, v5: flat.
            const node = (raw as { data?: { attributes?: unknown } } | null)?.data?.attributes ?? raw
            const author = z.object({ username: z.string().nullable().catch(null), batch: z.string().nullable().catch(null) }).safeParse(node)
            return author.success ? author.data : { username: null, batch: null }
        }),
})

function toSharedTrajectory(entry: StrapiEntry): SharedTrajectory | null {
    const parsed = EntrySchema.safeParse(entry.attributes ?? entry)
    if (!parsed.success || typeof entry.id !== "number") return null
    const { title, description, semesters, total_credits, createdAt, user } = parsed.data
    // Stored semesters went through the share schema; re-validate in case Strapi was edited by hand.
    const clean = SharedSemestersSchema.safeParse(semesters)
    return {
        id: entry.id,
        title,
        description: description ?? "",
        semesters: clean.success ? clean.data : [],
        totalCredits: total_credits,
        authorName: user.username || "Anonymous",
        batch: user.batch ?? "",
        createdAt,
    }
}

const entriesOf = (response: unknown): StrapiEntry[] => {
    const data = (response as { data?: unknown } | null)?.data
    return Array.isArray(data) ? (data as StrapiEntry[]) : []
}

/**
 * L2, key cardinality 1 (no arguments), up to 25 entries of a few KB each. The list is the same for every viewer and holds no
 * grades. Cleared by every share and delete below, and by the Strapi webhook for
 * `shared-trajectory`. Improves speed and bill: the repository dialog no longer hits Strapi
 * each time a student opens it.
 */
export const listSharedTrajectories = sharedCache(
    async (): Promise<SharedTrajectory[]> => {
        const response: unknown = await strapiGet("/shared-trajectories", {
            fields: FIELDS,
            populate: AUTHOR,
            sort: ["createdAt:desc"],
            // Strapi's default page size, as before. The dialog has no paging yet.
            pagination: { pageSize: 25 },
        })
        return entriesOf(response).flatMap((entry) => toSharedTrajectory(entry) ?? [])
    },
    ["shared-trajectories-v1"],
    { tags: [CACHE_TAGS.sharedTrajectories], revalidate: 86_400 },
)

async function findOwnEntry(uid: number): Promise<StrapiEntry | null> {
    const response: unknown = await strapiGet("/shared-trajectories", {
        filters: { user: { id: { $eq: uid } } },
        fields: FIELDS,
        populate: AUTHOR,
        pagination: { pageSize: 1 },
    })
    return entriesOf(response)[0] ?? null
}

/** The student's own shared trajectory. Per-user, so never cached on the server. */
export async function getOwnSharedTrajectory(uid: number): Promise<SharedTrajectory | null> {
    const entry = await findOwnEntry(uid)
    return entry ? toSharedTrajectory(entry) : null
}

export type ShareInput = { title: string; description: string; semesters: SharedSemester[] }

export async function createSharedTrajectory(uid: number, input: ShareInput): Promise<void> {
    await strapiPost("/shared-trajectories", {
        data: {
            title: input.title,
            description: input.description,
            semesters: input.semesters,
            total_credits: input.semesters.reduce((sum, semester) => sum + semesterLoad(semester), 0),
            user: uid,
        },
    })
    revalidateTag(CACHE_TAGS.sharedTrajectories)
}

/** Deletes the student's shared trajectory. False when they had none. */
export async function deleteOwnSharedTrajectory(uid: number): Promise<boolean> {
    const entry = await findOwnEntry(uid)
    if (!entry) return false
    // v5 addresses entries by documentId; v4 by id.
    await strapiDelete(`/shared-trajectories/${entry.documentId ?? entry.id}`)
    revalidateTag(CACHE_TAGS.sharedTrajectories)
    return true
}

/** True when the student already has a trajectory in the repository. */
export async function hasSharedTrajectory(uid: number): Promise<boolean> {
    return (await findOwnEntry(uid)) !== null
}
