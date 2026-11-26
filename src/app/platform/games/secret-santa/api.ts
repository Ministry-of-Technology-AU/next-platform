import type { ApiResponse } from "./types"

/**
 * Client-side calls to the Secret Santa routes. Pages load data on the server; these are only
 * for the viewer's own actions, followed by `router.refresh()`.
 */

const BASE = "/api/platform/games/secret-santa"

export async function santaRequest<T>(
    path: string,
    method: "POST" | "PATCH" | "PUT" | "DELETE",
    body?: unknown,
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`${BASE}${path}`, {
            method,
            headers: body === undefined ? undefined : { "Content-Type": "application/json" },
            body: body === undefined ? undefined : JSON.stringify(body),
        })
        const json: unknown = await response.json().catch(() => null)
        if (json && typeof json === "object" && "success" in json) return json as ApiResponse<T>
        return { success: false, error: "Something went wrong. Try again in a minute." }
    } catch {
        return { success: false, error: "You seem to be offline. Check your connection and try again." }
    }
}
