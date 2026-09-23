import { NextResponse } from 'next/server';
import { requireOrgSession, resolveOrgForm, jsonOk, jsonError } from '@/lib/forms/api-helpers';
import { duplicateForm, withCompletionRate, type FormRecord } from '@/lib/forms/strapi-forms';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ formId: string }> };

function summarize(form: FormRecord) {
  return {
    id: form.uid,
    title: form.title,
    form_status: form.status,
    start_date: form.startDate,
    end_date: form.endDate,
    stats: withCompletionRate(form.stats),
    updatedAt: form.updatedAt,
  };
}

/** POST /api/organisations/forms/[formId]/duplicate — clone a form with its schema. */
export async function POST(request: Request, ctx: RouteContext) {
  try {
    const org = await requireOrgSession();
    if (org instanceof NextResponse) return org;
    const { formId } = await ctx.params;

    const sourceForm = await resolveOrgForm(formId, org.organisationId);
    if (sourceForm instanceof NextResponse) return sourceForm;

    const body = await request.json().catch(() => ({}));
    const customTitle = typeof body?.title === 'string' && body.title.trim() ? body.title.trim() : undefined;

    const duplicated = await duplicateForm(sourceForm.id, org.organisationId, customTitle);
    return jsonOk(summarize(duplicated), 201);
  } catch (err: any) {
    console.error('POST /api/organisations/forms/[formId]/duplicate failed:', err);
    return jsonError(err?.message || 'Failed to duplicate form', 500);
  }
}
