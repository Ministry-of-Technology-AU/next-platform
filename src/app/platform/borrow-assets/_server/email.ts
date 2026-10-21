import 'server-only';

/**
 * Borrow Assets confirmation email — one shared builder, two brand configs.
 *
 * Techmin  → #c1121f red, Techmin CDN logo, cat-digging-in-box mascot, sendMail
 * Jazbaa   → #6b21a8 purple, Jazbaa logo, bijlee mascot, sendMailJazbaa
 *
 * The correct config is chosen automatically from asset.owner in
 * sendBorrowRequestEmail. No other call site needs to change.
 */

import { sendMail, sendMailJazbaa } from '@/lib/apis/mail';
import { getOptimizedImageUrl } from '@/lib/apis/cloudinary-url';
import { formatISTDate } from '@/lib/date-utils';
import {
  buildBrandedEmailHtml,
  escapeHtml,
  EMAIL_BORDER,
  EMAIL_MUTED,
  EMAIL_TEXT,
} from '@/lib/forms/email';
import { OWNER_CONTACTS } from '../data';
import type { AssetOwner, CatalogueAsset } from '../types';
import { categoryLabel } from '../utils';
import { getPocEmails } from './pocs';

// ---------------------------------------------------------------------------
// Brand configs
// ---------------------------------------------------------------------------

interface BorrowBrandConfig {
  accent: string;
  /** Subheading colour in the header band — should contrast against accent. */
  subheadingColor: string;
  logoUrl: string;
  logoAlt: string;
  mascotUrl: string;
  mascotAlt: string;
  /** Display name used in the sign-off ("Best, <signer>"). */
  signer: string;
  /** Which transporter to use. */
  mailer: typeof sendMail;
}

const TECHMIN_CONFIG: BorrowBrandConfig = {
  accent: '#c1121f',
  subheadingColor: '#f7d9d3',
  logoUrl: 'https://res.cloudinary.com/brxcz8ak/image/upload/v1792592069/Techmin_Logo_NEW.png',
  logoAlt: 'Techmin',
  mascotUrl: 'https://res.cloudinary.com/brxcz8ak/image/upload/v1792591846/mascot_borrow_v3_1792591736499.jpg',
  mascotAlt: 'Bijlee digging through a box of tech gadgets',
  signer: 'Techmin',
  mailer: sendMail,
};

const JAZBAA_CONFIG: BorrowBrandConfig = {
  accent: '#6b21a8',
  subheadingColor: '#e9d5f5',
  // TODO: replace with the actual Jazbaa logo Cloudinary URL when available
  logoUrl: '',
  logoAlt: 'Jazbaa',
  // TODO: replace with the bijlee mascot Cloudinary URL when available
  mascotUrl: 'https://res.cloudinary.com/brxcz8ak/image/upload/v1792591846/mascot_borrow_v3_1792591736499.jpg',
  mascotAlt: 'Jazbaa mascot',
  signer: 'Jazbaa',
  mailer: sendMailJazbaa,
};

const BRAND_CONFIG: Record<AssetOwner, BorrowBrandConfig> = {
  Techmin: TECHMIN_CONFIG,
  Jazbaa: JAZBAA_CONFIG,
};

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

