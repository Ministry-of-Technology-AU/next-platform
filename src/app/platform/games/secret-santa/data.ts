/** Limits and fixed copy for Secret Santa. PRD §3 and §5. */

export const LIMITS = {
    titleMin: 3,
    titleMax: 80,
    nameMin: 2,
    nameMax: 60,
    budgetMax: 100_000,
    /** Characters of sanitised HTML. */
    richTextMax: 5000,
    /**
     * 3 in production. 2 in development only, so the draw, emails and reveal can be tested
     * with two accounts (a pair simply draws each other). NODE_ENV is inlined at build time.
     */
    minParticipants: process.env.NODE_ENV === "development" ? 2 : 3,
    /** Keeps a draw inside Gmail SMTP sending limits. */
    maxParticipants: 100,
    /** Emails a host can paste in one go. */
    emailsPerCall: 50,
} as const

export const BUDGET_QUICK_PICKS = [300, 500, 1000] as const

export const STORAGE_KEYS = {
    tourSeen: "secret-santa:tour-seen",
} as const

export const SANTA_BASE_PATH = "/platform/games/secret-santa"

export function poolPath(uid: string): string {
    return `${SANTA_BASE_PATH}/${uid}`
}
