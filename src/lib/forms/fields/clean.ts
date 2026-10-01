/**
 * Input cleaning primitives for form fields.
 *
 * Every zod field schema in `./schemas.ts` runs its raw value through one of
 * these before validating, and the field components reuse them to clean input
 * as the user types or pastes. Pure functions, no DOM — safe on server and client.
 */

// C0/C1 control characters except tab (\u0009) and newline (\u000A).
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;
// Zero-width and bidi-override characters used to spoof or hide text.
const INVISIBLE_CHARS = /[\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g;

/**
 * Normalise free text: Unicode NFKC, strip control and invisible characters,
 * unify line endings. Single-line text also collapses runs of whitespace.
 */
export function cleanText(value: string | null | undefined, options: { multiline?: boolean } = {}): string {
  if (!value) return '';
  const base = value
    .normalize('NFKC')
    .replace(/\r\n?/g, '\n')
    .replace(INVISIBLE_CHARS, '')
    .replace(CONTROL_CHARS, '');

  if (!options.multiline) return base.replace(/\s+/g, ' ').trim();

  return base
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Keep only ASCII digits (full-width digits are folded by NFKC first). */
export function digitsOnly(value: string | null | undefined): string {
  if (!value) return '';
  return value.normalize('NFKC').replace(/\D/g, '');
}

/**
 * Reduce a pasted Indian mobile number to its 10 national digits.
 * Handles `+91 98765 43210`, `091-9876543210`, `09876543210`, `919876543210`.
 * Returns at most 10 digits; never guesses beyond stripping a known prefix.
 */
export function cleanIndianPhone(value: string | null | undefined): string {
  let digits = digitsOnly(value);
  if (digits.length > 10 && digits.startsWith('0')) digits = digits.replace(/^0+/, '');
  if (digits.length > 10 && digits.startsWith('91')) digits = digits.slice(2);
  return digits.slice(0, 10);
}

export function cleanEmail(value: string | null | undefined): string {
  return cleanText(value).replace(/\s/g, '').toLowerCase();
}

/**
 * Keep a partially typed decimal intact (`-`, `1.`, `.5`) while dropping
 * anything that cannot be part of a number. Commas are treated as grouping.
 */
export function cleanDecimal(value: string | null | undefined, options: { allowNegative?: boolean; integer?: boolean } = {}): string {
  if (!value) return '';
  const { allowNegative = true, integer = false } = options;
  let raw = value.normalize('NFKC').replace(/,/g, '').replace(/\s/g, '');
  const negative = allowNegative && raw.startsWith('-');
  raw = raw.replace(integer ? /[^\d]/g : /[^\d.]/g, '');
  if (!integer) {
    const firstDot = raw.indexOf('.');
    if (firstDot !== -1) raw = raw.slice(0, firstDot + 1) + raw.slice(firstDot + 1).replace(/\./g, '');
  }
  return (negative ? '-' : '') + raw;
}

export function cleanUrl(value: string | null | undefined): string {
  const text = cleanText(value).replace(/\s/g, '');
  if (!text) return '';
  // Bare domains are common in pasted input; assume https.
  return /^[a-z][a-z\d+.-]*:/i.test(text) ? text : `https://${text}`;
}

const HTML_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

/** Visible text of an HTML string — used for length and emptiness checks only. */
export function htmlToPlainText(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6])\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (entity) => HTML_ENTITIES[entity] ?? entity)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Elements that can run script or submit data; removed with their contents.
const UNSAFE_TAGS = 'script|style|iframe|object|embed|form|input|textarea|select|button|link|meta|base|svg|math|noscript|template';

/**
 * Client-side defence in depth for rich text. Removes script-capable markup so
 * obviously hostile content never round-trips through form state.
 *
 * NOT a sanitiser. Server routes must still pass rich text through
 * `sanitizeHtml` in `@/lib/forms/sanitize` before storing or rendering it.
 * Returns safe input unchanged (no trimming) so a live editor's caret never jumps.
 */
export function stripUnsafeHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(INVISIBLE_CHARS, '')
    // Element and its contents first, then any unpaired open/close tag left over.
    .replace(new RegExp(`<(${UNSAFE_TAGS})\\b[^>]*>[\\s\\S]*?<\\/\\1\\s*>`, 'gi'), '')
    .replace(new RegExp(`<\\/?(${UNSAFE_TAGS})\\b[^>]*>`, 'gi'), '')
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src|xlink:href)\s*=\s*("|')?\s*(javascript|vbscript|data):[^"'\s>]*("|')?/gi, '$1="#"');
}

/** Sanitise a filename for display and storage keys; keeps the extension. */
export function cleanFilename(name: string): string {
  const cleaned = cleanText(name)
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/^\.+/, '')
    .slice(-180);
  return cleaned || 'file';
}
