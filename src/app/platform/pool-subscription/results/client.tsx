"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MotionConfig } from "motion/react";
import { ArrowRight, RefreshCw, SearchX, UsersRound } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { PoolCard } from "../_components/pool-card";
import { ServiceTile } from "../_components/pool-preview";
import type { PoolListData, PoolListQuery } from "../types";
import { getService } from "../utils";
import { ALL_SERVICES, ResultsFilters } from "./_components/results-filters";
import { ResultsPagination } from "./_components/results-pagination";

interface ResultsClientProps {
  data: PoolListData;
  query: PoolListQuery;
  error: string | null;
}

/**
 * Filters, list and pagination. Every change goes into the URL; the server page
 * refetches through the API, so the list is always filtered in Strapi.
 */
export function ResultsClient({ data, query, error }: ResultsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = React.useTransition();
  const service = query.service ?? ALL_SERVICES;
  const q = query.q ?? "";
  const hasFilters = Boolean(query.q || query.service);

  const navigate = React.useCallback(
    (next: Partial<PoolListQuery>) => {
      const merged = { ...query, ...next };
      const params = new URLSearchParams();
      if (merged.q) params.set("q", merged.q);
      if (merged.service && merged.service !== ALL_SERVICES) params.set("service", merged.service);
      if (merged.page > 1) params.set("page", String(merged.page));
      const search = params.toString();
      startTransition(() => router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false }));
    },
    [query, pathname, router],
  );

  // A new filter always starts from page 1.
  const onSearch = React.useCallback((value: string) => navigate({ q: value || undefined, page: 1 }), [navigate]);
  const onService = React.useCallback((value: string) => navigate({ service: value, page: 1 }), [navigate]);
  const onClear = React.useCallback(() => navigate({ q: undefined, service: undefined, page: 1 }), [navigate]);
  const onPage = React.useCallback(
    (page: number) => {
      navigate({ page });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate],
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-6">
        {data.own ? <OwnPoolBanner own={data.own} /> : null}

        <ResultsFilters q={q} service={service} onSearch={onSearch} onService={onService} onClear={onClear} />

        {error ? (
          <Alert>
            <AlertTitle>Couldn&apos;t load pools</AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-3">
              <span>Check your connection, then try again.</span>
              <Button
                variant="outline"
                className="h-11 gap-2 md:h-9"
                onClick={() => {
                  void haptic.tap();
                  startTransition(() => router.refresh());
                }}
              >
                <RefreshCw aria-hidden="true" className={cn("size-4", pending && "animate-spin")} />
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <section
            aria-label="Open pools"
            aria-busy={pending || undefined}
            className={cn("space-y-4 transition-opacity", pending && "opacity-60")}
          >
            {data.pools.length === 0 ? (
              <EmptyState filtered={hasFilters} hasOwn={Boolean(data.own)} onClear={onClear} />
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data.pools.map((pool, i) => (
                  <PoolCard key={pool.id} pool={pool} isOwn={pool.id === data.own?.id} index={i} />
                ))}
              </ul>
            )}
            <ResultsPagination page={data.page} pageCount={data.pageCount} total={data.total} onPage={onPage} />
          </section>
        )}
      </div>
    </MotionConfig>
  );
}

function OwnPoolBanner({ own }: { own: NonNullable<PoolListData["own"]> }) {
  const service = getService(own.attributes.service);
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary/40 bg-primary/5 p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <ServiceTile Icon={service.icon} size="sm" />
        <p className="min-w-0 text-sm">
          <span className="font-semibold">Your {service.label} pool is open.</span>{" "}
          <span className="text-muted-foreground">See its closest matches or mark it full.</span>
        </p>
      </div>
      <Button asChild variant="outline" className="h-11 w-full gap-2 sm:w-auto md:h-10">
        <Link href="/platform/pool-subscription" onClick={() => void haptic.tap()}>
          Manage pool
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </Button>
    </div>
  );
}

function EmptyState({ filtered, hasOwn, onClear }: { filtered: boolean; hasOwn: boolean; onClear: () => void }) {
  const Icon = filtered ? SearchX : UsersRound;
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border px-4 py-12 text-center">
      <Icon aria-hidden="true" className="size-8 text-muted-foreground" />
      <div>
        <p className="font-semibold">{filtered ? "No open pools match these filters" : "No open pools yet"}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {filtered
            ? "Try another service or a shorter search."
            : "Start one and it'll show here for everyone looking for the same plan."}
        </p>
      </div>
      {filtered ? (
        <Button
          variant="outline"
          className="h-11 md:h-10"
          onClick={() => {
            void haptic.tap();
            onClear();
          }}
        >
          Clear filters
        </Button>
      ) : hasOwn ? null : (
        <Button asChild variant="animated" className="h-11 gap-2 md:h-10">
          <Link href="/platform/pool-subscription" onClick={() => void haptic.press()}>
            Start a pool
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}
