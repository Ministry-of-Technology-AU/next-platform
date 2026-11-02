"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CircleCheck, LayoutList, Megaphone, UsersRound, XCircle } from "lucide-react";
import { toast } from "sonner";

import { TourStep } from "@/components/guided-tour";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { PoolMatch, PoolStatus, PoolSubscription } from "../types";
import { describeDuration, formatDate, fromISODate, getService, isIndefinite } from "../utils";
import { PoolMatches } from "./pool-matches";
import { ServiceTile } from "./pool-preview";
import { SeatRow } from "./seat-row";

const STATUS_STYLE: Record<PoolStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-green text-white" },
  full: { label: "Full", className: "bg-blue text-white" },
  canceled: { label: "Cancelled", className: "bg-destructive text-white" },
};

const NEXT_STEPS = [
  { icon: Megaphone, text: "Share the pool with friends or class groups so people who want the same plan find it." },
  { icon: CircleCheck, text: "Once everyone's in, mark it full so it stops showing as open." },
  { icon: LayoutList, text: "Browse other pools any time. You might find one to join instead." },
];

async function updateStatus(id: string, status: PoolStatus): Promise<void> {
  const response = await fetch("/api/platform/pool-subscription", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscriptionId: id, status }),
  });
  const result = (await response.json().catch(() => null)) as { success?: boolean; error?: string } | null;
  if (!response.ok || !result?.success) {
    throw new Error(result?.error ?? "The change didn't save. Try again.");
  }
}

export function ActivePool({ pool, matches }: { pool: PoolSubscription; matches: PoolMatch[] }) {
  const router = useRouter();
  const { attributes } = pool;
  const service = getService(attributes.service);
  const start = fromISODate(attributes.start);
  const end = fromISODate(attributes.end);
  const duration = describeDuration(start, end);

  const [status, setStatus] = React.useState<PoolStatus>(attributes.status);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);
  const statusStyle = STATUS_STYLE[status] ?? STATUS_STYLE.open;
  const isOpen = status === "open";

  const markFull = async () => {
    void haptic.press();
    const previous = status;
    setStatus("full"); // optimistic
    try {
      await updateStatus(pool.id, "full");
      void haptic.confirm();
      toast.success("Marked as full. It no longer shows as open.");
      router.refresh();
    } catch (error) {
      setStatus(previous);
      void haptic.error();
      platform.error("Marking pool full failed:", error);
      toast.error(error instanceof Error ? error.message : "Couldn't mark the pool full.");
    }
  };

  const cancelPool = async () => {
    setCancelling(true);
    try {
      await updateStatus(pool.id, "canceled");
      void haptic.confirm();
      toast.success("Pool cancelled.");
      setConfirmOpen(false);
      router.refresh();
    } catch (error) {
      void haptic.error();
      platform.error("Cancelling pool failed:", error);
      toast.error(error instanceof Error ? error.message : "Couldn't cancel the pool.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
      <TourStep
        id="active-pool"
        title="Your pool"
        content="This is the pool you're running. Mark it full once everyone's in, or cancel it to start a new one."
        order={1}
      >
        <section aria-labelledby="active-pool-title" className="rounded-xl border border-border bg-card p-4 shadow-lg sm:p-6">
          <div className="flex items-start gap-4">
            <ServiceTile Icon={service.icon} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your pool</p>
              <h2 id="active-pool-title" className="mt-0.5 break-words text-left text-2xl font-bold leading-tight">
                {service.label}
              </h2>
            </div>
            <Badge className={cn("shrink-0", statusStyle.className)}>{statusStyle.label}</Badge>
          </div>

          <div className="mt-6 space-y-3">
            <SeatRow seats={attributes.numberPeople} />
            <p className="text-sm text-muted-foreground">
              {attributes.numberPeople} people in total, each paying 1/{attributes.numberPeople}
            </p>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Starts</dt>
              <dd className="font-medium tabular-nums">{formatDate(start, true)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{isIndefinite(end) ? "Duration" : "Ends"}</dt>
              <dd className="font-medium tabular-nums">{formatDate(end, true)}</dd>
            </div>
            {duration && !isIndefinite(end) ? (
              <div className="col-span-2 sm:col-span-1">
                <dt className="text-muted-foreground">Runs for</dt>
                <dd className="font-medium">{duration}</dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              variant="animated"
              className="h-11 w-full gap-2 sm:w-auto md:h-10"
              onClick={markFull}
              disabled={!isOpen}
            >
              <UsersRound aria-hidden="true" className="size-4" />
              {isOpen ? "Mark as full" : "Marked as full"}
            </Button>
            <Button asChild variant="outline" className="h-11 w-full gap-2 sm:w-auto md:h-10">
              <Link href="/platform/pool-subscription/results" onClick={() => void haptic.tap()}>
                See all pools
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="h-11 w-full gap-2 text-destructive-text hover:bg-destructive/10 hover:text-destructive-text sm:ml-auto sm:w-auto md:h-10"
              onClick={() => {
                void haptic.warn();
                setConfirmOpen(true);
              }}
            >
              <XCircle aria-hidden="true" className="size-4" />
              Cancel pool
            </Button>
          </div>
        </section>
      </TourStep>

      <TourStep
        id="pool-matches"
        title="Closest matches"
        content="Open pools closest to yours, ranked by service, dates and group size. Email someone to team up."
        order={2}
        className="lg:col-start-1"
      >
        <PoolMatches matches={matches} />
      </TourStep>

      <aside className="rounded-xl border border-border bg-card p-4 sm:p-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <h3 className="text-left text-base font-semibold">What happens next</h3>
        <ul className="mt-4 space-y-4">
          {NEXT_STEPS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex gap-3 text-sm text-muted-foreground">
              <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-foreground" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </aside>

      <Dialog open={confirmOpen} onOpenChange={(open) => !cancelling && setConfirmOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel your {service.label} pool?</DialogTitle>
            <DialogDescription>
              It disappears from the list and people can no longer find it. You can create a new pool afterwards.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="h-11 md:h-10" disabled={cancelling} onClick={() => void haptic.tap()}>
                Keep pool
              </Button>
            </DialogClose>
            <Button
              className="h-11 gap-2 bg-destructive text-white hover:bg-destructive/90 md:h-10"
              onClick={cancelPool}
              disabled={cancelling}
              aria-busy={cancelling || undefined}
            >
              {cancelling ? <Spinner className="size-4" aria-hidden="true" /> : null}
              {cancelling ? "Cancelling…" : "Cancel pool"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
