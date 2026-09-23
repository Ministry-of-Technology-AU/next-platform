import { NextResponse } from 'next/server';
import { requireOrgSession, jsonOk, jsonError } from '@/lib/forms/api-helpers';
import { listFormsByOrg, createForm, withCompletionRate, type FormRecord } from '@/lib/forms/strapi-forms';
import { FORM_LIMITS } from '@/lib/forms/schema';

export const dynamic = 'force-dynamic';

/** Summary shape sent to the org dashboard — uid as the public id, no numeric id. */
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

/** GET /api/organisations/forms — list the org's forms with stats. */
export async function GET() {
  try {
    const org = await requireOrgSession();
    if (org instanceof NextResponse) return org;

    const forms = await listFormsByOrg(org.organisationId);
    return jsonOk(forms.map(summarize));
  } catch (err) {
    console.error('GET /api/organisations/forms failed:', err);
    return jsonError('Failed to list forms', 500);
  }
}

/** POST /api/organisations/forms — create a blank draft form. */
export async function POST(request: Request) {
  try {
    const org = await requireOrgSession();
    if (org instanceof NextResponse) return org;

    const body = await request.json().catch(() => ({}));
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    if (!title) return jsonError('A form title is required', 400);
    if (title.length > FORM_LIMITS.maxTitleChars) return jsonError('Title is too long', 400);

    const form = await createForm(title, org.organisationId);
    return jsonOk(summarize(form), 201);
  } catch (err) {
    console.error('POST /api/organisations/forms failed:', err);
    return jsonError('Failed to create form', 500);
  }
}
