/**
 * In-memory rate limiter shared by middleware (the global /api limit) and
 * route handlers (tighter per-route limits). See .agents/context/backend.md §7.
 *
 * Per process: correct for our one Next process on one box. If we ever run
 * more than one (pm2 cluster mode), limits become per process and need a
 * shared store.
 *
 * Sliding-window counter: two counters per key instead of a list of
 * timestamps, so memory per key is constant however high the limit is.
 */

import { NextResponse } from 'next/server';

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the caller should retry. 0 when `ok`. */
  retryAfter: number;
}

interface Entry {
  windowStart: number;
  windowMs: number;
  prev: number;
  curr: number;
}

// ~100 B per entry → 10k keys ≈ 1 MB. Oldest key is evicted past the cap.
const MAX_KEYS = 10_000;
const entries = new Map<string, Entry>();

export function checkRateLimit(key: string, rule: RateLimitRule): RateLimitResult {
  const now = Date.now();
  let entry = entries.get(key);

  if (!entry || entry.windowMs !== rule.windowMs) {
    entry = { windowStart: now, windowMs: rule.windowMs, prev: 0, curr: 0 };
  } else {
    const elapsed = now - entry.windowStart;
    if (elapsed >= rule.windowMs) {
      const windows = Math.floor(elapsed / rule.windowMs);
      entry.prev = windows === 1 ? entry.curr : 0;
      entry.curr = 0;
      entry.windowStart += windows * rule.windowMs;
    }
  }

  // Re-insert so Map order tracks recency; the first key is the least recent.
  entries.delete(key);
  entries.set(key, entry);
  if (entries.size > MAX_KEYS) {
    const oldest = entries.keys().next().value;
    if (oldest !== undefined) entries.delete(oldest);
  }

  const intoWindow = now - entry.windowStart;
  const weight = 1 - intoWindow / rule.windowMs;
  const estimated = entry.prev * weight + entry.curr;

  if (estimated >= rule.limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((rule.windowMs - intoWindow) / 1000)) };
  }

  entry.curr += 1;
  return { ok: true, retryAfter: 0 };
}

/** The standard 429 body, in the `{ success, error }` envelope, with `Retry-After`. */
export function tooManyRequests(retryAfter: number, message?: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message ?? `Too many requests. Try again in ${retryAfter} seconds.`,
    },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  );
}

// ---------------------------------------------------------------------------
// Global /api limits, applied in src/middleware.ts before any handler runs.
// Keyed by session email, so students behind the campus NAT don't share a
// bucket. Server components calling lib functions directly never count.
// ---------------------------------------------------------------------------

const MINUTE = 60_000;

export const API_LIMITS = {
  /** GET / HEAD per signed-in user. Covers page self-fetches and client reads. */
  read: { limit: 180, windowMs: MINUTE },
  /** POST / PUT / PATCH / DELETE per signed-in user. */
  write: { limit: 60, windowMs: MINUTE },
  /** Writes to routes that send email, per signed-in user. */
  mail: { limit: 10, windowMs: MINUTE },
  /** Any /api call without a session, per client IP. */
  anonymous: { limit: 60, windowMs: MINUTE },
} as const satisfies Record<string, RateLimitRule>;

/**
 * Routes whose writes send email. Prefix match. Add a route here when it
 * starts sending mail on a user action.
 */
const MAIL_ROUTES = [
  '/api/platform/rti',
  '/api/platform/feedback',
  '/api/platform/wifi-tickets',
  '/api/platform/inductions/grievance',
  '/api/platform/games/wordle/friends',
  '/api/platform/sg-compose/dashboard',
  '/api/organisations/ads/submit',
];

/**
 * Public /api endpoints that skip the global limit. Webhooks are
 * bearer-protected and Strapi can burst on bulk edits; an EventSource that
 * gets a 429 stops reconnecting for good, so SSE needs connection caps
 * instead (realtime.md §4.8).
 */
const EXEMPT_PREFIXES = [
  '/api/auth',
  '/api/revalidate',
  '/api/platform/sports/apl/webhook',
  '/api/platform/sports/aba/webhook',
  '/api/platform/sports/apl/sse',
  '/api/platform/sports/aba/sse',
];

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * The client IP as nginx saw it. nginx sets `X-Real-IP` to `$remote_addr`;
 * without it, the last `X-Forwarded-For` hop is the one our proxy appended.
 * The first hop is client-controlled and never trusted.
 */
function clientIp(headers: Headers): string {
  const real = headers.get('x-real-ip')?.trim();
  if (real) return real;
  const hops = headers.get('x-forwarded-for')?.split(',').map((h) => h.trim()).filter(Boolean);
  return hops?.at(-1) ?? 'unknown';
}

/**
 * Applies the global limit to one /api request. Returns a 429 response when
 * the caller is over, or null to let the request through.
 */
export function limitApiRequest(
  pathname: string,
  method: string,
  headers: Headers,
  email: string | null | undefined,
): NextResponse | null {
  if (!pathname.startsWith('/api/')) return null;
  if (EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;

  if (!email) {
    const result = checkRateLimit(`api:anon:${clientIp(headers)}`, API_LIMITS.anonymous);
    return result.ok ? null : tooManyRequests(result.retryAfter);
  }

  const user = email.trim().toLowerCase();

  if (READ_METHODS.has(method)) {
    const result = checkRateLimit(`api:read:${user}`, API_LIMITS.read);
    return result.ok ? null : tooManyRequests(result.retryAfter);
  }

  if (MAIL_ROUTES.some((prefix) => pathname.startsWith(prefix))) {
    const mail = checkRateLimit(`api:mail:${user}`, API_LIMITS.mail);
    if (!mail.ok) {
      return tooManyRequests(
        mail.retryAfter,
        `You've sent a lot of requests that send email. Try again in ${mail.retryAfter} seconds.`,
      );
    }
  }

  const result = checkRateLimit(`api:write:${user}`, API_LIMITS.write);
  return result.ok ? null : tooManyRequests(result.retryAfter);
}

// Drop keys idle for two full windows, so a quiet period frees memory
// without waiting for the size cap.
if (typeof setInterval !== 'undefined') {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of entries) {
      if (now - entry.windowStart >= 2 * entry.windowMs) entries.delete(key);
    }
  }, 5 * MINUTE);
  (timer as { unref?: () => void }).unref?.();
}
