import { Sparkles } from "lucide-react";
import { INDEFINITE_END_DATE, SERVICES } from "./data";
import type { ServiceOption } from "./types";

/**
 * Label and icon for a stored service. Known keys come from `data.ts`; anything
 * else is a name someone typed under "Others" and is shown as typed.
 */
export function getService(value: string): ServiceOption {
  // Older pools stored a bare "others"; that still resolves to the "Others" entry.
  const known = SERVICES.find((s) => s.value === value);
  return known ?? { value, label: value.trim() || "Unnamed service", icon: Sparkles };
}

/** Check if a date represents an indefinite/ongoing pool. */
export function isIndefinite(date: Date | string): boolean {
  if (typeof date === "string") {
    return date.startsWith("2099") || date === INDEFINITE_END_DATE;
  }
  return date.getFullYear() >= 2099;
}

/** Today in IST, at local midnight, for calendar lower bounds. */
export function todayIST(): Date {
  const now = new Date();
  const ist = new Date(now.getTime() + now.getTimezoneOffset() * 60_000 + 5.5 * 3_600_000);
  return new Date(ist.getFullYear(), ist.getMonth(), ist.getDate());
}

/** The calendar day the user picked, as YYYY-MM-DD (no UTC shift). */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse a stored YYYY-MM-DD as a local date, so it doesn't drift a day west of UTC. */
export function fromISODate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

const shortDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });
const longDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function formatDate(date: Date, withYear = false): string {
  if (isIndefinite(date)) return "Ongoing";
  return (withYear ? longDate : shortDate).format(date);
}

/** "3 months", "1 month 12 days", "18 days". Null when the range is empty or backwards. */
export function describeDuration(start: Date, end: Date): string | null {
  if (isIndefinite(end)) return "Ongoing";
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  if (days <= 0) return null;
  const months = Math.floor(days / 30);
  const rest = days % 30;
  const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;
  if (months === 0) return plural(days, "day");
  return rest === 0 ? plural(months, "month") : `${plural(months, "month")} ${plural(rest, "day")}`;
}

