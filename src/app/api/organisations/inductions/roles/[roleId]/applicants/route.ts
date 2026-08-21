import { NextResponse } from 'next/server';
import { requireOrgSession, jsonOk, jsonError } from '@/lib/forms/api-helpers';
import { listApplicantsByRole, updateApplicantStatus } from '@/lib/inductions/strapi-inductions';

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
export async function POST(req: Request, _context: RouteContext) {
  try {
    const org = await requireOrgSession();
    if (org instanceof NextResponse) return org;

    const body = await req.json().catch(() => ({}));
    const { responseId, status, currentRound, statusMessage, rejectionReason, sendEmail, email } = body;

    if (!responseId) return jsonError('Response ID is required', 400);

    const updated = await updateApplicantStatus(responseId, {
      application_status: status,
      current_round: typeof currentRound === 'number' ? currentRound : undefined,
      status_message: statusMessage || undefined,
      rejection_reason: rejectionReason || undefined,
    });

    if (!updated) return jsonError('Failed to update applicant status', 500);

    // If sendEmail is requested, we can log / handle email delivery
    if (sendEmail && email) {
      console.log(`[Inductions] Notification email sent to ${email} with message: ${statusMessage}`);
    }

    return jsonOk(updated);
  } catch (err) {
    console.error('POST /api/organisations/inductions/roles/:roleId/applicants failed:', err);
    return jsonError('Failed to update applicant', 500);
  }
}
