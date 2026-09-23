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

/**
 * The shared inline-styled shell every form/induction email uses: accent
 * header with the form or round name, the organisation underneath, body, and a
 * muted footer strip.
 */
export function buildBrandedEmailHtml(options: {
  heading: string;
  subheading: string;
  bodyHtml: string;
  footer?: string;
}): string {
  return `
  <div style="background:#faf7f2;padding:24px 0;font-family:${FONT};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">
      <tr>
        <td style="background:${ACCENT};padding:20px 28px;">
          <div style="color:#ffffff;font-size:18px;font-weight:bold;">${escapeHtml(options.heading)}</div>
          <div style="color:#f7d9d3;font-size:13px;margin-top:2px;">${escapeHtml(options.subheading)}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 28px;color:${TEXT};font-size:15px;line-height:1.6;">${options.bodyHtml}</td>
      </tr>${
        options.footer
          ? `
      <tr>
        <td style="padding:16px 28px;background:#faf7f2;color:${MUTED};font-size:12px;">
          ${escapeHtml(options.footer)}
        </td>
      </tr>`
          : ''
      }
    </table>
  </div>`;
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

  return buildBrandedEmailHtml({
    heading: formTitle,
    subheading: orgName,
    bodyHtml: `
          <p style="margin:0 0 16px;color:${TEXT};font-size:15px;">Here is a copy of the response${applicantEmail ? ` submitted by <strong>${escapeHtml(applicantEmail)}</strong>` : ''}.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table>`,
    footer: `Submitted ${submittedAt} · This is a copy of the response.`,
  });
}

export interface OrgEmailDetails {
  name: string;
  /**
   * The organisation's OWN address, taken from its `profile` account relation.
   * Deliberately a single address rather than a list: `circle1_humans` /
   * `circle2_humans` are individual leads, not the organisation, and must never
   * be copied on applicant mail.
   */
  email: string | null;
}

/** First valid-looking address in the organisation's profile relation. */
function profileEmail(orgAttrs: any): string | null {
  const rel = orgAttrs?.profile?.data ?? orgAttrs?.profile;
  const entries = Array.isArray(rel) ? rel : rel ? [rel] : [];
  for (const entry of entries) {
    const raw = entry?.attributes?.email ?? entry?.email;
    if (typeof raw !== 'string') continue;
    const trimmed = raw.trim().toLowerCase();
    if (trimmed.includes('@')) return trimmed;
  }
  return null;
}

/** Fetches the organisation's display name and its own notification address. */
export async function getOrgDetails(organisationId: number | null): Promise<OrgEmailDetails> {
  if (!organisationId) {
    console.warn('[forms/email] No organisationId on the form — cannot CC the organisation.');
    return { name: 'Ashoka University', email: null };
  }
  try {
    // NOTE: do not add a top-level `fields` here. The organisation type has no
    // `email` attribute (the address lives on `profile`), and asking for one
    // makes Strapi reject the whole request with 400 "Invalid parameter email"
    // — which previously threw into the catch below and silently dropped the CC.
    const res = await strapiGet(`/organisations/${organisationId}`, {
      populate: { profile: { fields: ['email', 'username'] } },
    });
    const entry = res?.data ?? res;
    const a = entry?.attributes ?? entry ?? {};
    const name = a.name ?? 'Ashoka University';
    const email = profileEmail(a);

    if (!email) {
      console.warn(
        `[forms/email] Organisation ${organisationId} (${name}) has no profile account with an email — nothing to CC.`,
      );
    }

    return { name, email };
  } catch (err) {
    console.error('Failed to get organisation details for email:', organisationId, err);
    return { name: 'Ashoka University', email: null };
  }
}

/**
 * Sends the submitted response to the applicant, with the organisation that
 * owns the form CC'd so it receives every application as it comes in.
 */
export async function sendResponseEmail(
  form: FormRecord,
  email: string,
  data: FormResponseData,
): Promise<void> {
  const { name: orgName, email: orgEmail } = await getOrgDetails(form.organisationId);
  // Never CC the respondent's own address back to them.
  const cc = orgEmail && orgEmail !== email.trim().toLowerCase() ? orgEmail : undefined;
  const html = buildResponseEmailHtml(form.title, orgName, form.schema, data, email);

  await sendMail({
    to: email,
    cc,
    replyTo: orgEmail ?? undefined,
    alias: orgName,
    subject: `Your response: ${form.title}`,
    html,
  });
}
