/**
 * Zod validation for form schemas and response payloads.
 *
 * Two exports, both used server-side on every write:
 *   - `formSchemaValidator` validates a builder save (spec §3.1).
 *   - `buildResponseValidator` validates a submission against the form's own
 *     definition (required visible blocks, options membership, per-block rules).
 *
 * Shared server/client module (no server-only imports) — the builder reuses
 * these for inline validation.
 */

import { z } from 'zod';
import { CURATED_FONTS } from './theme';
import {
  FORM_LIMITS,
  INPUT_BLOCK_TYPES,
  isInputBlock,
  type FormResponseData,
  type FormSchema,
  type InputBlock,
} from './schema';

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const CLOUDINARY_URL = /^https:\/\/res\.cloudinary\.com\/.+/i;

const hexColor = z.string().regex(HEX_COLOR, 'Must be a 6-digit hex color');
const shortText = z.string().max(FORM_LIMITS.maxTextChars);
const longHtml = z.string().max(FORM_LIMITS.maxHtmlChars);

// ---------- Conditions ----------

const conditionOperator = z.enum([
  'equals',
  'notEquals',
  'contains',
  'notContains',
  'isEmpty',
  'isNotEmpty',
  'greaterThan',
  'lessThan',
]);

const conditionRule = z.object({
  blockId: z.string().min(1),
  operator: conditionOperator,
  value: z
    .union([z.string(), z.number(), z.boolean(), z.array(z.string())])
    .optional(),
});

const ruleGroup = z.object({
  combinator: z.enum(['all', 'any']),
  rules: z.array(conditionRule).max(FORM_LIMITS.maxRulesPerGroup),
});

const visibleWhen = ruleGroup.optional();

// ---------- Blocks ----------

const blockId = z.string().min(1);

const selectOption = z.object({
  value: z.string().min(1).max(FORM_LIMITS.maxTextChars),
  label: z.string().min(1).max(FORM_LIMITS.maxTextChars),
});

const inputBase = {
  id: blockId,
  visibleWhen,
  title: z.string().min(1).max(FORM_LIMITS.maxTitleChars),
  subtitle: z.string().max(FORM_LIMITS.maxTextChars).optional(),
  placeholder: z.string().max(FORM_LIMITS.maxTitleChars).optional(),
  required: z.boolean(),
};

const patternField = z
  .string()
  .max(FORM_LIMITS.maxPatternChars)
  .refine((p) => {
    try {
      // eslint-disable-next-line no-new
      new RegExp(p);
      return true;
    } catch {
      return false;
    }
  }, 'Invalid regular expression')
  .optional();

// Display blocks
const titleBlock = z.object({
  id: blockId,
  type: z.literal('title'),
  visibleWhen,
  text: z.string().max(FORM_LIMITS.maxTitleChars),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  align: z.enum(['left', 'center', 'right']),
});

const paragraphBlock = z.object({
  id: blockId,
  type: z.literal('paragraph'),
  visibleWhen,
  html: longHtml,
});

const dividerBlock = z.object({
  id: blockId,
  type: z.literal('divider'),
  visibleWhen,
});

const imageBlock = z.object({
  id: blockId,
  type: z.literal('image'),
  visibleWhen,
  url: z
    .string()
    .refine((u) => u === '' || CLOUDINARY_URL.test(u), 'Must be a Cloudinary URL'),
  alt: z.string().max(FORM_LIMITS.maxTitleChars),
  width: z.enum(['full', 'half']),
});

const socialLinksBlock = z.object({
  id: blockId,
  type: z.literal('social-links'),
  visibleWhen,
  links: z
    .array(
      z.object({
        platform: z.enum([
          'instagram',
          'linkedin',
          'twitter',
          'website',
          'youtube',
          'discord',
        ]),
        url: z.string().refine((u) => {
          try {
            return new URL(u).protocol === 'https:';
          } catch {
            return false;
          }
        }, 'Must be an https URL'),
      }),
    )
    .max(12),
});

// Input blocks
const shortTextBlock = z.object({
  ...inputBase,
  type: z.literal('short-text'),
  defaultValue: shortText.optional(),
  validation: z
    .object({
      minLength: z.number().int().nonnegative().optional(),
      maxLength: z.number().int().positive().optional(),
      pattern: patternField,
    })
    .optional(),
});

const longTextBlock = z.object({
  ...inputBase,
  type: z.literal('long-text'),
  defaultValue: shortText.optional(),
  validation: z
    .object({
      minLength: z.number().int().nonnegative().optional(),
      maxLength: z.number().int().positive().optional(),
    })
    .optional(),
});

