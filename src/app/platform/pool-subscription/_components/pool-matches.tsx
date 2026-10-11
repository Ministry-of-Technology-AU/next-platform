"use client";

import Link from "next/link";
import { ArrowRight, Hourglass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { PoolMatch } from "../types";
import { PoolCard } from "./pool-card";

/** Closest open pools to the viewer's, or a "hang on" state when there are none yet. */
export function PoolMatches({ matches, className }: { matches: PoolMatch[]; className?: string }) {
  return (
    <section aria-labelledby="pool-matches-title" className={cn("space-y-4", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="pool-matches-title" className="text-left text-lg font-bold">
          Closest matches
        </h3>
        {matches.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            {matches.length} {matches.length === 1 ? "pool" : "pools"} close to yours
          </p>
        ) : null}
      </div>

      {matches.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border-2 border-dashed border-border p-4 sm:flex-row sm:items-center sm:p-6">
          <Hourglass aria-hidden="true" className="size-6 shrink-0 text-muted-foreground" />
          <div className="flex-1 text-sm">
            <p className="font-semibold">No open pools match yours yet</p>
            <p className="mt-1 text-muted-foreground">
              Hang on. When someone starts a pool close to yours, it shows up here.
            </p>
          </div>
          <Button asChild variant="outline" className="h-11 w-full gap-2 sm:w-auto md:h-10">
            <Link href="/platform/pool-subscription/results" onClick={() => void haptic.tap()}>
              Browse all pools
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {matches.map((match, i) => (
            <PoolCard key={match.pool.id} pool={match.pool} match={match} index={i} />
          ))}
        </ul>
      )}
    </section>
  );
}
