import 'server-only';

/**
 * Applicant notification emails for the induction pipeline — the mail behind
 * the "Send email to applicant" checkbox on advance / select / reject.
 *
 * Uses the same branded shell as the form-response copy so everything an
 * applicant receives from an organisation looks like one thread, and CCs the
 * organisation that owns the cycle on every message.
 */

import { sendMail } from '@/lib/apis/mail';
import { buildBrandedEmailHtml, getOrgDetails } from '@/lib/forms/email';
import { sanitizeHtml } from '@/lib/forms/sanitize';
import type { ApplicantStatus } from '@/app/organisations/inductions/_components/role-applicants';

/** Subject-line phrasing per outcome. */
const SUBJECT_BY_STATUS: Record<ApplicantStatus, string> = {
  pending: 'Application update',
  submitted: 'Application update',
  advanced: 'You are through to the next round',
  approved: 'Your application was successful',
  rejected: 'Update on your application',
};

export interface ApplicantEmailInput {
  /** Applicant's address — the sole `to` recipient. */
  to: string;
  organisationId: number | null;
  /** Outcome that triggered this email. */
  status: ApplicantStatus;
  /** Role the applicant applied for, shown in the header. */
  roleName?: string | null;
  /** Org-authored message body — raw HTML from the rich-text editor. */
  messageHtml: string;
}

/**
 * Sends one applicant notification. Resolves and CCs the organisation's own
 * addresses so the org keeps a record of what was sent on its behalf.
 * Throws on delivery failure so the caller can report it.
 */
export async function sendApplicantStatusEmail(input: ApplicantEmailInput): Promise<void> {
  const applicantEmail = input.to.trim();
  if (!applicantEmail.includes('@')) {
    throw new Error('A valid applicant email address is required');
  }

  const org = await getOrgDetails(input.organisationId);
  // The organisation's own address only — never its circle-1/circle-2 leads.
  const cc =
    org.email && org.email !== applicantEmail.toLowerCase() ? org.email : undefined;

  const heading = input.roleName
    ? `${input.roleName} — ${SUBJECT_BY_STATUS[input.status]}`
    : SUBJECT_BY_STATUS[input.status];

  const html = buildBrandedEmailHtml({
    heading,
    subheading: org.name,
    // Org-authored HTML reaches an applicant's inbox — sanitize before sending.
    bodyHtml: sanitizeHtml(input.messageHtml),
    footer: `Sent by ${org.name} via the Ashoka Platform induction pipeline. Reply to this email to reach the team directly.`,
  });

  await sendMail({
    to: applicantEmail,
    cc,
    replyTo: org.email ?? undefined,
    alias: org.name,
    subject: input.roleName
      ? `${SUBJECT_BY_STATUS[input.status]} — ${input.roleName}`
      : SUBJECT_BY_STATUS[input.status],
    html,
  });
}