const richTextBlock = z.object({
  ...inputBase,
  type: z.literal('rich-text'),
  validation: z.object({ maxLength: z.number().int().positive().optional() }).optional(),
});

const emailBlock = z.object({
  ...inputBase,
  type: z.literal('email'),
  defaultValue: shortText.optional(),
  restrictToDomain: z.string().max(253).optional(),
});

const phoneBlock = z.object({
  ...inputBase,
  type: z.literal('phone'),
  defaultCountryCode: z.string().max(6).optional(),
});

const numberBlock = z.object({
  ...inputBase,
  type: z.literal('number'),
  defaultValue: z.number().optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      integer: z.boolean().optional(),
    })
    .optional(),
});

const checkboxBlock = z.object({
  ...inputBase,
  type: z.literal('checkbox'),
  defaultValue: z.boolean().optional(),
});

const selectBlock = z.object({
  ...inputBase,
  type: z.literal('select'),
  options: z.array(selectOption).min(1).max(FORM_LIMITS.maxOptions),
  defaultValue: z.string().optional(),
});

const multiSelectBlock = z.object({
  ...inputBase,
  type: z.literal('multi-select'),
  options: z.array(selectOption).min(1).max(FORM_LIMITS.maxOptions),
  style: z.enum(['dropdown', 'checkboxes']),
  defaultValue: z.array(z.string()).optional(),
  validation: z
    .object({
      minSelected: z.number().int().nonnegative().optional(),
      maxSelected: z.number().int().positive().optional(),
    })
    .optional(),
});

const dateBlock = z.object({
  ...inputBase,
  type: z.literal('date'),
  defaultValue: z.string().optional(),
  validation: z
    .object({ minDate: z.string().optional(), maxDate: z.string().optional() })
    .optional(),
});

const dateTimeBlock = z.object({
  ...inputBase,
  type: z.literal('datetime'),
  defaultValue: z.string().optional(),
});

const fileUploadBlock = z.object({
  ...inputBase,
  type: z.literal('file-upload'),
  accept: z.enum(['images', 'documents', 'both']),
  multiple: z.boolean(),
  maxFiles: z.number().int().min(1).max(FORM_LIMITS.fileMaxFiles),
  maxSizeMB: z.number().positive().max(FORM_LIMITS.fileMaxSizeMB),
});

const formBlock = z.discriminatedUnion('type', [
  titleBlock,
  paragraphBlock,
  dividerBlock,
  imageBlock,
  socialLinksBlock,
  shortTextBlock,
  longTextBlock,
  richTextBlock,
  emailBlock,
  phoneBlock,
  numberBlock,
  checkboxBlock,
  selectBlock,
  multiSelectBlock,
  dateBlock,
  dateTimeBlock,
  fileUploadBlock,
]);

const formPage = z.object({
  id: blockId,
  title: z.string().max(FORM_LIMITS.maxTitleChars).optional(),
  blocks: z.array(formBlock).max(FORM_LIMITS.maxBlocksPerPage),
  visibleWhen,
});

// ---------- Theme ----------

const fontConfig = z.object({
  family: z.enum(CURATED_FONTS),
  weight: z.union([
    z.literal(300),
    z.literal(400),
    z.literal(500),
    z.literal(600),
    z.literal(700),
    z.literal(800),
    z.literal(900),
  ]),
  italic: z.boolean(),
});

const formTheme = z.object({
  colors: z.object({
    background: hexColor,
    surface: hexColor,
    text: hexColor,
    textMuted: hexColor,
    primary: hexColor,
    primaryText: hexColor,
    border: hexColor,
    error: hexColor,
  }),
  fonts: z.object({ heading: fontConfig, body: fontConfig, button: fontConfig }),
  radius: z.number().min(0).max(24),
  buttonStyle: z.enum(['solid', 'outline']),
});

const formSettings = z.object({
  confirmationTitle: z.string().max(FORM_LIMITS.maxTitleChars),
  confirmationHtml: longHtml,
  submitButtonText: z.string().min(1).max(80),
  sendEmailCopy: z.boolean(),
  showProgressBar: z.boolean(),
});

// ---------- Root ----------

const baseSchema = z.object({
  schemaVersion: z.number().int().positive(),
  pages: z.array(formPage).min(1).max(FORM_LIMITS.maxPages),
  theme: formTheme,
  settings: formSettings,
});

/**
 * Root validator with cross-cutting `superRefine` checks:
 * unique ids, condition references to existing input blocks, and no forward
 * references (spec §3.1, §4.6).
 */
