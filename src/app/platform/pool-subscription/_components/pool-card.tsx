"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { PoolSubscription } from "../types";
import { describeDuration, formatDate, fromISODate, getService, isIndefinite } from "../utils";
import { ServiceTile } from "./pool-preview";
import { SeatRow } from "./seat-row";

function mailto(email: string, serviceLabel: string, username: string) {
  const subject = `Pooling ${serviceLabel}`;
  const body = `Hi ${username},\n\nI saw your ${serviceLabel} pool on the platform. Want to team up?\n`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Score bands shown instead of a raw number. */
function strength(score: number) {
  if (score >= 0.8) return { label: "Strong match", className: "bg-green/15 text-green-dark dark:text-green-light" };
  return { label: "Good match", className: "bg-blue/15 text-blue-dark dark:text-blue-light" };
}

interface PoolCardProps {
  pool: PoolSubscription;
  /** Present on a match: drives the strength tag and the reasons list. */
  match?: { score: number; reasons: string[] };
  /** The viewer's own pool: links to manage it instead of offering to email. */
  isOwn?: boolean;
  /** Position in its list, for the staggered entrance. */
  index?: number;
}

/** One open pool: service, owner, dates, seats, and how to reach the owner. Used by matches and results. */
export function PoolCard({ pool, match, isOwn = false, index = 0 }: PoolCardProps) {
  const { attributes } = pool;
  const service = getService(attributes.service);
  const owner = attributes.user?.data?.attributes;
  const start = fromISODate(attributes.start);
  const end = fromISODate(attributes.end);
  const duration = isIndefinite(end) ? "Ongoing" : describeDuration(start, end);
  const band = match ? strength(match.score) : null;

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut", delay: Math.min(index, 8) * 0.04 }}
      className={cn(
        "flex flex-col rounded-xl border bg-card p-4 shadow-sm",
        isOwn ? "border-primary/60 ring-1 ring-primary/30" : "border-border",
      )}
    >
      <div className="flex items-start gap-3">
        <ServiceTile Icon={service.icon} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold" title={service.label}>
            {service.label}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {isOwn ? "Your pool" : `by ${owner?.username ?? "someone"}`}
          </p>
        </div>
        {band ? (
          <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold", band.className)}>
            {band.label}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <SeatRow seats={attributes.numberPeople} size="sm" className="min-w-0" />
        <span className="shrink-0 text-sm text-muted-foreground tabular-nums">{attributes.numberPeople} people</span>
      </div>

      <p className="mt-3 text-sm tabular-nums">
        {formatDate(start)} to {formatDate(end, true)}
        {duration ? <span className="text-muted-foreground"> · {duration}</span> : null}
      </p>

      {match && match.reasons.length > 0 ? (
        <ul className="mt-3 space-y-1">
          {match.reasons.map((reason) => (
            <li key={reason} className="flex items-start gap-1.5 text-sm text-muted-foreground">
              <Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-green" />
              {reason}
            </li>
          ))}
        </ul>
      ) : null}

      {/* Pushes the action to the card's foot so a row of cards lines up. */}
      <div className="mt-auto pt-4">
        {isOwn ? (
          <Button asChild variant="outline" className="h-11 w-full gap-2 md:h-10">
            <Link href="/platform/pool-subscription" onClick={() => void haptic.tap()}>
              Manage your pool
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        ) : owner?.email ? (
          <Button asChild variant="outline" className="h-11 w-full gap-2 md:h-10">
            <a href={mailto(owner.email, service.label, owner.username)} onClick={() => void haptic.press()}>
              <Mail aria-hidden="true" className="size-4" />
              Email {owner.username}
            </a>
          </Button>
        ) : null}
      </div>
    </motion.li>
  );
}
