import { cookies } from "next/headers";
import { UsersRound } from "lucide-react";
import { TourStep } from "@/components/guided-tour";
import PageTitle from "@/components/page-title";
import { PageNavButton } from "./_components/page-nav-button";
import { PoolSubscriptionClient } from "./client";
import type { ActivePoolData } from "./types";

// Per-user data read with the session cookie; never statically cached.
export const dynamic = "force-dynamic";

async function fetchActivePool(): Promise<{ data: ActivePoolData; error: string | null }> {
  const empty: ActivePoolData = { pool: null, matches: [] };
  try {
    const cookieStore = await cookies();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/platform/pool-subscription?scope=mine`,
      {
        headers: { Cookie: cookieStore.toString() },
        cache: "no-store",
      },
    );
    if (!response.ok) throw new Error(`Pool lookup failed with ${response.status}`);

    const json = (await response.json()) as { success?: boolean; data?: Partial<ActivePoolData> };
    if (!json.success || !json.data) throw new Error("Invalid response format");
    return { data: { pool: json.data.pool ?? null, matches: json.data.matches ?? [] }, error: null };
  } catch (err) {
    platform.error("Error fetching active pool:", err);
    return { data: empty, error: err instanceof Error ? err.message : "An error occurred" };
  }
}

export default async function PoolSubscriptionPage() {
  const { data, error } = await fetchActivePool();

  return (
    <>
      <TourStep
        id="page-title"
        title="Pool a Subscription"
        content="Split the cost of a subscription with other students. Start a pool here, or browse the ones already open."
        order={0}
      >
        <PageTitle
          icon={UsersRound}
          text="Pool a Subscription"
          subheading={
            data.pool
              ? "Your pool is live. Mark it full once everyone's in, or browse the other open pools."
              : "Split Netflix, Spotify, ChatGPT and more with other students. Say what you want to share and for how long, and people after the same plan can find you."
          }
          actions={<PageNavButton href="/platform/pool-subscription/results" label="Browse open pools" />}
        />
      </TourStep>

      <div className="mt-6 sm:mt-8">
        <PoolSubscriptionClient data={data} error={error} />
      </div>
    </>
  );
}
