import { auth } from '@/auth';
import { jsonOk, jsonError, rateLimit } from '@/lib/forms/api-helpers';
import { getUserIdByEmail } from '@/lib/userid';
import {
  getFormByUidCached,
  isFormActive,
  getResponseRow,
  createResponseRow,
  bumpStats,
} from '@/lib/forms/strapi-forms';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ formId: string }> };

/**
 * POST /api/platform/forms/[formId]/visit
 * Idempotently records the caller's first visit: creates their draft row and
 * bumps uniqueVisits + draftCount exactly once (spec §7.2, §7.5). Safe to call
 * on every mount.
 */
export async function POST(_req: Request, ctx: RouteContext) {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) return jsonError('User not authenticated', 401);

    const { formId } = await ctx.params;
    if (!rateLimit(`visit:${email}:${formId}`, 30, 60_000)) {
      return jsonError('Too many requests', 429);
    }

    const form = await getFormByUidCached(formId);
    if (!form || !isFormActive(form)) return jsonError('Form not found', 404);

    const existing = await getResponseRow(form.id, email);
    if (existing) return jsonOk({ visited: true });

    const userId = await getUserIdByEmail(email);
    await createResponseRow({ formId: form.id, userId, email });
    await bumpStats(form, (s) => ({
      ...s,
      uniqueVisits: s.uniqueVisits + 1,
      draftCount: s.draftCount + 1,
    }));

    return jsonOk({ visited: true });
  } catch (err) {
    console.error('POST visit failed:', err);
    // A failed visit must never block filling — report but don't 500 loudly.
    return jsonError('Failed to record visit', 500);
  }
}