export interface BorrowRequestEmailInput {
  /** Requester's address, from the session. */
  requester: string;
  asset: Pick<CatalogueAsset, 'name' | 'type' | 'owner' | 'image'>;
  /** YYYY-MM-DD */
  from: string;
  /** YYYY-MM-DD */
  returnBy: string;
  reason: string;
  /** 10-digit Indian mobile number. */
  phone: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function displayDate(date: string): string {
  return formatISTDate(date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

/** "soham.tulsyan_ug2023@ashoka.edu.in" → "Soham". Null when the address has no usable name. */
function firstName(email: string): string | null {
  const first = email.split('@')[0]?.split(/[._]/)[0] ?? '';
  if (!/^[a-z]{2,}$/i.test(first)) return null;
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

function detailRow(label: string, valueHtml: string): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${EMAIL_BORDER};vertical-align:top;width:38%;color:${EMAIL_MUTED};font-size:14px;">${escapeHtml(label)}</td>
      <td style="padding:10px 0 10px 16px;border-bottom:1px solid ${EMAIL_BORDER};vertical-align:top;color:${EMAIL_TEXT};font-size:14px;">${valueHtml}</td>
    </tr>`;
}

function buildHeroHtml(cfg: BorrowBrandConfig, assetName: string, team: string): string {
  const mascotImg = cfg.mascotUrl
    ? `<img src="${escapeHtml(cfg.mascotUrl)}" width="120" height="120" alt="${escapeHtml(cfg.mascotAlt)}" style="display:block;width:120px;height:120px;border:0;border-radius:12px;" />`
    : '';
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        ${mascotImg ? `<td width="120" style="width:120px;vertical-align:bottom;padding:0 14px 0 0;">${mascotImg}</td>` : ''}
        <td style="vertical-align:middle;">
          <div style="background:#faf7f2;border:1px solid ${EMAIL_BORDER};border-radius:18px 18px 18px 4px;padding:14px 18px;color:${EMAIL_TEXT};font-size:15px;line-height:1.5;">
            <div style="color:${cfg.accent};font-size:17px;font-weight:bold;margin:0 0 4px;">Request received!</div>
            Your request for <strong>${escapeHtml(assetName)}</strong> has been forwarded to the ${escapeHtml(team)} POCs. One of them will reply to this email very soon.
          </div>
        </td>
      </tr>
    </table>`;
}

// ---------------------------------------------------------------------------
// HTML builder
// ---------------------------------------------------------------------------

export function buildBorrowRequestEmailHtml(input: BorrowRequestEmailInput): string {
  const { asset } = input;
  const { team } = OWNER_CONTACTS[asset.owner];
  const cfg = BRAND_CONFIG[asset.owner];
  const returnBy = displayDate(input.returnBy);
  const name = firstName(input.requester);

  // Email clients don't negotiate formats, so ask Cloudinary for a plain JPEG.
  const thumb = asset.image
    ? `<img src="${escapeHtml(
      getOptimizedImageUrl(asset.image.url, { width: 192, height: 144, crop: 'fill', format: 'jpg' }),
    )}" width="96" height="72" alt="${escapeHtml(asset.name)}" style="display:block;border-radius:8px;border:1px solid ${EMAIL_BORDER};" />`
    : '';

  const steps = [
    `A POC from ${escapeHtml(team)} checks the item is free and replies here to approve it.`,
    'You agree on a pickup time in the same thread.',
    `You bring it back by <strong>${escapeHtml(returnBy)}</strong>, in the condition you got it.`,
  ]
    .map((step) => `<li style="margin:0 0 6px;">${step}</li>`)
    .join('');

  const bodyHtml = `
    <p style="margin:0 0 16px;">Hi ${escapeHtml(name ?? 'there')},</p>
    <p style="margin:0 0 20px;">Here's what you asked for. It isn't approved yet, so hold on to this email: approval and pickup both happen on this thread.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        ${thumb ? `<td style="width:110px;vertical-align:top;padding:10px 14px 0 0;">${thumb}</td>` : ''}
        <td style="vertical-align:top;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${detailRow('Item', `<strong>${escapeHtml(asset.name)}</strong><br><span style="color:${EMAIL_MUTED};font-size:13px;">${escapeHtml(categoryLabel(asset.type))}</span>`)}
            ${detailRow('Lent by', escapeHtml(team))}
            ${detailRow('Borrowing from', escapeHtml(displayDate(input.from)))}
            ${detailRow('Return by', `<strong>${escapeHtml(returnBy)}</strong>`)}
            ${detailRow('Requested by', `${escapeHtml(input.requester)}<br><span style="color:${EMAIL_MUTED};font-size:13px;">+91 ${escapeHtml(input.phone)}</span>`)}
            ${detailRow('Purpose', escapeHtml(input.reason).replace(/\n/g, '<br>'))}
          </table>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;font-weight:bold;color:${cfg.accent};">What happens next</p>
    <ol style="margin:0 0 20px;padding-left:20px;">${steps}</ol>
    <p style="margin:0 0 20px;padding:12px 16px;background:#faf7f2;border-radius:8px;color:${EMAIL_TEXT};font-size:14px;">Need other dates, or changed your mind? Reply to this email. Replies reach you and every POC, so nobody is left out.</p>
    <p style="margin:0;">Best,<br><strong>${escapeHtml(cfg.signer)}</strong></p>`;

  return buildBrandedEmailHtml({
    heading: 'Borrow request received',
    subheading: `${asset.name} · ${team}`,
    heroHtml: buildHeroHtml(cfg, asset.name, team),
    bodyHtml,
    accentColor: cfg.accent,
    logoUrl: cfg.logoUrl || undefined,
    logoAlt: cfg.logoAlt,
    footer: `Sent by ${team} through Borrow Assets on the Ashoka Platform. POCs: pressing Reply reaches ${input.requester} and the other POCs. Sent from Platform, by Techmin.`,
  });
}

// ---------------------------------------------------------------------------
// Plain-text twin
// ---------------------------------------------------------------------------

function buildBorrowRequestEmailText(input: BorrowRequestEmailInput): string {
  const { asset } = input;
  const { team } = OWNER_CONTACTS[asset.owner];
  const cfg = BRAND_CONFIG[asset.owner];
  const returnBy = displayDate(input.returnBy);
  return [
    `Hi ${firstName(input.requester) ?? 'there'},`,
    '',
    `Request received. Your request for ${asset.name} has been forwarded to the ${team} POCs. One of them will reply to this email very soon.`,
    '',
    `Item: ${asset.name} (${categoryLabel(asset.type)})`,
    `Lent by: ${team}`,
    `Borrowing from: ${displayDate(input.from)}`,
    `Return by: ${returnBy}`,
    `Requested by: ${input.requester}, +91 ${input.phone}`,
    `Purpose: ${input.reason}`,
    '',
    'What happens next',
    `1. A POC from ${team} checks the item is free and replies here to approve it.`,
    '2. You agree on a pickup time in the same thread.',
    `3. You bring it back by ${returnBy}, in the condition you got it.`,
    '',
    'Need other dates, or changed your mind? Reply to this email. Replies reach you and every POC.',
    '',
    'Best,',
    cfg.signer,
    '',
    'Sent from Platform, by Techmin.',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Send
// ---------------------------------------------------------------------------

/** Sends the confirmation, CC'ing the POCs of the lender that owns the asset. Throws on a delivery failure. */
export async function sendBorrowRequestEmail(input: BorrowRequestEmailInput): Promise<void> {
  const { team } = OWNER_CONTACTS[input.asset.owner];
  const cfg = BRAND_CONFIG[input.asset.owner];
  const requester = input.requester.trim().toLowerCase();
  const pocs = (await getPocEmails(input.asset.owner)).filter((email) => email !== requester);

  await cfg.mailer({
    to: requester,
    cc: pocs.length > 0 ? pocs : undefined,
    replyTo: [requester, ...pocs],
    alias: `${team} · Borrow Assets`,
    subject: `Your borrow request for ${input.asset.name} is in (return by ${displayDate(input.returnBy)})`,
    html: buildBorrowRequestEmailHtml(input),
    text: buildBorrowRequestEmailText(input),
  });
}
