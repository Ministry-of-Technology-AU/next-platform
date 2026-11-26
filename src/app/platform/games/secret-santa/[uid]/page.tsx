import { notFound } from "next/navigation"
import { Gift } from "lucide-react"
import { TourStep } from "@/components/guided-tour"
import PageTitle from "@/components/page-title"
import { auth } from "@/auth"
import { PoolClient } from "../_components/pool-client"
import { loadPoolView } from "../_server/view"
import { fallbackName } from "../utils"

// Per-user view read with the session; never statically cached.
export const dynamic = "force-dynamic"

type Props = { params: Promise<{ uid: string }> }

export default async function SecretSantaPoolPage({ params }: Props) {
    const { uid } = await params
    const [loaded, session] = await Promise.all([loadPoolView(uid), auth()])

    if (loaded.kind === "not-found") notFound()
    if (loaded.kind !== "ok") {
        return (
            <>
                <PageTitle icon={Gift} text="Secret Santa" />
                <div role="alert" className="mt-6 max-w-md rounded-2xl border border-border bg-card p-6">
                    <p className="font-heading text-lg font-semibold">This Secret Santa didn&apos;t load</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {loaded.kind === "signed-out" ? "Sign in with your Ashoka account to open it." : loaded.message}
                    </p>
                </div>
            </>
        )
    }

    const { view } = loaded
    const email = session?.user?.email ?? ""
    const defaultName = session?.user?.name?.trim() || (email ? fallbackName(email) : "")

    return (
        <>
            <TourStep
                id="page-title"
                title={view.title}
                content="This is one Secret Santa. Join, add a wish list, and after the draw, unwrap your giftee here."
                order={0}
            >
                <PageTitle icon={Gift} text={view.title} subheading={`Secret Santa hosted by ${view.hostName}`} />
            </TourStep>
            <div className="mt-6 sm:mt-8">
                <PoolClient view={view} defaultName={defaultName} />
            </div>
        </>
    )
}
