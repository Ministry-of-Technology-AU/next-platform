import { Gift } from "lucide-react"
import { TourStep } from "@/components/guided-tour"
import PageTitle from "@/components/page-title"
import { getAuthenticatedUser } from "@/lib/auth"
import { listMyPools } from "./_server/pools"
import { SecretSantaLandingClient } from "./client"
import type { PoolSummary } from "./types"

// Per-user data read with the session; never statically cached.
export const dynamic = "force-dynamic"

async function loadPools(): Promise<{ pools: PoolSummary[]; error: string | null }> {
    try {
        const user = await getAuthenticatedUser()
        if (!user) return { pools: [], error: "Sign in to see your Secret Santas." }
        return { pools: await listMyPools(user.email.toLowerCase(), user.uid), error: null }
    } catch (err) {
        platform.error("Secret Santa: loading pools failed:", err)
        return { pools: [], error: "Your Secret Santas didn't load." }
    }
}

export default async function SecretSantaPage() {
    const { pools, error } = await loadPools()

    return (
        <>
            <TourStep
                id="page-title"
                title="Secret Santa"
                content="Run a Secret Santa for your group. Set a budget and a date, share a link, and draw names. Everyone gets an email with their person."
                order={0}
            >
                <PageTitle
                    icon={Gift}
                    text="Secret Santa"
                    subheading="Set a budget, share a link, draw names. Everyone finds out who they're gifting, and only that."
                />
            </TourStep>
            <div className="mt-6 sm:mt-8">
                <SecretSantaLandingClient pools={pools} error={error} />
            </div>
        </>
    )
}
