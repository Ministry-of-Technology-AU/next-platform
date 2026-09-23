import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { jsonOk, jsonError } from '@/lib/forms/api-helpers';
import { getFormByUidCached, isFormActive, hasExpired, flipToInactive } from '@/lib/forms/strapi-forms';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ formId: string }> };

/**
 * GET /api/platform/forms/[formId]
 * Public (logged-in) fetch of an ACTIVE form's renderable payload. Returns an
 * identical 404 for missing / draft / expired forms so forms cannot be
 * enumerated (spec §14.10). Served through the tagged unstable_cache.
 */
export async function GET(_req: Request, ctx: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.email) return jsonError('User not authenticated', 401);

    const { formId } = await ctx.params;
    const form = await getFormByUidCached(formId);
    if (!form) return jsonError('Form not found', 404);

    // Lazily persist inactive status for an expired form (housekeeping) then 404.
    if (hasExpired(form)) {
      await flipToInactive(form);
      return jsonError('Form not found', 404);
    }
    if (!isFormActive(form)) return jsonError('Form not found', 404);

    return jsonOk({
      form: { title: form.title, schema: form.schema, endDate: form.endDate },
    });
  } catch (err) {
    console.error('GET /api/platform/forms/[formId] failed:', err);
    return jsonError('Failed to load form', 500);
  }
}
