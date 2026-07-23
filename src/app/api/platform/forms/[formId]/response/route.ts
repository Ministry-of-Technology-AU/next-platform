import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { jsonOk, jsonError, rateLimit } from '@/lib/forms/api-helpers';
import { getUserIdByEmail } from '@/lib/userid';
import {
  getFormByUid,
  getFormByUidCached,
  isFormActive,
  getResponseRow,
  createResponseRow,
  updateResponseRow,
  bumpStats,
} from '@/lib/forms/strapi-forms';
import { buildResponseValidator } from '@/lib/forms/validator';
import { visibleInputBlockIds } from '@/lib/forms/conditions';
import { sanitizeResponseRichText } from '@/lib/forms/sanitize';
import { isInputBlock, FORM_LIMITS, type FormSchema } from '@/lib/forms/schema';
import { sendResponseEmail } from '@/lib/forms/email';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ formId: string }> };

/** Keep only keys that correspond to an input block in the schema. */
function stripToInputBlocks(
  schema: FormSchema,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const ids = new Set<string>();
  for (const page of schema.pages) {
    for (const block of page.blocks) {
      if (isInputBlock(block)) ids.add(block.id);
    }
  }
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data ?? {})) {
    if (ids.has(key)) clean[key] = value;
  }
  return clean;
}

/** GET — the caller's own row (draft or submitted). */
export async function GET(_req: Request, ctx: RouteContext) {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) return jsonError('User not authenticated', 401);

    const { formId } = await ctx.params;
    const form = await getFormByUidCached(formId);
    if (!form) return jsonError('Form not found', 404);

    const row = await getResponseRow(form.id, email);
    if (!row) return jsonOk({ state: null });

    return jsonOk({ state: row.state, data: row.data, lastSavedAt: row.lastSavedAt });
  } catch (err) {
    console.error('GET response failed:', err);
    return jsonError('Failed to load response', 500);
  }
}

/**
 * POST — draft save. Must accept `sendBeacon` payloads: read raw text and
 * tolerate `text/plain` (spec §7.2). Strips unknown keys, caps body size,
 * rejects if already submitted or the form is inactive.
 */
export async function POST(request: Request, ctx: RouteContext) {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) return jsonError('User not authenticated', 401);

    const { formId } = await ctx.params;
    if (!rateLimit(`draft:${email}:${formId}`, 30, 60_000)) {
      return jsonError('Too many requests', 429);
    }

    const raw = await request.text();
    if (raw.length > FORM_LIMITS.draftBodyBytes) return jsonError('Draft is too large', 413);

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw || '{}');
    } catch {
      return jsonError('Invalid JSON', 400);
    }
    const data = (parsed as { data?: Record<string, unknown> })?.data ?? {};

    const form = await getFormByUidCached(formId);
    if (!form || !isFormActive(form)) return jsonError('Form not found', 404);

    const row = await getResponseRow(form.id, email);
    if (row?.state === 'submitted') return jsonError('Response already submitted', 409);

    const clean = stripToInputBlocks(form.schema, data);
    const now = new Date().toISOString();

    if (!row) {
      const userId = await getUserIdByEmail(email);
      await createResponseRow({ formId: form.id, userId, email, data: clean });
      await bumpStats(form, (s) => ({
        ...s,
        uniqueVisits: s.uniqueVisits + 1,
        draftCount: s.draftCount + 1,
      }));
    } else {
      await updateResponseRow(row.id, { data: clean, last_saved_at: now });
    }

    return jsonOk({ saved: true, lastSavedAt: now });
  } catch (err) {
    console.error('POST draft failed:', err);
    return jsonError('Failed to save draft', 500);
  }
}

/**
 * PUT — final submit. Server re-runs the condition engine and the response
 * validator, sanitizes rich-text answers, locks the row (one per user), bumps
 * stats, and fires the confirmation email (non-blocking). Spec §7.2.
 */
export async function PUT(request: Request, ctx: RouteContext) {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) return jsonError('User not authenticated', 401);

    const { formId } = await ctx.params;
    if (!rateLimit(`submit:${email}:${formId}`, 5, 60_000)) {
      return jsonError('Too many requests', 429);
    }

    const body = await request.json().catch(() => null);
    const data = (body as { data?: Record<string, unknown> })?.data ?? {};

    // Uncached read so an org's "set inactive" is honoured immediately.
    const form = await getFormByUid(formId);
    if (!form || !isFormActive(form)) return jsonError('Form not found', 404);

    const existing = await getResponseRow(form.id, email);
    if (existing?.state === 'submitted') {
      return jsonError('alreadySubmitted', 409);
    }

    const visibleIds = visibleInputBlockIds(form.schema, data);
    const validate = buildResponseValidator(form.schema);
    const result = validate(data, visibleIds);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: 'Some answers need fixing', errors: result.errors },
        { status: 400 },
      );
    }

    const cleanData = sanitizeResponseRichText(form.schema, result.data);
    const now = new Date().toISOString();

    if (!existing) {
      const userId = await getUserIdByEmail(email);
      await createResponseRow({
        formId: form.id,
        userId,
        email,
        data: cleanData,
        state: 'submitted',
        submittedAt: now,
      });
      await bumpStats(form, (s) => ({
        ...s,
        uniqueVisits: s.uniqueVisits + 1,
        submissionCount: s.submissionCount + 1,
        lastSubmissionAt: now,
      }));
    } else {
      await updateResponseRow(existing.id, {
        data: cleanData,
        state: 'submitted',
        submitted_at: now,
        last_saved_at: now,
      });
      await bumpStats(form, (s) => ({
        ...s,
        draftCount: Math.max(0, s.draftCount - 1),
        submissionCount: s.submissionCount + 1,
        lastSubmissionAt: now,
      }));
    }

    // Confirmation email — never let a mail failure affect the submit response.
    if (form.schema.settings.sendEmailCopy) {
      void sendResponseEmail(form, email, cleanData).catch((e) =>
        console.error('Confirmation email failed:', e),
      );
    }

    return jsonOk({
      submitted: true,
      confirmation: {
        title: form.schema.settings.confirmationTitle,
        html: form.schema.settings.confirmationHtml,
      },
    });
  } catch (err) {
    console.error('PUT submit failed:', err);
    return jsonError('Failed to submit response', 500);
  }
}
