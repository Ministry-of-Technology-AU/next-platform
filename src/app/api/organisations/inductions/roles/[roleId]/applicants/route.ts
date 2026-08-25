import { NextResponse } from 'next/server';
import { requireOrgSession, jsonOk, jsonError } from '@/lib/forms/api-helpers';
import { listApplicantsByRole, updateApplicantStatus, getRoleById } from '@/lib/inductions/strapi-inductions';
import { sendApplicantStatusEmail } from '@/lib/inductions/applicant-email';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ roleId: string }> };

/** GET /api/organisations/inductions/roles/:roleId/applicants */
export async function GET(_req: Request, context: RouteContext) {
  try {
    const org = await requireOrgSession();
    if (org instanceof NextResponse) return org;

    const { roleId } = await context.params;
    const applicants = await listApplicantsByRole(roleId);

    return jsonOk(applicants);
  } catch (err) {
    console.error('GET /api/organisations/inductions/roles/:roleId/applicants failed:', err);
    return jsonError('Failed to fetch applicants', 500);
  }
}

/** POST /api/organisations/inductions/roles/:roleId/applicants — update status / advance / reject */
export async function POST(req: Request, context: RouteContext) {
  try {
    const org = await requireOrgSession();
    if (org instanceof NextResponse) return org;

    const { roleId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const { responseId, status, currentRound, statusMessage, rejectionReason, sendEmail, email } = body;

    if (!responseId) return jsonError('Response ID is required', 400);

    // The accept/reject dialog is the only caller that asks for an email, and
    // it must carry the org's message. Quick stage moves send neither.
    if (sendEmail && !String(statusMessage ?? '').trim()) {
      return jsonError('An acceptance or rejection message is required', 400);
    }

    const updated = await updateApplicantStatus(responseId, {
      application_status: status,
      current_round: typeof currentRound === 'number' ? currentRound : undefined,
      status_message: statusMessage || undefined,
      rejection_reason: rejectionReason || undefined,
    });

    if (!updated) return jsonError('Failed to update applicant status', 500);

    // The status change is already persisted — report a mail failure back to
    // the org without pretending the whole action failed.
    let emailed = false;
    let emailError: string | null = null;

    if (sendEmail && email && statusMessage) {
      try {
        const role = await getRoleById(roleId).catch(() => null);
        await sendApplicantStatusEmail({
          to: email,
          organisationId: org.organisationId,
          status,
          roleName: role?.name ?? null,
          messageHtml: statusMessage,
        });
        emailed = true;
      } catch (mailErr) {
        console.error('[Inductions] Applicant notification email failed:', mailErr);
        emailError = mailErr instanceof Error ? mailErr.message : 'Failed to send email';
      }
    }

    return jsonOk({ ...updated, emailed, emailError });
  } catch (err) {
    console.error('POST /api/organisations/inductions/roles/:roleId/applicants failed:', err);
    return jsonError('Failed to update applicant', 500);
  }
}
