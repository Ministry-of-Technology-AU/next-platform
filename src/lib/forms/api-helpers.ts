import 'server-only';

/**
 * Shared helpers for the form-builder API routes: auth/ownership guards, an
 * in-memory rate limiter, and small response utilities. See spec §7, §14.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserIdByEmail, getOrganisationIdByUserId } from '@/lib/userid';
import { getFormByUid, type FormRecord } from './strapi-forms';

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function jsonError(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

export interface OrgSession {
  email: string;
  userId: number;
  organisationId: number;
}

/**
 * Resolves the authenticated organisation account from the session only.
 * Returns an error NextResponse on failure. Never trusts client-supplied ids.
 */
export async function requireOrgSession(): Promise<OrgSession | NextResponse> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return jsonError('User not authenticated', 401);

  const access = session?.user?.access ?? [];
  const role = session?.user?.role;
  if (role !== 'organization' && !access.includes('organization')) {
    return jsonError('Organisation access required', 403);
  }

  const userId = await getUserIdByEmail(email);
  if (!userId) return jsonError('User not found in system', 404);

  const organisationId = await getOrganisationIdByUserId(userId);
  if (!organisationId) {
    return jsonError('You must be part of an organisation to manage forms', 403);
  }

  return { email, userId, organisationId };
}

/**
 * Loads a form by uid and verifies it belongs to `organisationId`.
 * 404 when the form does not exist; 403 when it belongs to another org — the
 * two are distinguishable to the owning org (unlike the anonymous filler path).
 */
export async function resolveOrgForm(
  uid: string,
  organisationId: number,
): Promise<FormRecord | NextResponse> {
  const form = await getFormByUid(uid);
  if (!form) return jsonError('Form not found', 404);
  if (form.organisationId !== organisationId) return jsonError('Forbidden', 403);
  return form;
}

// ---------------------------------------------------------------------------
// Rate limiting (spec §14.11) — simple per-instance sliding window.
// Documented as best-effort / per-instance; not a distributed limiter.
// ---------------------------------------------------------------------------

const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const since = now - windowMs;
  const hits = (buckets.get(key) ?? []).filter((t) => t > since);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

// Periodically drop empty buckets to bound memory.
if (typeof setInterval !== 'undefined') {
  const CLEAN_MS = 10 * 60 * 1000;
  const timer = setInterval(() => {
    const cutoff = Date.now() - CLEAN_MS;
    for (const [key, hits] of buckets) {
      const live = hits.filter((t) => t > cutoff);
      if (live.length === 0) buckets.delete(key);
      else buckets.set(key, live);
    }
  }, CLEAN_MS);
  // Do not keep the event loop alive for this housekeeping timer.
  (timer as { unref?: () => void }).unref?.();
}

// ---------------------------------------------------------------------------
// CSV (spec §7.1, §14.9) — RFC-4180 quoting + formula-injection guard.
// ---------------------------------------------------------------------------

export function csvEscape(value: unknown): string {
  let s = value == null ? '' : String(value);
  // Neutralise spreadsheet formula injection.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}
