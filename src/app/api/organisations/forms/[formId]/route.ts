import { NextResponse } from 'next/server';
import { requireOrgSession, resolveOrgForm, jsonOk, jsonError } from '@/lib/forms/api-helpers';
import {
  updateForm,
  deleteFormCascade,
  withCompletionRate,
  type FormRecord,
  type FormStatus,
} from '@/lib/forms/strapi-forms';
import { safeParseFormSchema } from '@/lib/forms/validator';
import { sanitizeFormSchema } from '@/lib/forms/sanitize';
import { isInputBlock, type FormSchema } from '@/lib/forms/schema';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ formId: string }> };

/** Full shape for the builder — uid as id, plus the schema. No numeric id. */
function serialize(form: FormRecord) {
  return {
    id: form.uid,
    title: form.title,
    schema: form.schema,
    form_status: form.status,
    start_date: form.startDate,
    end_date: form.endDate,
    stats: withCompletionRate(form.stats),
    updatedAt: form.updatedAt,
  };
}

function schemaHasInputBlock(schema: FormSchema): boolean {
  return schema.pages.some((p) => p.blocks.some((b) => isInputBlock(b)));
}

/** GET — full form (incl. schema) for the builder. */
export async function GET(_req: Request, ctx: RouteContext) {
  try {
    const org = await requireOrgSession();
    if (org instanceof NextResponse) return org;
    const { formId } = await ctx.params;

    const form = await resolveOrgForm(formId, org.organisationId);
    if (form instanceof NextResponse) return form;

    return jsonOk(serialize(form));
  } catch (err) {
    console.error('GET /api/organisations/forms/[formId] failed:', err);
    return jsonError('Failed to load form', 500);
  }
}

/**
 * Shared save logic for PUT and the sendBeacon POST alias (`?beacon=1`).
 * Validates + sanitizes the schema, enforces the "no activating an empty form"
 * rule, and persists. Invalidates the form's cache tag via updateForm.
 */
async function saveForm(request: Request, ctx: RouteContext) {
  const org = await requireOrgSession();
  if (org instanceof NextResponse) return org;
  const { formId } = await ctx.params;

  const form = await resolveOrgForm(formId, org.organisationId);
  if (form instanceof NextResponse) return form;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return jsonError('Invalid request body', 400);

  const patch: {
    title?: string;
    schema?: FormSchema;
    form_status?: FormStatus;
    start_date?: string | null;
    end_date?: string | null;
  } = {};

  let nextSchema = form.schema;

  if (body.schema !== undefined) {
    const parsed = safeParseFormSchema(body.schema);
    if (!parsed.ok) return jsonError(`Invalid form schema: ${parsed.error}`, 400);
    nextSchema = sanitizeFormSchema(parsed.schema);
    patch.schema = nextSchema;
  }

  if (typeof body.title === 'string') {
    const title = body.title.trim();
    if (!title) return jsonError('Title cannot be empty', 400);
    patch.title = title;
  }

  if (body.form_status !== undefined) {
    const status = body.form_status;
    if (!['draft', 'active', 'inactive'].includes(status)) {
      return jsonError('Invalid status', 400);
    }
    if (status === 'active' && !schemaHasInputBlock(nextSchema)) {
      return jsonError('Add at least one question before activating the form', 400);
    }
    patch.form_status = status;
  }

  if (body.start_date !== undefined) patch.start_date = body.start_date || null;
  if (body.end_date !== undefined) patch.end_date = body.end_date || null;

  const updated = await updateForm(form.id, form.uid, patch);
  if (!updated) return jsonError('Failed to save form', 500);
  return jsonOk(serialize(updated));
}

/** PUT — save schema / settings / title / status / dates. */
export async function PUT(request: Request, ctx: RouteContext) {
  try {
    return await saveForm(request, ctx);
  } catch (err) {
    console.error('PUT /api/organisations/forms/[formId] failed:', err);
    return jsonError('Failed to save form', 500);
  }
}

/**
 * POST — sendBeacon alias for PUT. The builder flushes unsaved changes on tab
 * close via `navigator.sendBeacon(...?beacon=1)`, which can only POST.
 */
export async function POST(request: Request, ctx: RouteContext) {
  const url = new URL(request.url);
  if (url.searchParams.get('beacon') !== '1') {
    return jsonError('Method not allowed', 405);
  }
  try {
    return await saveForm(request, ctx);
  } catch (err) {
    console.error('POST(beacon) /api/organisations/forms/[formId] failed:', err);
    return jsonError('Failed to save form', 500);
  }
}

/** DELETE — only when no submissions exist; cascades responses + Cloudinary. */
export async function DELETE(_req: Request, ctx: RouteContext) {
  try {
    const org = await requireOrgSession();
    if (org instanceof NextResponse) return org;
    const { formId } = await ctx.params;

    const form = await resolveOrgForm(formId, org.organisationId);
    if (form instanceof NextResponse) return form;

    if (form.stats.submissionCount > 0) {
      return jsonError('This form has submissions — set it to inactive instead of deleting', 409);
    }

    await deleteFormCascade(form);
    return jsonOk({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/organisations/forms/[formId] failed:', err);
    return jsonError('Failed to delete form', 500);
  }
}
