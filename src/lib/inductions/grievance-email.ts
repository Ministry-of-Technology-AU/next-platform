import 'server-only';

/**
 * Grievance emails for the induction platform.
 *
 * When a student raises a grievance on a rejected application two emails fire:
 *
 * 1. Application record → student only. A full, transparent summary of their
 *    entire journey: every form Q&A pair across all rounds, the complete
 *    pipeline (round labels, types, order), interview scheduling details
 *    (location, slot duration, slot booked, booking timestamp), and the
 *    final rejection timestamp. Nothing is omitted.
 *
 * 2. Grievance notification → INDUCTION_GRIEVANCE_EMAIL (env), with the
 *    student CC'd. Subject: "Induction Grievance: <student's subject>".
 *    Body: the student's own grievance message wrapped in the branded shell.
 *
 * Both emails use the same branded shell as all other induction emails.
 */

import { sendMail } from '@/lib/apis/mail';
import { buildBrandedEmailHtml } from '@/lib/forms/email';
import { sanitizeHtml } from '@/lib/forms/sanitize';
import { visiblePages, visibleBlocks } from '@/lib/forms/conditions';
import { isInputBlock } from '@/lib/forms/schema';
import type { FormSchema, FormResponseData, InputBlock } from '@/lib/forms/schema';
import type { PipelineRound } from '@/app/organisations/inductions/types';

const ACCENT = '#87281b';
const TEXT = '#232020';
const MUTED = '#6b6560';
const BORDER = '#e5ddd3';
const BG_LIGHT = '#faf7f2';
const BG_WARM = '#fff8f0';

const ALIAS = 'Inductions Platform';

function getGrievanceEmail(): string {
  const env = process.env.INDUCTION_GRIEVANCE_EMAIL;
  if (!env || !env.includes('@')) {
    console.warn('[grievance] INDUCTION_GRIEVANCE_EMAIL not set — falling back to cultural.ministry@ashoka.edu.in');
    return 'cultural.ministry@ashoka.edu.in';
  }
  return env.trim();
}

// ---------------------------------------------------------------------------
// HTML helpers (inline-only — no external CSS, no webfonts)
// ---------------------------------------------------------------------------

