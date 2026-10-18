import 'server-only';

/**
 * "Request received" email for Borrow Assets. Goes to the borrower with the lending team
 * CC'd and set as reply-to, so approval and pickup happen by replying on the same thread.
 * Uses the platform's branded shell so it looks like every other platform email.
 */

import { sendMail } from '@/lib/apis/mail';
import { getOptimizedImageUrl } from '@/lib/apis/cloudinary-url';
import {
  buildBrandedEmailHtml,
  escapeHtml,
  EMAIL_ACCENT,
  EMAIL_BORDER,
  EMAIL_MUTED,
  EMAIL_TEXT,
} from '@/lib/forms/email';
import { formatISTDate } from '@/lib/date-utils';
import type { AssetOwner } from '@/app/platform/borrow-assets/types';
import { OWNER_CONTACTS } from './policy';

export interface BorrowRequestEmailInput {
  /** Borrower's address, from the session. */
  to: string;
  assetName: string;
  assetModel: string | null;
  assetImageUrl: string | null;
  owner: AssetOwner;
  /** YYYY-MM-DD */
  from: string;
  /** YYYY-MM-DD */
  returnBy: string;
  reason: string;
  /** 10-digit Indian mobile number. */
  phone: string;
}

function displayDate(date: string): string {
  return formatISTDate(date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function detailRow(label: string, valueHtml: string): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${EMAIL_BORDER};vertical-align:top;width:36%;color:${EMAIL_MUTED};font-size:14px;">${escapeHtml(label)}</td>
      <td style="padding:10px 0 10px 16px;border-bottom:1px solid ${EMAIL_BORDER};vertical-align:top;color:${EMAIL_TEXT};font-size:14px;">${valueHtml}</td>
    </tr>`;
}

export function buildBorrowRequestEmailHtml(input: BorrowRequestEmailInput): string {
  const { team, email: teamEmail } = OWNER_CONTACTS[input.owner];
  const returnBy = displayDate(input.returnBy);

  // Email clients don't negotiate formats, so ask Cloudinary for a plain JPEG.
  const thumb = input.assetImageUrl
    ? `<img src="${escapeHtml(
        getOptimizedImageUrl(input.assetImageUrl, { width: 240, height: 180, crop: 'fill', format: 'jpg' }),
      )}" width="120" height="90" alt="${escapeHtml(input.assetName)}" style="display:block;border-radius:8px;border:1px solid ${EMAIL_BORDER};object-fit:cover;" />`
    : '';

  const item = `<strong>${escapeHtml(input.assetName)}</strong>${
    input.assetModel ? `<br><span style="color:${EMAIL_MUTED};font-size:13px;">${escapeHtml(input.assetModel)}</span>` : ''
  }`;

  const steps = [
    `Someone from ${escapeHtml(team)} reads your request and replies to this email to approve it.`,
    'You agree on a pickup time in the same thread.',
    `You return it by <strong>${escapeHtml(returnBy)}</strong>, in the condition you got it.`,
  ]
    .map((step) => `<li style="margin:0 0 6px;">${step}</li>`)
    .join('');

  const bodyHtml = `
    <p style="margin:0 0 16px;">Hi,</p>
    <p style="margin:0 0 20px;">We've got your request to borrow <strong>${escapeHtml(input.assetName)}</strong>. It isn't approved yet. ${escapeHtml(team)} will reply here once it is.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        ${thumb ? `<td style="width:136px;vertical-align:top;padding:0 16px 0 0;">${thumb}</td>` : ''}
        <td style="vertical-align:top;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${detailRow('Item', item)}
            ${detailRow('Borrowing from', escapeHtml(displayDate(input.from)))}
            ${detailRow('Return by', `<strong>${escapeHtml(returnBy)}</strong>`)}
            ${detailRow('Contact', escapeHtml(`+91 ${input.phone}`))}
            ${detailRow('Purpose', escapeHtml(input.reason).replace(/\n/g, '<br>'))}
          </table>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;font-weight:bold;color:${EMAIL_ACCENT};">What happens next</p>
    <ol style="margin:0 0 20px;padding-left:20px;">${steps}</ol>
    <p style="margin:0;color:${EMAIL_MUTED};font-size:14px;">Need to change the date or cancel? Reply to this email, or write to <a href="mailto:${escapeHtml(teamEmail)}" style="color:${EMAIL_ACCENT};">${escapeHtml(teamEmail)}</a>.</p>`;

  return buildBrandedEmailHtml({
    heading: 'Borrow request received',
    subheading: `${input.assetName} · ${team}`,
    bodyHtml,
    footer: `Sent by ${team} through Borrow Assets on the Ashoka Platform. Replies go to ${teamEmail}.`,
  });
}

/** Plain-text twin for clients that don't render HTML, and for spam filters that like both. */
function buildBorrowRequestEmailText(input: BorrowRequestEmailInput): string {
  const { team, email: teamEmail } = OWNER_CONTACTS[input.owner];
  return [
    'Hi,',
    '',
    `We've got your request to borrow ${input.assetName}. It isn't approved yet. ${team} will reply here once it is.`,
    '',
    `Item: ${input.assetName}${input.assetModel ? ` (${input.assetModel})` : ''}`,
    `Borrowing from: ${displayDate(input.from)}`,
    `Return by: ${displayDate(input.returnBy)}`,
    `Contact: +91 ${input.phone}`,
    `Purpose: ${input.reason}`,
    '',
    'What happens next',
    `1. Someone from ${team} replies to this email to approve it.`,
    '2. You agree on a pickup time in the same thread.',
    `3. You return it by ${displayDate(input.returnBy)}, in the condition you got it.`,
    '',
    `Need to change the date or cancel? Reply to this email, or write to ${teamEmail}.`,
  ].join('\n');
}

/** Sends the confirmation. Throws on delivery failure so the caller can report it. */
export async function sendBorrowRequestEmail(input: BorrowRequestEmailInput): Promise<void> {
  const { team, email: teamEmail } = OWNER_CONTACTS[input.owner];
  const borrower = input.to.trim().toLowerCase();

  await sendMail({
    to: borrower,
    cc: borrower === teamEmail ? undefined : teamEmail,
    replyTo: teamEmail,
    alias: team,
    subject: `Borrow request: ${input.assetName} (return by ${displayDate(input.returnBy)})`,
    html: buildBorrowRequestEmailHtml(input),
    text: buildBorrowRequestEmailText(input),
  });
}
