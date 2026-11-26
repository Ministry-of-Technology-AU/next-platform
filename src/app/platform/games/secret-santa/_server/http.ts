import "server-only"

import type { NextResponse } from "next/server"
import type { z } from "zod"
import { jsonError } from "@/lib/forms/api-helpers"
import { sanitizeHtml } from "@/lib/forms/sanitize"
import { checkRateLimit, tooManyRequests } from "@/lib/rate-limit"
import { LIMITS } from "../data"
import { plainTextLength } from "../utils"
import type { Guarded } from "./access"

/** Small request helpers shared by the Secret Santa routes. */

export async function readBody<S extends z.ZodType>(request: Request, schema: S): Promise<Guarded<z.output<S>>> {
    let body: unknown
    try {
        body = await request.json()
    } catch {
        return { ok: false, response: jsonError("The request body isn't valid JSON.", 400) }
    }
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
        return { ok: false, response: jsonError(parsed.error.issues[0]?.message ?? "Check the form and try again.", 400) }
    }
    return { ok: true, value: parsed.data }
}

/** Sanitises rich text from the editor and checks its stored length. */
export function cleanRichText(html: string): Guarded<string> {
    const clean = sanitizeHtml(html)
    if (clean.length > LIMITS.richTextMax) {
        return { ok: false, response: jsonError(`Keep it under ${LIMITS.richTextMax} characters.`, 400) }
    }
    return { ok: true, value: plainTextLength(clean) === 0 ? "" : clean }
}

/** Per-route limit on top of the global one (backend.md §7). Keyed by the session email. */
export function limit(key: string, max: number, windowMs: number): NextResponse | null {
    const result = checkRateLimit(`secret-santa:${key}`, { limit: max, windowMs })
    return result.ok ? null : tooManyRequests(result.retryAfter)
}

export const HOUR = 60 * 60 * 1000

/** Only addresses that can sign in to the platform can see a reveal (PRD §3, S3). */
const ALLOWED_DOMAIN = (process.env.ALLOWED_EMAIL_DOMAIN || "ashoka.edu.in").replace(/^@/, "").toLowerCase()

export function isAllowedEmail(email: string): boolean {
    return email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)
}