export const formSchemaValidator = baseSchema.superRefine((schema, ctx) => {
  const seenIds = new Set<string>();
  // Map input-block id → page index (for forward-reference detection).
  const inputBlockPage = new Map<string, number>();

  schema.pages.forEach((page, pageIndex) => {
    if (seenIds.has(page.id)) {
      ctx.addIssue({ code: 'custom', message: `Duplicate id: ${page.id}`, path: ['pages', pageIndex, 'id'] });
    }
    seenIds.add(page.id);

    page.blocks.forEach((block) => {
      if (seenIds.has(block.id)) {
        ctx.addIssue({ code: 'custom', message: `Duplicate id: ${block.id}` });
      }
      seenIds.add(block.id);
      if (isInputBlock(block as never)) {
        inputBlockPage.set(block.id, pageIndex);
      }
    });
  });

  const checkGroup = (
    group: { rules: { blockId: string }[] } | undefined,
    ownerPage: number,
    selfId: string | null,
    // Page conditions may only reference strictly-earlier pages; block
    // conditions may reference same-or-earlier pages.
    allowSamePage: boolean,
    path: (string | number)[],
  ) => {
    if (!group) return;
    group.rules.forEach((rule, ri) => {
      const rulePath = [...path, 'rules', ri, 'blockId'];
      if (selfId && rule.blockId === selfId) {
        ctx.addIssue({ code: 'custom', message: 'A block condition cannot reference itself', path: rulePath });
        return;
      }
      const targetPage = inputBlockPage.get(rule.blockId);
      if (targetPage === undefined) {
        ctx.addIssue({ code: 'custom', message: `Condition references unknown input block: ${rule.blockId}`, path: rulePath });
        return;
      }
      const ok = allowSamePage ? targetPage <= ownerPage : targetPage < ownerPage;
      if (!ok) {
        ctx.addIssue({
          code: 'custom',
          message: 'Condition cannot reference a question on a later page',
          path: rulePath,
        });
      }
    });
  };

  schema.pages.forEach((page, pageIndex) => {
    checkGroup(page.visibleWhen, pageIndex, null, false, ['pages', pageIndex, 'visibleWhen']);
    page.blocks.forEach((block, blockIndex) => {
      checkGroup(block.visibleWhen, pageIndex, block.id, true, [
        'pages',
        pageIndex,
        'blocks',
        blockIndex,
        'visibleWhen',
      ]);
    });
  });
});

/** Parse + return typed schema or throw a ZodError. */
export function parseFormSchema(input: unknown): FormSchema {
  return formSchemaValidator.parse(input) as FormSchema;
}

/** Safe parse returning a flat, human-readable error string on failure. */
export function safeParseFormSchema(
  input: unknown,
): { ok: true; schema: FormSchema } | { ok: false; error: string } {
  const result = formSchemaValidator.safeParse(input);
  if (result.success) return { ok: true, schema: result.data as FormSchema };
  const first = result.error.issues[0];
  const where = first?.path?.length ? ` (${first.path.join('.')})` : '';
  return { ok: false, error: `${first?.message ?? 'Invalid form schema'}${where}` };
}

// ============================================================================
// Response validation
// ============================================================================

export type ResponseValidationResult =
  | { ok: true; data: FormResponseData }
  | { ok: false; errors: Record<string, string> };

