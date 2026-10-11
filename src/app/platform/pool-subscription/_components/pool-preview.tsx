"use client";

import { ArrowRight, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";
import { describeDuration, formatDate, isIndefinite } from "../utils";
import type { ServiceOption } from "../types";
import { SeatRow } from "./seat-row";

interface PoolPreviewProps {
  /** Null until a service is picked (or "Others" has no name yet). */
  service: ServiceOption | null;
  people: number;
  start?: Date;
  end?: Date;
  /** One-line summary for the mobile action bar instead of the full card. */
  compact?: boolean;
}

function splitLine(people: number) {
  return `You and ${people - 1} ${people - 1 === 1 ? "other" : "others"}, each paying 1/${people}`;
}

/** Live summary of the pool being created, built from the form's current values. */
export function PoolPreview({ service, people, start, end, compact = false }: PoolPreviewProps) {
  const Icon = service?.icon ?? CircleDashed;
  const duration = start && end ? describeDuration(start, end) : null;
  const ongoing = end ? isIndefinite(end) : false;

  if (compact) {
    return (
      <div className="flex min-w-0 items-center gap-3" aria-live="polite">
        <ServiceTile Icon={Icon} empty={!service} size="sm" />
        <div className="min-w-0 text-sm leading-tight">
          <p className="truncate font-semibold">{service?.label ?? "No service yet"}</p>
          <p className="truncate text-muted-foreground">
            Split {people} ways{duration ? ` · ${duration}` : ""}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section
      aria-label="Pool preview"
      aria-live="polite"
      className="rounded-xl border border-border bg-card p-6 shadow-lg"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your pool</p>

      <div className="mt-4 flex items-center gap-3">
        <ServiceTile Icon={Icon} empty={!service} />
        <p className={cn("font-heading text-xl font-bold leading-tight", !service && "text-muted-foreground")}>
          {service?.label ?? "Pick a service"}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <SeatRow seats={people} />
        <p className="text-sm text-muted-foreground">{splitLine(people)}</p>
      </div>

      <div className="mt-6 border-t border-border pt-4 text-sm">
        {start || end ? (
          <>
            <p className="flex items-center gap-2 font-medium tabular-nums">
              <span>{start ? formatDate(start) : "Start?"}</span>
              <ArrowRight aria-hidden="true" className="size-4 text-muted-foreground" />
              <span>{end ? formatDate(end, true) : "End?"}</span>
            </p>
            {duration ? (
              <p className="mt-1 text-muted-foreground">
                {ongoing ? "Ongoing pool" : `Runs for ${duration}`}
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-muted-foreground">Pick a start date to see how long it runs.</p>
        )}
      </div>
    </section>
  );
}

export function ServiceTile({
  Icon,
  empty = false,
  size = "md",
}: {
  Icon: React.ComponentType<{ className?: string }>;
  empty?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const box = { sm: "size-10", md: "size-12", lg: "size-14" }[size];
  const glyph = { sm: "size-5", md: "size-6", lg: "size-7" }[size];
  return (
    <span
      aria-hidden="true"
      className={cn(
        box,
        "flex shrink-0 items-center justify-center rounded-xl transition-colors",
        empty ? "border-2 border-dashed border-border text-muted-foreground" : "bg-primary/10 text-primary dark:bg-primary dark:text-primary-foreground",
      )}
    >
      <Icon className={glyph} />
    </span>
  );
}
