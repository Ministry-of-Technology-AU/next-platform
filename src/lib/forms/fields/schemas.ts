/**
 * Zod schema factories for form fields.
 *
 * Every factory cleans the raw value first (see `./clean.ts`), then validates.
 * The schema's *input* type matches what the field component holds in state
 * (strings for text inputs, `File[]` for uploads) and its *output* type is the
 * parsed, trusted value your submit handler receives:
 *
 *   const schema = z.object({
 *     name:  field.text({ label: 'Full name', max: 80 }),
 *     phone: field.phone(),
 *     batch: field.select(['UG26', 'UG27'] as const, { label: 'Batch' }),
 *     age:   field.number({ label: 'Age', min: 16, integer: true }),
 *   });
 *   // z.input<typeof schema>  -> { name?: string; phone?: string; batch?: string; age?: string }
 *   // z.output<typeof schema> -> { name: string; phone: string; batch: 'UG26' | 'UG27'; age: number }
 *
 * Fields are required by default. Pass `required: false` to make them optional;
 * the output type widens to include `undefined` (or `''` for text).
 *
 * Shared server/client module — reuse the same schema in the route handler.
 */

import { z } from 'zod';
import {
  cleanDecimal,
  cleanEmail,
  cleanIndianPhone,
  cleanText,
  cleanUrl,
  htmlToPlainText,
  stripUnsafeHtml,
} from './clean';
import { FILE_KINDS, MAX_UPLOAD_MB, MB, detectFileKind, formatBytes, matchesAccept, type FileKind } from './files';

interface BaseOptions<R extends boolean> {
  /** Used in error messages: "Phone number is required". */
  label?: string;
  /** Defaults to true. */
  required?: R;
  /** Override the required-field message. */
  requiredMessage?: string;
}

type Req<R extends boolean, T, Empty = undefined> = R extends false ? T | Empty : T;

function requiredMessage(options: BaseOptions<boolean>): string {
  return options.requiredMessage ?? (options.label ? `${options.label} is required` : 'This field is required');
}

function name(options: BaseOptions<boolean>, fallback: string): string {
  return options.label ?? fallback;
}

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------

export interface TextOptions<R extends boolean> extends BaseOptions<R> {
  min?: number;
  max?: number;
  /** Keep line breaks (textarea). */
  multiline?: boolean;
  pattern?: { regex: RegExp; message: string };
}

function text<R extends boolean = true>(options: TextOptions<R> = {}): z.ZodType<string, string | undefined> {
  const { min = 0, max = 5000, multiline = false, pattern } = options;
  const required = options.required !== false;
  const label = name(options, 'This field');

  return z
    .string()
    .optional()
    .transform((v) => cleanText(v, { multiline }))
    .superRefine((v, ctx) => {
      if (v === '') {
        if (required) ctx.addIssue({ code: 'custom', message: requiredMessage(options) });
        return;
      }
      if (v.length < min) ctx.addIssue({ code: 'custom', message: `${label} must be at least ${min} characters` });
      if (v.length > max) ctx.addIssue({ code: 'custom', message: `${label} must be ${max} characters or fewer (currently ${v.length})` });
      if (pattern && !pattern.regex.test(v)) ctx.addIssue({ code: 'custom', message: pattern.message });
    });
}

// ---------------------------------------------------------------------------
// Email / URL / phone
// ---------------------------------------------------------------------------

export interface EmailOptions<R extends boolean> extends BaseOptions<R> {
  /** Restrict to these domains, e.g. `['ashoka.edu.in']`. Subdomains are allowed. */
  domains?: readonly string[];
}

const EMAIL = z.email();

function email<R extends boolean = true>(options: EmailOptions<R> = {}): z.ZodType<string, string | undefined> {
  const required = options.required !== false;
  const domains = options.domains?.map((d) => d.toLowerCase().replace(/^@/, ''));

  return z
    .string()
    .optional()
    .transform((v) => cleanEmail(v))
    .superRefine((v, ctx) => {
      if (v === '') {
        if (required) ctx.addIssue({ code: 'custom', message: requiredMessage(options) });
        return;
      }
      if (!EMAIL.safeParse(v).success) {
        ctx.addIssue({ code: 'custom', message: 'Enter an email address like name@ashoka.edu.in' });
        return;
      }
      if (domains && domains.length > 0) {
        const host = v.split('@')[1] ?? '';
        const ok = domains.some((d) => host === d || host.endsWith(`.${d}`));
        if (!ok) ctx.addIssue({ code: 'custom', message: `Use your ${domains.map((d) => `@${d}`).join(' or ')} address` });
      }
    });
}

export interface UrlOptions<R extends boolean> extends BaseOptions<R> {
  /** Restrict to these hostnames (subdomains allowed), e.g. `['instagram.com']`. */
  hosts?: readonly string[];
}