function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sectionHeader(title: string): string {
  return `<tr>
    <td colspan="2" style="padding:20px 0 8px;border-top:2px solid ${BORDER};">
      <span style="font-size:11px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">${esc(title)}</span>
    </td>
  </tr>`;
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:9px 0;border-bottom:1px solid ${BORDER};vertical-align:top;width:38%;color:${MUTED};font-size:13px;line-height:1.5;">${esc(label)}</td>
    <td style="padding:9px 0 9px 16px;border-bottom:1px solid ${BORDER};vertical-align:top;color:${TEXT};font-size:13px;line-height:1.5;">${value}</td>
  </tr>`;
}

function emptyRow(message: string): string {
  return `<tr><td colspan="2" style="padding:9px 0;color:${MUTED};font-size:13px;font-style:italic;">${esc(message)}</td></tr>`;
}

function formatRawKey(key: string): string {
  const spaced = key
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatRawValue(value: unknown): string {
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return `<span style="color:${MUTED}">—</span>`;
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'string') {
    // Check if it's an ISO date
    if (/^\d{4}-\d{2}-\d{2}(T|\b)/.test(value) && !isNaN(Date.parse(value))) {
      try {
        return esc(new Date(value).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' }));
      } catch {
        return esc(value);
      }
    }
    // Check if it looks like URL
    if (/^https?:\/\//i.test(value)) {
      return `<a href="${esc(value)}" style="color:${ACCENT}" target="_blank">${esc(value)}</a>`;
    }
    return esc(value).replace(/\n/g, '<br>');
  }
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === 'object' && v && ('url' in v || 'name' in v || 'filename' in v))) {
      return value
        .map((f: any) => {
          const url = f.url || '#';
          const name = f.filename || f.name || f.url || 'Attachment';
          return `<a href="${esc(url)}" style="color:${ACCENT}" target="_blank">${esc(name)}</a>`;
        })
        .join('<br>');
    }
    return esc(value.map(String).join(', '));
  }
  if (typeof value === 'object') {
    const f = value as any;
    if (f.url) {
      const name = f.filename || f.name || f.url || 'Attachment';
      return `<a href="${esc(f.url)}" style="color:${ACCENT}" target="_blank">${esc(name)}</a>`;
    }
    return `<pre style="margin:0;font-size:12px;color:${TEXT};">${esc(JSON.stringify(value, null, 2))}</pre>`;
  }
  return esc(String(value));
}

function formatSlotKey(slotKey: string): string {
  const parts = slotKey.split('-');
  if (parts.length >= 3 && /^\d{4}$/.test(parts[0])) {
    const datePart = `${parts[0]}-${parts[1]}-${parts[2]}`;
    const timePart = parts.slice(3).join('-');
    try {
      const dateObj = new Date(datePart);
      if (!isNaN(dateObj.getTime())) {
        const dateFormatted = dateObj.toLocaleDateString('en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        return `${dateFormatted} · ${timePart || ''}`;
      }
    } catch {
      return slotKey;
    }
  }
  return slotKey;
}

function formatAnswerSimple(block: InputBlock, value: unknown): string {
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return `<span style="color:${MUTED}">—</span>`;
  }
  switch (block.type) {
    case 'checkbox':
      return value === true ? 'Yes' : 'No';
    case 'select':
      return esc(block.options.find((o) => o.value === value)?.label ?? String(value));
    case 'multi-select':
      return esc(
        (value as string[])
          .map((v) => block.options.find((o) => o.value === v)?.label ?? v)
          .join(', '),
      );
    case 'date':
    case 'datetime':
      try {
        return esc(new Date(value as string).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' }));
      } catch {
        return esc(String(value));
      }
    case 'file-upload':
      return (value as Array<{ url: string; filename: string }>)
        .map((f) => `<a href="${esc(f.url)}" style="color:${ACCENT}">${esc(f.filename || 'File')}</a>`)
        .join('<br>');
    case 'rich-text':
      return String(value);
    default:
      return esc(String(value)).replace(/\n/g, '<br>');
  }
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '<span style="color:' + MUTED + '">—</span>';
  try {
    return esc(new Date(iso).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' }));
  } catch {
    return esc(iso);
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FormResponseEntry {
  /** Human-readable form title (e.g. "Round 2 — Task Submission") */
  formTitle: string;
  /** Round label this form belongs to (if known) */
  roundLabel?: string | null;
  /** The schema + data pair for building Q&A rows */
  schema?: FormSchema | null;
  data?: FormResponseData | null;
  /** When submitted */
  submittedAt?: string | null;
}

export interface GrievanceInterviewDetail {
  roundLabel?: string | null;
  eventTitle?: string | null;
  location?: string | null;
  slotDuration?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  deadline?: string | null;
  isBooked: boolean;
  booking?: {
    slotKey: string;
    bookedAt?: string | null;
    candidateName?: string | null;
  } | null;
}

export interface GrievanceApplicationRecord {
  /** Org name */
  orgName: string;
  /** Role applied for */
  roleName?: string | null;
  /** Primary / first form title */
  formTitle: string;
  /**
   * All form responses across every round the student filled.
   * Each entry contains the schema + data so we render every Q&A pair.
   */
  formResponses?: FormResponseEntry[];
  /** Full pipeline round list */
  pipeline?: PipelineRound[] | null;
  /** Round index the student was at when rejected (0-based) */
  currentRound?: number;
  /** All interview rounds the student was involved in */
  interviewDetails?: GrievanceInterviewDetail[] | null;
  /** When the application was submitted */
  submittedAt?: string | null;
  /** When the rejection was last recorded (updatedAt of the response row) */
  rejectedAt?: string | null;
  /** Org's decision message if any */
  statusMessage?: string | null;
}

// ---------------------------------------------------------------------------
// Build application record HTML body — the long transparent record email
// ---------------------------------------------------------------------------

function buildApplicationRecordHtml(record: GrievanceApplicationRecord): string {
  const rows: string[] = [];

  // ── Warm opening ──────────────────────────────────────────────────────────
  const introPara = `
    <p style="margin:0 0 8px;color:${TEXT};font-size:15px;line-height:1.7;">
      We're truly sorry you went through this process and didn't get the outcome you were hoping for.
      We know how much effort goes into an application, and we want to make sure you have complete
      transparency about your journey.
    </p>
    <p style="margin:0 0 20px;color:${MUTED};font-size:14px;line-height:1.7;">
      Below is a full, unedited record of your application — every form response you submitted,
      every stage of the pipeline, and all interview details. This has been sent to you as part of
      the grievance process so you have everything in one place.
    </p>`;

  // ── Overview ──────────────────────────────────────────────────────────────
  rows.push(sectionHeader('Application Overview'));
  rows.push(row('Organisation', esc(record.orgName)));
  if (record.roleName) rows.push(row('Role Applied For', esc(record.roleName)));
  rows.push(row('Primary Form', esc(record.formTitle)));
  rows.push(row('Application Submitted', formatDate(record.submittedAt)));
  rows.push(row('Final Status', '<span style="color:#c0392b;font-weight:bold;">Not Selected</span>'));
  rows.push(row('Decision Recorded', formatDate(record.rejectedAt)));

  // ── Pipeline summary ──────────────────────────────────────────────────────
  if (record.pipeline && record.pipeline.length > 0) {
    rows.push(sectionHeader('Recruitment Pipeline — Stage by Stage'));
    const sortedRounds = [...record.pipeline].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    for (const round of sortedRounds) {
      const idx = round.order ?? 0;
      const reached = typeof record.currentRound === 'number' && idx <= record.currentRound;
      const isFinal = typeof record.currentRound === 'number' && idx === record.currentRound;
      let statusLabel: string;
      if (isFinal) {
        statusLabel = '<span style="color:#c0392b;font-weight:600;">⛔ Eliminated at this stage</span>';
      } else if (reached) {
        statusLabel = '<span style="color:#27ae60;font-weight:600;">✓ Passed</span>';
      } else {
        statusLabel = '<span style="color:#aaa;">Not reached</span>';
      }
      const typeLabel = round.type === 'interview' ? 'Interview Round' : 'Form Round';
      rows.push(
        row(
          `${round.label || `Round ${idx + 1}`}`,
          `${statusLabel} <span style="color:${MUTED};font-size:12px;margin-left:8px;">(${typeLabel})</span>`,
        ),
      );
      if (round.deadline) {
        rows.push(row(`  ↳ Deadline`, formatDate(round.deadline)));
      }
      if (round.description) {
        rows.push(row(`  ↳ Description`, esc(round.description)));
      }
    }
  }

  // ── Interview details ─────────────────────────────────────────────────────
  if (record.interviewDetails && record.interviewDetails.length > 0) {
    rows.push(sectionHeader('Interview Timeline & Scheduling Details'));
    for (const iv of record.interviewDetails) {
      if (iv.roundLabel) rows.push(row('Round', esc(iv.roundLabel)));
      if (iv.eventTitle) rows.push(row('Event Topic', esc(iv.eventTitle)));
      rows.push(row('Location / Platform', esc(iv.location || 'Google Meet / Online')));
      rows.push(row('Slot Duration', iv.slotDuration ? `${iv.slotDuration} minutes` : '30 minutes'));
      if (iv.startDate || iv.endDate) {
        const windowStr = `${iv.startDate ? formatDate(iv.startDate) : 'Open'} to ${iv.endDate ? formatDate(iv.endDate) : 'End'}`;
        rows.push(row('Scheduling Window', windowStr));
      }
      if (iv.deadline) {
        rows.push(row('Round Deadline', formatDate(iv.deadline)));
      }
      rows.push(row('Booking Status', iv.isBooked
        ? '<span style="color:#27ae60;font-weight:600;">✓ Slot was booked and scheduled</span>'
        : '<span style="color:#e67e22;">⚠️ Slot was not reserved</span>'));
      if (iv.isBooked && iv.booking) {
        rows.push(row('Scheduled Slot', esc(formatSlotKey(iv.booking.slotKey))));
        if (iv.booking.candidateName) rows.push(row('Booked For', esc(iv.booking.candidateName)));
        if (iv.booking.bookedAt) rows.push(row('Booked Timestamp', formatDate(iv.booking.bookedAt)));
      }
    }
  }

  // ── Form responses (all rounds) ───────────────────────────────────────────
  if (record.formResponses && record.formResponses.length > 0) {
    for (const entry of record.formResponses) {
      const title = entry.roundLabel
        ? `Your Responses — ${entry.roundLabel}`
        : `Your Responses — ${entry.formTitle}`;
      rows.push(sectionHeader(title));

      if (entry.submittedAt) {
        rows.push(row('Submitted At', formatDate(entry.submittedAt)));
      }

      if (entry.data && Object.keys(entry.data).length > 0) {
        const handledKeys = new Set<string>();

        if (entry.schema) {
          // Schema-guided formatting
          const inputBlocks: InputBlock[] = [];
          try {
            for (const page of visiblePages(entry.schema, entry.data)) {
              for (const block of visibleBlocks(page, entry.data)) {
                if (isInputBlock(block)) inputBlocks.push(block);
              }
            }
          } catch {
            // Fallback: collect all input blocks in schema
            for (const page of entry.schema.pages || []) {
              for (const block of page.blocks || []) {
                if (isInputBlock(block)) inputBlocks.push(block);
              }
            }
          }

          for (const block of inputBlocks) {
            handledKeys.add(block.id);
            rows.push(row(block.title, formatAnswerSimple(block, entry.data[block.id])));
          }
        }

        // Render any remaining keys in data not covered by schema
        for (const [key, value] of Object.entries(entry.data)) {
          if (handledKeys.has(key)) continue;
          rows.push(row(formatRawKey(key), formatRawValue(value)));
        }
      } else {
        rows.push(emptyRow('No response entries were recorded for this submission.'));
      }
    }
  }

  // ── Org decision message ──────────────────────────────────────────────────
  if (record.statusMessage) {
    rows.push(sectionHeader("Organisation's Decision Message to You"));
    rows.push(`<tr><td colspan="2" style="padding:10px 0;color:${TEXT};font-size:13px;line-height:1.7;">${sanitizeHtml(record.statusMessage)}</td></tr>`);
  }

  const tableHtml = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows.join('')}</table>`;

  const closingPara = `
    <p style="margin:20px 0 0;color:${MUTED};font-size:13px;line-height:1.6;border-top:1px solid ${BORDER};padding-top:16px;">
      If anything in this record is inaccurate or you have additional context to share, please include it in your grievance.
      The Cultural Ministry will review your case — your email thread with them is your point of contact.
    </p>`;

  return buildBrandedEmailHtml({
    heading: `Your Full Application Record — ${record.orgName}`,
    subheading: record.roleName ? `${record.roleName} · ${record.formTitle}` : record.formTitle,
    bodyHtml: `${introPara}${tableHtml}${closingPara}`,
    footer: `Generated on ${new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })} · Ashoka University Inductions Platform · This record is confidential to you.`,
  });
}

