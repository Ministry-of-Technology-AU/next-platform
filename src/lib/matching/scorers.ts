/**
 * Building blocks for matching criteria. Each returns 0 (far) to 1 (identical),
 * or null where noted for "can never match". Tool-agnostic: pool-a-subscription
 * uses text + date overlap, pool-a-cab will use exact places + time proximity,
 * Ashokan Around can use text (city) + numeric closeness (budget).
 */

const DAY_MS = 86_400_000;

/** Lower-case, strip accents and punctuation, collapse spaces. */
export function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function bigrams(value: string): Map<string, number> {
  const compact = value.replace(/ /g, "");
  const grams = new Map<string, number>();
  for (let i = 0; i < compact.length - 1; i++) {
    const gram = compact.slice(i, i + 2);
    grams.set(gram, (grams.get(gram) ?? 0) + 1);
  }
  return grams;
}

function dice(x: string, y: string): number {
  const gx = bigrams(x);
  const gy = bigrams(y);
  let shared = 0;
  let total = 0;
  for (const [gram, count] of gx) {
    shared += Math.min(count, gy.get(gram) ?? 0);
    total += count;
  }
  for (const count of gy.values()) total += count;
  return total === 0 ? (x === y ? 1 : 0) : (2 * shared) / total;
}

/**
 * Fuzzy similarity of two short labels, 0 to 1. Takes the better of:
 * - character-bigram Dice over the whole label, and
 * - word containment: each word of the shorter label against its closest word
 *   in the longer one, averaged. So a longer name still matches its core
 *   ("youtube premium family" ~ "youtube premium") and typos survive
 *   ("spotfy" ~ "spotify premium").
 */
export function textSimilarity(a: string, b: string): number {
  const x = normalizeText(a);
  const y = normalizeText(b);
  if (!x || !y) return 0;
  if (x === y) return 1;

  const [shorter, longer] = [x.split(" "), y.split(" ")].sort((p, q) => p.length - q.length) as [string[], string[]];
  const containment =
    shorter.reduce((sum, word) => sum + Math.max(...longer.map((other) => (word === other ? 1 : dice(word, other)))), 0) /
    shorter.length;

  return Math.max(dice(x, y), containment);
}

/** 1 when equal (case- and spacing-insensitive for strings), otherwise null: a hard filter. */
export function exactOrReject<T>(a: T, b: T): 1 | null {
  if (typeof a === "string" && typeof b === "string") {
    return normalizeText(a) === normalizeText(b) ? 1 : null;
  }
  return a === b ? 1 : null;
}

/**
 * Smooth fall-off with distance: 1 at 0, about 0.37 at `scale`, near 0 by 3× `scale`.
 * Use for "closer is better" on any unit: days, minutes, rupees, people.
 */
export function proximity(distance: number, scale: number): number {
  if (!Number.isFinite(distance) || scale <= 0) return 0;
  return Math.exp(-Math.abs(distance) / scale);
}

export interface DateRange {
  start: Date;
  end: Date;
}

/** Whole days between two dates, ignoring direction. */
export function daysApart(a: Date, b: Date): number {
  return Math.round(Math.abs(a.getTime() - b.getTime()) / DAY_MS);
}

/** Days two ranges share. 0 when they don't touch. */
export function overlapDays(a: DateRange, b: DateRange): number {
  const start = Math.max(a.start.getTime(), b.start.getTime());
  const end = Math.min(a.end.getTime(), b.end.getTime());
  return end <= start ? 0 : Math.round((end - start) / DAY_MS);
}

/**
 * Share of `mine` that `theirs` covers, 0 to 1. Null when they don't overlap at
 * all, so a criterion built on it doubles as a hard filter.
 */
export function rangeCoverage(mine: DateRange, theirs: DateRange): number | null {
  const shared = overlapDays(mine, theirs);
  if (shared === 0) return null;
  const length = Math.max(1, Math.round((mine.end.getTime() - mine.start.getTime()) / DAY_MS));
  return Math.min(1, shared / length);
}