function isBlank(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function collectInputBlocks(schema: FormSchema): Map<string, InputBlock> {
  const map = new Map<string, InputBlock>();
  for (const page of schema.pages) {
    for (const block of page.blocks) {
      if (isInputBlock(block)) map.set(block.id, block);
    }
  }
  return map;
}

/**
 * Builds a validator bound to a specific form. The returned function validates
 * a submission against that form: required visible blocks answered, option
 * membership, per-block rules. Keys not matching a visible input block are
 * stripped (never persisted). Values are coerced per the §3 value-type table.
 */
export function buildResponseValidator(schema: FormSchema) {
  const inputBlocks = collectInputBlocks(schema);

  return function validate(
    data: unknown,
    visibleInputBlockIds: Set<string>,
  ): ResponseValidationResult {
    const errors: Record<string, string> = {};
    const clean: FormResponseData = {};
    const raw = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;

    for (const id of visibleInputBlockIds) {
      const block = inputBlocks.get(id);
      if (!block) continue;
      const value = raw[id];
      const blank = isBlank(value);

      if (blank) {
        if (block.required) errors[id] = 'This field is required.';
        continue;
      }

      switch (block.type) {
        case 'short-text':
        case 'long-text': {
          if (typeof value !== 'string') {
            errors[id] = 'Expected text.';
            break;
          }
          const v = value;
          const min = block.validation?.minLength;
          const max = block.validation?.maxLength;
          if (min !== undefined && v.length < min) errors[id] = `Must be at least ${min} characters.`;
          else if (max !== undefined && v.length > max) errors[id] = `Must be at most ${max} characters.`;
          else if (v.length > FORM_LIMITS.maxTextChars) errors[id] = 'Answer is too long.';
          else if (
            block.type === 'short-text' &&
            block.validation?.pattern &&
            !safeRegexTest(block.validation.pattern, v)
          ) {
            errors[id] = 'Answer does not match the required format.';
          } else {
            clean[id] = v;
          }
          break;
        }

        case 'rich-text': {
          if (typeof value !== 'string') {
            errors[id] = 'Expected text.';
            break;
          }
          if (value.length > FORM_LIMITS.maxHtmlChars) errors[id] = 'Answer is too long.';
          else clean[id] = value;
          break;
        }

        case 'email': {
          if (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors[id] = 'Enter a valid email address.';
            break;
          }
          if (block.restrictToDomain && !value.toLowerCase().endsWith(`@${block.restrictToDomain.toLowerCase()}`)) {
            errors[id] = `Email must end with @${block.restrictToDomain}.`;
          } else {
            clean[id] = value;
          }
          break;
        }

        case 'phone': {
          if (typeof value !== 'string') {
            errors[id] = 'Expected a phone number.';
            break;
          }
          const digits = value.replace(/\D/g, '');
          if (digits.length < 7 || digits.length > 15) errors[id] = 'Enter a valid phone number.';
          else clean[id] = digits;
          break;
        }

        case 'number': {
          const num = typeof value === 'number' ? value : Number(value);
          if (!Number.isFinite(num)) {
            errors[id] = 'Enter a valid number.';
            break;
          }
          const rules = block.validation;
          if (rules?.integer && !Number.isInteger(num)) errors[id] = 'Must be a whole number.';
          else if (rules?.min !== undefined && num < rules.min) errors[id] = `Must be at least ${rules.min}.`;
          else if (rules?.max !== undefined && num > rules.max) errors[id] = `Must be at most ${rules.max}.`;
          else clean[id] = num;
          break;
        }

        case 'checkbox': {
          const checked = value === true;
          if (block.required && !checked) errors[id] = 'This must be checked.';
          else clean[id] = checked;
          break;
        }

        case 'select': {
          if (typeof value !== 'string' || !block.options.some((o) => o.value === value)) {
            errors[id] = 'Select a valid option.';
          } else {
            clean[id] = value;
          }
          break;
        }

        case 'multi-select': {
          if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) {
            errors[id] = 'Invalid selection.';
            break;
          }
          const allowed = new Set(block.options.map((o) => o.value));
          if (!value.every((v) => allowed.has(v as string))) {
            errors[id] = 'Selection contains an invalid option.';
            break;
          }
          const min = block.validation?.minSelected;
          const max = block.validation?.maxSelected;
          if (min !== undefined && value.length < min) errors[id] = `Select at least ${min}.`;
          else if (max !== undefined && value.length > max) errors[id] = `Select at most ${max}.`;
          else clean[id] = value;
          break;
        }

        case 'date':
        case 'datetime': {
          if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) {
            errors[id] = 'Enter a valid date.';
            break;
          }
          if (block.type === 'date' && block.validation) {
            const t = Date.parse(value);
            if (block.validation.minDate && t < Date.parse(block.validation.minDate)) {
              errors[id] = 'Date is too early.';
              break;
            }
            if (block.validation.maxDate && t > Date.parse(block.validation.maxDate)) {
              errors[id] = 'Date is too late.';
              break;
            }
          }
          clean[id] = value;
          break;
        }

        case 'file-upload': {
          if (!Array.isArray(value)) {
            errors[id] = 'Invalid file upload.';
            break;
          }
          const files = value as Array<Record<string, unknown>>;
          const valid = files.every(
            (f) =>
              f &&
              typeof f.url === 'string' &&
              typeof f.publicId === 'string' &&
              typeof f.filename === 'string' &&
              CLOUDINARY_URL.test(String(f.url)),
          );
          if (!valid) errors[id] = 'Invalid file upload.';
          else if (files.length > block.maxFiles) errors[id] = `At most ${block.maxFiles} file(s).`;
          else clean[id] = files;
          break;
        }

        default: {
          // Unknown/unsupported input type — ignore.
          break;
        }
      }
    }

    if (Object.keys(errors).length > 0) return { ok: false, errors };
    return { ok: true, data: clean };
  };
}

function safeRegexTest(pattern: string, value: string): boolean {
  try {
    return new RegExp(pattern).test(value);
  } catch {
    // A pattern that fails to compile should not block submission.
    return true;
  }
}
