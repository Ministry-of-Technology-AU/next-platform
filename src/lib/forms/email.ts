import 'server-only';

/**
 * Confirmation email — a self-contained, inline-styled HTML copy of the
 * respondent's answers, sent from the submit handler (spec §12). No external
 * CSS, no webfonts, no CSS variables — email clients don't support them.
 */

import { format } from 'date-fns';
import { sendMail } from '@/lib/apis/mail';
import { strapiGet } from '@/lib/apis/strapi';
import { visiblePages, visibleBlocks } from './conditions';
import { isInputBlock, type FormResponseData, type FormSchema, type InputBlock, type FileDescriptor } from './schema';
import type { FormRecord } from './strapi-forms';

const ACCENT = '#87281b';
const TEXT = '#232020';
const MUTED = '#6b6560';
const BORDER = '#e5ddd3';
const FONT = 'Arial, Helvetica, sans-serif';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatAnswer(block: InputBlock, value: unknown): string {
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return `<span style="color:${MUTED}">—</span>`;
  }
  switch (block.type) {
    case 'checkbox':
      return value === true ? 'Yes' : 'No';
    case 'select':
      return escapeHtml(block.options.find((o) => o.value === value)?.label ?? String(value));
    case 'multi-select':
      return escapeHtml(
        (value as string[])
          .map((v) => block.options.find((o) => o.value === v)?.label ?? v)
          .join(', '),
      );
    case 'date':
      try {
        return format(new Date(value as string), 'PPP');
      } catch {
        return escapeHtml(String(value));
      }
    case 'datetime':
      try {
        return format(new Date(value as string), 'PPP p');
      } catch {
        return escapeHtml(String(value));
      }
    case 'file-upload':
      return (value as FileDescriptor[])
        .map(
          (f) =>
            `<a href="${escapeHtml(f.url)}" style="color:${ACCENT}">${escapeHtml(f.filename)}</a>`,
        )
        .join('<br>');
    case 'rich-text':
      // Already sanitized server-side before this point.
      return String(value);
    default:
      return escapeHtml(String(value)).replace(/\n/g, '<br>');
  }
}

/** Builds the full inline-styled HTML email body. */
export function buildResponseEmailHtml(
  formTitle: string,
  orgName: string,
  schema: FormSchema,
  data: FormResponseData,
  applicantEmail?: string,
): string {
  const rows: InputBlock[] = [];
  for (const page of visiblePages(schema, data)) {
    for (const block of visibleBlocks(page, data)) {
      if (isInputBlock(block)) rows.push(block);
    }
  }

  const rowsHtml = rows
    .map(
      (block) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid ${BORDER};vertical-align:top;width:40%;color:${MUTED};font-size:14px;">${escapeHtml(
            block.title,
          )}</td>
          <td style="padding:12px 0 12px 16px;border-bottom:1px solid ${BORDER};vertical-align:top;color:${TEXT};font-size:14px;">${formatAnswer(
            block,
            data[block.id],
          )}</td>
        </tr>`,
    )
    .join('');

  const submittedAt = format(new Date(), 'PPP p');

  return `
  <div style="background:#faf7f2;padding:24px 0;font-family:${FONT};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">
      <tr>
        <td style="background:${ACCENT};padding:20px 28px;">
          <div style="color:#ffffff;font-size:18px;font-weight:bold;">${escapeHtml(formTitle)}</div>
          <div style="color:#f7d9d3;font-size:13px;margin-top:2px;">${escapeHtml(orgName)}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 28px;">
          <p style="margin:0 0 16px;color:${TEXT};font-size:15px;">Here is a copy of the response${applicantEmail ? ` submitted by <strong>${escapeHtml(applicantEmail)}</strong>` : ''}.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 28px;background:#faf7f2;color:${MUTED};font-size:12px;">
          Submitted ${submittedAt} · This is a copy of the response.
        </td>
      </tr>
    </table>
  </div>`;
}

export interface OrgEmailDetails {
  name: string;
  emails: string[];
}

/** Fetches organisation name and associated notification email addresses. */
export async function getOrgDetails(organisationId: number | null): Promise<OrgEmailDetails> {
  if (!organisationId) return { name: 'Ashoka University', emails: [] };
  try {
    const res = await strapiGet(`/organisations/${organisationId}`, {
      fields: ['name', 'email'],
      populate: {
        profile: { fields: ['email', 'username'] },
        circle1_humans: { fields: ['email', 'username'] },
      },
    });
    const entry = res?.data ?? res;
    const a = entry?.attributes ?? entry ?? {};
    const name = a.name ?? 'Ashoka University';
    const emailSet = new Set<string>();

    const addEmail = (raw: unknown) => {
      if (typeof raw === 'string') {
        const trimmed = raw.trim().toLowerCase();
        if (trimmed.includes('@') && !emailSet.has(trimmed)) {
          emailSet.add(trimmed);
        }
      }
    };

    // Direct email field on organisation record
    addEmail(a.email);

    // Profile relation (official club/org account)
    const profileData = a.profile?.data ?? a.profile;
    if (Array.isArray(profileData)) {
      for (const p of profileData) {
        addEmail(p?.attributes?.email ?? p?.email);
      }
    } else if (profileData) {
      addEmail(profileData?.attributes?.email ?? profileData?.email);
    }

    // Circle 1 humans (leads / core team)
    const circle1Data = a.circle1_humans?.data ?? a.circle1_humans;
    if (Array.isArray(circle1Data)) {
      for (const c of circle1Data) {
        addEmail(c?.attributes?.email ?? c?.email);
      }
    } else if (circle1Data) {
      addEmail(circle1Data?.attributes?.email ?? circle1Data?.email);
    }

    return {
      name,
      emails: Array.from(emailSet),
    };
  } catch (err) {
    console.error('Failed to get organisation details for email:', err);
    return { name: 'Ashoka University', emails: [] };
  }
}

/** Sends the response email to the organisation(s) associated with the form,
 *  with the respondent/applicant CC'd. Falls back to sending directly to the
 *  applicant if no org emails are found. */
export async function sendResponseEmail(
  form: FormRecord,
  email: string,
  data: FormResponseData,
): Promise<void> {
  const orgDetails = await getOrgDetails(form.organisationId);
  const orgName = orgDetails.name;
  const orgEmails = orgDetails.emails;
  const html = buildResponseEmailHtml(form.title, orgName, form.schema, data, email);

  if (orgEmails.length > 0) {
    await sendMail({
      to: orgEmails,
      cc: email,
      replyTo: email,
      alias: orgName,
      subject: `Response: ${form.title} — ${email}`,
      html,
    });
  } else {
    // Fallback: If no organisation emails are resolved, deliver to the applicant directly.
    await sendMail({
      to: email,
      alias: orgName,
      subject: `Your response: ${form.title}`,
      html,
    });
  }
}
