import { z } from "zod"
import { LIMITS } from "./data"

/**
 * Request bodies for the Secret Santa routes. Client-safe, so forms can reuse them.
 * Rich text is length-checked here and sanitised on the server before it is stored.
 */

const richText = z.string().max(LIMITS.richTextMax * 2, "That's too long.")

const title = z
    .string()
    .trim()
    .min(LIMITS.titleMin, `Use at least ${LIMITS.titleMin} characters.`)
    .max(LIMITS.titleMax, `Use at most ${LIMITS.titleMax} characters.`)

const budget = z.coerce
    .number()
    .int("Use a whole number of rupees.")
    .min(0, "Budget can't be negative.")
    .max(LIMITS.budgetMax, `Keep the budget under ₹${LIMITS.budgetMax.toLocaleString("en-IN")}.`)

const eventDate = z.iso.datetime({ offset: true, message: "Pick a valid date." })

export const CreatePoolSchema = z.object({
    title,
    budget,
    eventDate,
    hostNote: richText.optional().default(""),
    hostPlays: z.boolean().default(true),
    hostName: z.string().trim().min(LIMITS.nameMin).max(LIMITS.nameMax).optional(),
})
export type CreatePoolInput = z.infer<typeof CreatePoolSchema>

export const UpdatePoolSchema = z
    .object({
        title: title.optional(),
        budget: budget.optional(),
        eventDate: eventDate.optional(),
        hostNote: richText.optional(),
    })
    .refine((value) => Object.values(value).some((field) => field !== undefined), "Nothing to update.")
export type UpdatePoolInput = z.infer<typeof UpdatePoolSchema>

const name = z
    .string()
    .trim()
    .min(LIMITS.nameMin, `Use at least ${LIMITS.nameMin} characters.`)
    .max(LIMITS.nameMax, `Use at most ${LIMITS.nameMax} characters.`)

export const JoinSchema = z.object({
    name,
    wishlist: richText.optional().default(""),
})
export type JoinInput = z.infer<typeof JoinSchema>

export const UpdateMeSchema = z
    .object({
        name: name.optional(),
        wishlist: richText.optional(),
        revealed: z.literal(true).optional(),
    })
    .refine((value) => Object.values(value).some((field) => field !== undefined), "Nothing to update.")
export type UpdateMeInput = z.infer<typeof UpdateMeSchema>

export const AddParticipantsSchema = z.object({
    emails: z
        .array(z.string().trim().toLowerCase().max(254))
        .min(1, "Add at least one email.")
        .max(LIMITS.emailsPerCall, `Add at most ${LIMITS.emailsPerCall} emails at a time.`),
})
export type AddParticipantsInput = z.infer<typeof AddParticipantsSchema>

export const ExclusionsSchema = z.object({
    pairs: z
        .array(z.tuple([z.number().int().positive(), z.number().int().positive()]))
        .max(LIMITS.maxParticipants * 2),
})
export type ExclusionsInput = z.infer<typeof ExclusionsSchema>

/** Splits pasted text (commas, spaces, new lines, semicolons) into emails. */
export function splitEmails(text: string): string[] {
    return text
        .split(/[\s,;]+/)
        .map((part) => part.trim().toLowerCase())
        .filter((part) => part.length > 0)
}

export const EmailSchema = z.email()
