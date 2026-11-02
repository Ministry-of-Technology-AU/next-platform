import { cookies } from "next/headers";
import { LayoutList } from "lucide-react";
import { TourStep } from "@/components/guided-tour";
import PageTitle from "@/components/page-title";
import { PageNavButton } from "../_components/page-nav-button";
import type { PoolListData, PoolListQuery } from "../types";
import { ResultsClient } from "./client";

// Per-user data read with the session cookie; never statically cached.
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
}

/** The URL is the source of truth for filters, so results can be shared and survive a reload. */
function toQuery(params: Record<string, string | string[] | undefined>): PoolListQuery {
  const page = Number(first(params.page));
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    service: first(params.service),
    q: first(params.q),
  };
}

async function fetchPools(query: PoolListQuery): Promise<{ data: PoolListData; error: string | null }> {
  const empty: PoolListData = { pools: [], own: null, page: query.page, pageCount: 1, total: 0 };
  try {
    const cookieStore = await cookies();
    const params = new URLSearchParams({ page: String(query.page) });
    if (query.service) params.set("service", query.service);
    if (query.q) params.set("q", query.q);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/platform/pool-subscription?${params}`,
      { headers: { Cookie: cookieStore.toString() }, cache: "no-store" },
    );
    const json = (await response.json().catch(() => null)) as
      | { success?: boolean; data?: PoolListData; error?: string }
      | null;
    if (!response.ok || !json?.success || !json.data) {
      throw new Error(json?.error ?? `Pool list failed with ${response.status}`);
    }
    return { data: json.data, error: null };
  } catch (err) {
    platform.error("Error fetching pool list:", err);
    return { data: empty, error: err instanceof Error ? err.message : "Couldn't load pools." };
  }
}

export default async function PoolResultsPage({ searchParams }: { searchParams: SearchParams }) {
  const query = toQuery(await searchParams);
  const { data, error } = await fetchPools(query);

  return (
    <>
      <TourStep
        id="page-title"
        title="Open pools"
        content="Every open subscription pool. Search by service or name, filter by service, and email an owner to team up."
        order={0}
      >
        <PageTitle
          icon={LayoutList}
          text="Open pools"
          subheading="Every subscription pool still looking for people. Email an owner to team up, or start your own."
          actions={
            <PageNavButton
              href="/platform/pool-subscription"
              label={data.own ? "Your pool" : "Start a pool"}
              back
            />
          }
        />
      </TourStep>

      <div className="mt-6 sm:mt-8">
        <ResultsClient data={data} query={query} error={error} />
      </div>
    </>
  );
}