// ---------------------------------------------------------------------------
// Build grievance notification HTML body
// ---------------------------------------------------------------------------

function buildGrievanceNotificationHtml(options: {
  studentEmail: string;
  orgName: string;
  roleName?: string | null;
  grievanceBody: string;
}): string {
  const bodyHtml = `
    <p style="margin:0 0 16px;color:${TEXT};font-size:15px;line-height:1.7;">
      A student has raised a formal grievance regarding their induction outcome.
      Their full statement is included below, and they have been CC'd on this email
      so the conversation can continue directly.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${row('Student Email', `<a href="mailto:${esc(options.studentEmail)}" style="color:${ACCENT}">${esc(options.studentEmail)}</a>`)}
      ${row('Organisation', esc(options.orgName))}
      ${options.roleName ? row('Role', esc(options.roleName)) : ''}
      ${row('Grievance Submitted', formatDate(new Date().toISOString()))}
    </table>
    <div style="margin:20px 0 0;padding:18px;background:${BG_WARM};border-left:4px solid ${ACCENT};border-radius:6px;">
      <p style="margin:0 0 10px;font-size:11px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">Student's Statement</p>
      <div style="color:${TEXT};font-size:14px;line-height:1.8;white-space:pre-wrap;">${esc(options.grievanceBody)}</div>
    </div>
    <p style="margin:20px 0 0;color:${MUTED};font-size:13px;line-height:1.6;">
      The student has also received a complete copy of their application record — including all form
      responses, pipeline stages, and interview details — for their reference.
    </p>`;

  return buildBrandedEmailHtml({
    heading: 'Induction Grievance',
    subheading: `${options.orgName}${options.roleName ? ` · ${options.roleName}` : ''}`,
    bodyHtml,
    footer: `Sent via the Ashoka University Inductions Platform`,
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface SendGrievanceEmailsInput {
  studentEmail: string;
  grievanceSubject: string;
  grievanceBody: string;
  applicationRecord: GrievanceApplicationRecord;
}

/**
 * Sends the two grievance emails:
 * 1. Full application record → student only (transparent, warm, complete).
 * 2. Grievance notification → INDUCTION_GRIEVANCE_EMAIL, student CC'd.
 */
export async function sendGrievanceEmails(input: SendGrievanceEmailsInput): Promise<void> {
  const { studentEmail, grievanceSubject, grievanceBody, applicationRecord } = input;
  const ministryEmail = getGrievanceEmail();

  // Email 1: Full application record to student only
  const recordHtml = buildApplicationRecordHtml(applicationRecord);
  await sendMail({
    to: studentEmail,
    subject: `Your Application Record — ${applicationRecord.orgName}`,
    html: recordHtml,
    alias: ALIAS,
  });

  // Email 2: Grievance notification to ministry with student CC'd
  const grievanceHtml = buildGrievanceNotificationHtml({
    studentEmail,
    orgName: applicationRecord.orgName,
    roleName: applicationRecord.roleName,
    grievanceBody,
  });
  await sendMail({
    to: ministryEmail,
    cc: studentEmail,
    subject: `Induction Grievance: ${grievanceSubject}`,
    html: grievanceHtml,
    alias: ALIAS,
    replyTo: studentEmail,
  });
}
