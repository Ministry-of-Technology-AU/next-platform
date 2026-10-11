/**
 * Generic matcher: ranks candidates by how close they are to a request.
 *
 * It knows nothing about Strapi or any one tool. A tool describes "close" as a
 * list of criteria (see `scorers.ts` for building blocks), maps its records into
 * whatever shape those criteria read, and calls `rankMatches`.
 *
 *   const matches = rankMatches(myPool, otherPools, subscriptionCriteria, { limit: 3 });
 *
 * Pure and synchronous. Run it on the server over a list Strapi has already
 * narrowed with filters; it is not a substitute for filtering in the query.
 */

export interface Criterion<TRequest, TCandidate = TRequest> {
  /** Stable id, used in the score breakdown. */
  key: string;
  /** Relative importance. Weights are normalised, so only their ratios matter. */
  weight: number;
  /**
   * How close the pair is on this one dimension: 0 (far) to 1 (identical).
   * Return `null` when the pair can never match (different city, no date
   * overlap); the candidate is dropped regardless of its other scores.
   */
  score: (request: TRequest, candidate: TCandidate) => number | null;
  /** Optional reason shown to the user, e.g. "Starts the same week". Null to stay quiet. */
  explain?: (request: TRequest, candidate: TCandidate, score: number) => string | null;
}

export interface MatchOptions {
  /** Minimum overall score (0 to 1) to count as a match. Default 0.55. */
  threshold?: number;
  /** Maximum matches returned, best first. Default 3. */
  limit?: number;
}

export interface Match<TCandidate> {
  candidate: TCandidate;
  /** Weighted overall score, 0 to 1. */
  score: number;
  /** Plain-language reasons, in criteria order. */
  reasons: string[];
  /** Per-criterion scores, keyed by `Criterion.key`. Handy for debugging and tuning. */
  breakdown: Record<string, number>;
}

export const DEFAULT_MATCH_THRESHOLD = 0.55;
export const DEFAULT_MATCH_LIMIT = 3;

const clamp01 = (n: number) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);

/** Score one pair. Null when any criterion rules it out. */
export function scorePair<TRequest, TCandidate>(
  request: TRequest,
  candidate: TCandidate,
  criteria: readonly Criterion<TRequest, TCandidate>[],
): Omit<Match<TCandidate>, "candidate"> | null {
  const totalWeight = criteria.reduce((sum, c) => sum + Math.max(c.weight, 0), 0);
  if (totalWeight === 0) return null;

  let weighted = 0;
  const reasons: string[] = [];
  const breakdown: Record<string, number> = {};

  for (const criterion of criteria) {
    const raw = criterion.score(request, candidate);
    if (raw === null) return null;
    const value = clamp01(raw);
    breakdown[criterion.key] = value;
    weighted += value * Math.max(criterion.weight, 0);
    const reason = criterion.explain?.(request, candidate, value);
    if (reason) reasons.push(reason);
  }

  return { score: weighted / totalWeight, reasons, breakdown };
}

/** Candidates at or above the threshold, best first, capped at `limit`. */
export function rankMatches<TRequest, TCandidate>(
  request: TRequest,
  candidates: readonly TCandidate[],
  criteria: readonly Criterion<TRequest, TCandidate>[],
  { threshold = DEFAULT_MATCH_THRESHOLD, limit = DEFAULT_MATCH_LIMIT }: MatchOptions = {},
): Match<TCandidate>[] {
  const matches: Match<TCandidate>[] = [];
  for (const candidate of candidates) {
    const result = scorePair(request, candidate, criteria);
    if (result && result.score >= threshold) matches.push({ candidate, ...result });
  }
  return matches.sort((a, b) => b.score - a.score).slice(0, Math.max(limit, 0));
}

export * from "./scorers";
