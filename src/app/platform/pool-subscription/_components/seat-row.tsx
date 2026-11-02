"use client";

import { AnimatePresence, motion } from "motion/react";
import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeatRowProps {
  /** Total seats, including the owner's. */
  seats: number;
  size?: "sm" | "md";
  className?: string;
}

/**
 * The pool drawn as seats: the first is yours, the rest are open. Seats pop in
 * and out as the count changes, so the stepper's effect is visible at a glance.
 */
export function SeatRow({ seats, size = "md", className }: SeatRowProps) {
  const dot = size === "md" ? "size-9 text-xs" : "size-6 text-[10px]";
  const others = Math.max(seats - 1, 0);

  return (
    <div
      role="img"
      aria-label={`${seats} seats: yours and ${others} open`}
      className={cn("flex flex-wrap gap-1.5", className)}
    >
      <span
        className={cn(
          dot,
          "flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground shadow-sm",
        )}
      >
        You
      </span>
      <AnimatePresence initial={false} mode="popLayout">
        {Array.from({ length: others }, (_, i) => (
          <motion.span
            key={i}
            layout
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className={cn(
              dot,
              "flex shrink-0 items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground/70",
            )}
          >
            <UserRound aria-hidden="true" className={size === "md" ? "size-4" : "size-3"} />
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