function url<R extends boolean = true>(options: UrlOptions<R> = {}): z.ZodType<string, string | undefined> {
  const required = options.required !== false;
  return z
    .string()
    .optional()
    .transform((v) => cleanUrl(v))
    .superRefine((v, ctx) => {
      if (v === '') {
        if (required) ctx.addIssue({ code: 'custom', message: requiredMessage(options) });
        return;
      }
      let parsed: URL;
      try {
        parsed = new URL(v);
      } catch {
        ctx.addIssue({ code: 'custom', message: 'Enter a full link, like https://example.com' });
        return;
      }
      if (parsed.protocol !== 'https:') {
        ctx.addIssue({ code: 'custom', message: 'Links must start with https://' });
        return;
      }
      const hosts = options.hosts;
      if (hosts && !hosts.some((h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`))) {
        ctx.addIssue({ code: 'custom', message: `Link must be on ${hosts.join(' or ')}` });
      }
    });
}

export type PhoneOptions<R extends boolean> = BaseOptions<R>;

/** Indian mobile number. Output is the 10 national digits (no +91). */
function phone<R extends boolean = true>(options: PhoneOptions<R> = {}): z.ZodType<string, string | undefined> {
  const required = options.required !== false;
  return z
    .string()
    .optional()
    .transform((v) => cleanIndianPhone(v))
    .superRefine((v, ctx) => {
      if (v === '') {
        if (required) ctx.addIssue({ code: 'custom', message: requiredMessage(options) });
        return;
      }
      if (v.length !== 10) {
        ctx.addIssue({ code: 'custom', message: `Phone number must be 10 digits (you entered ${v.length})` });
        return;
      }
      if (!/^[6-9]/.test(v)) ctx.addIssue({ code: 'custom', message: 'Indian mobile numbers start with 6, 7, 8 or 9' });
    });
}

// ---------------------------------------------------------------------------
// Number
// ---------------------------------------------------------------------------

export interface NumberOptions<R extends boolean> extends BaseOptions<R> {
  min?: number;
  max?: number;
  integer?: boolean;
}

/**
 * Number typed into a text field. Input type is the field's string; numbers
 * are also accepted at runtime (e.g. JSON on the server).
 */
function number<R extends boolean = true>(
  options: NumberOptions<R> = {},
): z.ZodType<Req<R, number>, string | undefined> {
  const { min, max, integer = false } = options;
  const required = options.required !== false;
  const label = name(options, 'Value');

  const schema = z
    .union([z.string(), z.number()])
    .optional()
    .transform((v, ctx): number | undefined => {
      // Clean as a decimal even for integers: "12.5" must fail, not become 125.
      const raw = typeof v === 'number' ? String(v) : cleanDecimal(v);
      if (raw === '' || raw === '-' || raw === '.') {
        if (required) ctx.addIssue({ code: 'custom', message: requiredMessage(options) });
        return undefined;
      }
      const n = Number(raw);
      if (!Number.isFinite(n)) {
        ctx.addIssue({ code: 'custom', message: `${label} must be a number` });
        return undefined;
      }
      if (integer && !Number.isInteger(n)) ctx.addIssue({ code: 'custom', message: `${label} must be a whole number` });
      if (min !== undefined && n < min) ctx.addIssue({ code: 'custom', message: `${label} must be ${min} or more` });
      if (max !== undefined && n > max) ctx.addIssue({ code: 'custom', message: `${label} must be ${max} or less` });
      return n;
    });
  return schema as unknown as z.ZodType<Req<R, number>, string | undefined>;
}

// ---------------------------------------------------------------------------
// Choice
// ---------------------------------------------------------------------------

/** One of `values`. Rejects anything not in the list, including tampered DOM values. */
function select<const T extends readonly [string, ...string[]], R extends boolean = true>(
  values: T,
  options: BaseOptions<R> = {},
): z.ZodType<Req<R, T[number]>, string | undefined> {
  const required = options.required !== false;
  const allowed = new Set<string>(values);
  const schema = z
    .string()
    .optional()
    .transform((v, ctx): T[number] | undefined => {
      const value = v?.trim() ?? '';
      if (value === '') {
        if (required) ctx.addIssue({ code: 'custom', message: options.requiredMessage ?? (options.label ? `Choose ${options.label.toLowerCase()}` : 'Choose an option') });
        return undefined;
      }
      if (!allowed.has(value)) {
        ctx.addIssue({ code: 'custom', message: 'Choose one of the listed options' });
        return undefined;
      }
      return value as T[number];
    });
  return schema as unknown as z.ZodType<Req<R, T[number]>, string | undefined>;
}

export interface MultiSelectOptions extends BaseOptions<boolean> {
  min?: number;
  max?: number;
}

/** Subset of `values`. Deduplicates and preserves the order of `values`. */
function multiSelect<const T extends readonly [string, ...string[]]>(
  values: T,
  options: MultiSelectOptions = {},
): z.ZodType<T[number][], string[] | undefined> {
  const required = options.required !== false;
  const min = options.min ?? (required ? 1 : 0);
  const { max } = options;
  const schema = z
    .array(z.string())
    .optional()
    .transform((v, ctx): T[number][] => {
      const picked = new Set(v ?? []);
      const unknown = [...picked].filter((p) => !(values as readonly string[]).includes(p));
      if (unknown.length > 0) {
        ctx.addIssue({ code: 'custom', message: 'Some selections are no longer available — review and choose again' });
      }
      const result = values.filter((val) => picked.has(val));
      if (result.length < min) {
        ctx.addIssue({
          code: 'custom',
          message:
            min === 1
              ? (options.requiredMessage ?? 'Choose at least one option')
              : `Choose at least ${min} options`,
        });
      }
      if (max !== undefined && result.length > max) {
        ctx.addIssue({ code: 'custom', message: `Choose at most ${max} option${max === 1 ? '' : 's'}` });
      }
      return result;
    });
  return schema as unknown as z.ZodType<T[number][], string[] | undefined>;
}

export interface CheckboxOptions extends Omit<BaseOptions<boolean>, 'required'> {
  /** Consent-style box that must be ticked to submit. */
  mustBeChecked?: boolean;
}

function checkbox(options: CheckboxOptions = {}): z.ZodType<boolean, boolean | undefined> {
  return z
    .boolean()
    .optional()
    .transform((v) => v === true)
    .superRefine((v, ctx) => {
      if (options.mustBeChecked && !v) {
        ctx.addIssue({ code: 'custom', message: options.requiredMessage ?? 'Tick this box to continue' });
      }
    });
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

export interface DateOptions<R extends boolean> extends BaseOptions<R> {
  min?: Date;
  max?: Date;
}

const dateFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

function toDate(v: Date | string | null | undefined): Date | undefined {
  if (v == null || v === '') return undefined;
  const d = v instanceof Date ? new Date(v.getTime()) : new Date(v.length === 10 ? `${v}T00:00:00` : v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function checkRange(d: Date, options: DateOptions<boolean>, fmt: Intl.DateTimeFormat, ctx: z.RefinementCtx) {
  if (options.min && d < options.min) ctx.addIssue({ code: 'custom', message: `Pick a date on or after ${fmt.format(options.min)}` });
  if (options.max && d > options.max) ctx.addIssue({ code: 'custom', message: `Pick a date on or before ${fmt.format(options.max)}` });
}

/**
 * Calendar date (time ignored). Input type matches `DatePicker`'s
 * `Date | undefined`; ISO / `yyyy-MM-dd` strings are also accepted at runtime.
 */
function date<R extends boolean = true>(
  options: DateOptions<R> = {},
): z.ZodType<Req<R, Date>, Date | undefined> {
  const required = options.required !== false;
  const schema = z
    .union([z.date(), z.string(), z.null()])
    .optional()
    .transform((v, ctx): Date | undefined => {
      const d = toDate(v);
      if (!d) {
        if (v != null && v !== '') ctx.addIssue({ code: 'custom', message: 'Enter a valid date' });
        else if (required) ctx.addIssue({ code: 'custom', message: requiredMessage(options) });
        return undefined;
      }
      d.setHours(0, 0, 0, 0);
      checkRange(d, options, dateFmt, ctx);
      return d;
    });
  return schema as unknown as z.ZodType<Req<R, Date>, Date | undefined>;
}

/**
 * Date and time. Input type matches `DateTimePicker`'s ISO string (Dates are
 * also accepted at runtime); output is an ISO string in UTC.
 */
function dateTime<R extends boolean = true>(
  options: DateOptions<R> = {},
): z.ZodType<Req<R, string>, string | undefined> {
  const required = options.required !== false;
  const schema = z
    .union([z.string(), z.date(), z.null()])
    .optional()
    .transform((v, ctx): string | undefined => {
      const d = toDate(v);
      if (!d) {
        if (v != null && v !== '') ctx.addIssue({ code: 'custom', message: 'Enter a valid date and time' });
        else if (required) ctx.addIssue({ code: 'custom', message: requiredMessage(options) });
        return undefined;
      }
      checkRange(d, options, dateTimeFmt, ctx);
      return d.toISOString();
    });
  return schema as unknown as z.ZodType<Req<R, string>, string | undefined>;
}

// ---------------------------------------------------------------------------
// Rich text
// ---------------------------------------------------------------------------

export interface RichTextOptions<R extends boolean> extends BaseOptions<R> {
  /** Limit on visible characters (tags excluded). */
  maxChars?: number;
  minChars?: number;
}

/**
 * HTML from the rich-text editor. Strips script-capable markup client side and
 * validates visible length. Output is `''` when the editor only holds empty tags.
 * Server routes must still run `sanitizeHtml()` from `@/lib/forms/sanitize`.
 */
function richText<R extends boolean = true>(options: RichTextOptions<R> = {}): z.ZodType<string, string | undefined> {
  const { maxChars = 20000, minChars = 0 } = options;
  const required = options.required !== false;
  const label = name(options, 'This field');
  return z
    .string()
    .optional()
    .transform((v) => {
      const safe = stripUnsafeHtml(v);
      return htmlToPlainText(safe) === '' ? '' : safe;
    })
    .superRefine((v, ctx) => {
      const plain = htmlToPlainText(v);
      if (plain === '') {
        if (required) ctx.addIssue({ code: 'custom', message: requiredMessage(options) });
        return;
      }
      if (plain.length < minChars) ctx.addIssue({ code: 'custom', message: `${label} must be at least ${minChars} characters` });
      if (plain.length > maxChars) ctx.addIssue({ code: 'custom', message: `${label} must be ${maxChars} characters or fewer (currently ${plain.length})` });
    });
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

export interface FilesOptions<R extends boolean> extends BaseOptions<R> {
  /** Allowed kinds. Defaults to every kind in `FILE_KINDS`. */
  kinds?: readonly FileKind[];
  /** HTML accept string, checked in addition to `kinds`. */
  accept?: string;
  /** Per-file limit in MB. Capped at `MAX_UPLOAD_MB`. */
  maxSizeMB?: number;
  maxFiles?: number;
  /** Combined size limit across all files, in MB. */
  maxTotalMB?: number;
}

const isFile = (v: unknown): v is File => typeof File !== 'undefined' && v instanceof File;

/**
 * Local files held until submit. Synchronous checks only (count, size, kind);
 * the upload fields also verify magic bytes when a file is added, and
 * `/api/uploads` verifies them again server side.
 */
function files<R extends boolean = true>(options: FilesOptions<R> = {}): z.ZodType<File[], File[] | undefined> {
  const required = options.required !== false;
  const maxSize = Math.min(options.maxSizeMB ?? MAX_UPLOAD_MB, MAX_UPLOAD_MB) * MB;
  const kinds = new Set<FileKind>(options.kinds ?? (Object.keys(FILE_KINDS) as FileKind[]));
  const { maxFiles, maxTotalMB } = options;

  return z
    .array(z.custom<File>(isFile, { message: 'Not a file' }))
    .optional()
    .transform((v) => v ?? [])
    .superRefine((list, ctx) => {
      if (list.length === 0) {
        if (required) ctx.addIssue({ code: 'custom', message: options.requiredMessage ?? (options.label ? `Add ${options.label.toLowerCase()}` : 'Add at least one file') });
        return;
      }
      if (maxFiles !== undefined && list.length > maxFiles) {
        ctx.addIssue({ code: 'custom', message: `You can add up to ${maxFiles} file${maxFiles === 1 ? '' : 's'} — remove ${list.length - maxFiles}` });
      }
      for (const file of list) {
        const kind = detectFileKind(file);
        if (!kind || !kinds.has(kind) || !matchesAccept(file, options.accept)) {
          ctx.addIssue({ code: 'custom', message: `${file.name} isn't an allowed file type` });
        } else if (file.size > maxSize) {
          ctx.addIssue({ code: 'custom', message: `${file.name} is ${formatBytes(file.size)} — the limit is ${formatBytes(maxSize)}` });
        } else if (file.size === 0) {
          ctx.addIssue({ code: 'custom', message: `${file.name} is empty` });
        }
      }
      if (maxTotalMB !== undefined) {
        const total = list.reduce((sum, f) => sum + f.size, 0);
        if (total > maxTotalMB * MB) {
          ctx.addIssue({ code: 'custom', message: `Files add up to ${formatBytes(total)} — the limit is ${maxTotalMB} MB in total` });
        }
      }
    });
}

/** Convenience: image-only `files()`. */
function images<R extends boolean = true>(options: Omit<FilesOptions<R>, 'kinds'> = {}): z.ZodType<File[], File[] | undefined> {
  return files({ ...options, kinds: ['image'] });
}

export const field = {
  text,
  email,
  url,
  phone,
  number,
  select,
  multiSelect,
  checkbox,
  date,
  dateTime,
  richText,
  files,
  images,
} as const;

/**
 * First error message from a schema for a single value, or undefined when valid.
 * Used by field components in standalone (non react-hook-form) mode.
 */
export function firstError(schema: z.ZodType, value: unknown): string | undefined {
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}
