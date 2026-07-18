/**
 * Form schema — the single source of truth for a form.
 *
 * The entire form (pages, blocks, logic, theme, settings) is ONE JSON document
 * stored in the Strapi `form.schema` field. The frontend renders exclusively
 * from this document. It is versioned so old forms keep working.
 *
 * This file is shared between server and client — it must NOT import anything
 * server-only (no `server-only`, no Strapi, no Cloudinary).
 *
 * See documentation/FORM_BUILDER_SPEC.md §3.
 */

export const FORM_SCHEMA_VERSION = 1;

// ---------- Conditions ----------

export type ConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains' // string includes / array includes
  | 'isEmpty'
  | 'isNotEmpty'
  | 'greaterThan'
  | 'lessThan'; // numbers and dates (ISO strings compared as dates)

export interface ConditionRule {
  /** Must reference an INPUT block on an EARLIER page or the same page. */
  blockId: string;
  operator: ConditionOperator;
  /** Omitted for isEmpty / isNotEmpty. */
  value?: string | number | boolean | string[];
}

export interface RuleGroup {
  combinator: 'all' | 'any';
  rules: ConditionRule[];
}

// ---------- Blocks ----------

interface BlockBase {
  /** uuidv4, generated client-side on block creation. */
  id: string;
  type: FormBlockType;
  /** Absent = always visible. */
  visibleWhen?: RuleGroup;
}

// --- Display blocks (no answer value) ---

export interface TitleBlock extends BlockBase {
  type: 'title';
  text: string;
  level: 1 | 2 | 3;
  align: 'left' | 'center' | 'right';
}

export interface ParagraphBlock extends BlockBase {
  type: 'paragraph';
  /** Sanitized server-side at save time. */
  html: string;
}

export interface DividerBlock extends BlockBase {
  type: 'divider';
}

export interface ImageBlock extends BlockBase {
  type: 'image';
  /** Cloudinary URL only. */
  url: string;
  alt: string;
  width: 'full' | 'half';
}

export type SocialPlatform =
  | 'instagram'
  | 'linkedin'
  | 'twitter'
  | 'website'
  | 'youtube'
  | 'discord';

export interface SocialLinksBlock extends BlockBase {
  type: 'social-links';
  links: { platform: SocialPlatform; url: string }[];
}

// --- Input blocks (produce an answer keyed by block id) ---

interface InputBlockBase extends BlockBase {
  /** The question label. */
  title: string;
  /** Helper text under the label. */
  subtitle?: string;
  placeholder?: string;
  required: boolean;
}

export interface ShortTextBlock extends InputBlockBase {
  type: 'short-text';
  defaultValue?: string;
  validation?: { minLength?: number; maxLength?: number; pattern?: string };
}

export interface LongTextBlock extends InputBlockBase {
  type: 'long-text';
  defaultValue?: string;
  validation?: { minLength?: number; maxLength?: number };
}

export interface RichTextBlock extends InputBlockBase {
  type: 'rich-text';
  /** Answer is HTML, sanitized on submit. */
  validation?: { maxLength?: number };
}

export interface EmailBlock extends InputBlockBase {
  type: 'email';
  defaultValue?: string;
  /** e.g. 'ashoka.edu.in' */
  restrictToDomain?: string;
}

export interface PhoneBlock extends InputBlockBase {
  type: 'phone';
  defaultCountryCode?: string;
}

export interface NumberBlock extends InputBlockBase {
  type: 'number';
  defaultValue?: number;
  validation?: { min?: number; max?: number; integer?: boolean };
}

export interface CheckboxBlock extends InputBlockBase {
  type: 'checkbox';
  /** Single consent-style checkbox. */
  defaultValue?: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectBlock extends InputBlockBase {
  type: 'select';
  options: SelectOption[];
  defaultValue?: string;
}

export interface MultiSelectBlock extends InputBlockBase {
  type: 'multi-select';
  options: SelectOption[];
  style: 'dropdown' | 'checkboxes';
  defaultValue?: string[];
  validation?: { minSelected?: number; maxSelected?: number };
}

export interface DateBlock extends InputBlockBase {
  type: 'date';
  /** ISO date. */
  defaultValue?: string;
  validation?: { minDate?: string; maxDate?: string };
}

export interface DateTimeBlock extends InputBlockBase {
  type: 'datetime';
  /** ISO datetime. */
  defaultValue?: string;
}

export interface FileUploadBlock extends InputBlockBase {
  type: 'file-upload';
  accept: 'images' | 'documents' | 'both';
  multiple: boolean;
  /** ≤ 5 */
  maxFiles: number;
  /** ≤ 10 */
  maxSizeMB: number;
}

export type FormBlock =
  | TitleBlock
  | ParagraphBlock
  | DividerBlock
  | ImageBlock
  | SocialLinksBlock
  | ShortTextBlock
  | LongTextBlock
  | RichTextBlock
  | EmailBlock
  | PhoneBlock
  | NumberBlock
  | CheckboxBlock
  | SelectBlock
  | MultiSelectBlock
  | DateBlock
  | DateTimeBlock
  | FileUploadBlock;

export type FormBlockType = FormBlock['type'];

export const INPUT_BLOCK_TYPES = [
  'short-text',
  'long-text',
  'rich-text',
  'email',
  'phone',
  'number',
  'checkbox',
  'select',
  'multi-select',
  'date',
  'datetime',
  'file-upload',
] as const;

export type InputBlockType = (typeof INPUT_BLOCK_TYPES)[number];

export const DISPLAY_BLOCK_TYPES = [
  'title',
  'paragraph',
  'divider',
  'image',
  'social-links',
] as const;

export type InputBlock = Extract<FormBlock, { type: InputBlockType }>;

/** Narrowing helper — true when the block produces an answer keyed by its id. */
export function isInputBlock(block: FormBlock): block is InputBlock {
  return (INPUT_BLOCK_TYPES as readonly string[]).includes(block.type);
}

// ---------- Pages ----------

export interface FormPage {
  /** uuidv4. */
  id: string;
  /** Shown in the page navigator / progress bar. */
  title?: string;
  /** Render order = array order (drag & drop reorders this array). */
  blocks: FormBlock[];
  /** Page-level condition; hidden pages are skipped entirely. */
  visibleWhen?: RuleGroup;
}

// ---------- Theme (see §5) ----------

export interface FontConfig {
  family: string;
  weight: 300 | 400 | 500 | 600 | 700 | 800 | 900;
  italic: boolean;
}

export interface FormThemeColors {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  border: string;
  error: string;
}

export interface FormTheme {
  colors: FormThemeColors;
  fonts: { heading: FontConfig; body: FontConfig; button: FontConfig };
  /** px, 0–24 */
  radius: number;
  buttonStyle: 'solid' | 'outline';
}

// ---------- Settings ----------

export interface FormSettings {
  /** default: "Response recorded" */
  confirmationTitle: string;
  /** Rich text, sanitized server-side; shown after submit. */
  confirmationHtml: string;
  /** default: "Submit" */
  submitButtonText: string;
  /** default: true — email the respondent their answers. */
  sendEmailCopy: boolean;
  /** default: true */
  showProgressBar: boolean;
}

// ---------- Root ----------

export interface FormSchema {
  /** FORM_SCHEMA_VERSION at save time. */
  schemaVersion: number;
  /** min 1 page. */
  pages: FormPage[];
  theme: FormTheme;
  settings: FormSettings;
}

// ---------- Response data ----------

/**
 * Keyed by input-block id. Value types per block type:
 *   short-text/long-text/email/phone/select/date/datetime/rich-text → string
 *   number → number | null; checkbox → boolean; multi-select → string[]
 *   file-upload → FileDescriptor[]
 */
export type FormResponseData = Record<string, unknown>;

export interface FileDescriptor {
  blockId: string;
  url: string;
  publicId: string;
  filename: string;
  bytes: number;
}

// ---------- Hard limits (shared by validator + builder UI) ----------

export const FORM_LIMITS = {
  maxPages: 20,
  maxBlocksPerPage: 60,
  maxOptions: 100,
  maxTextChars: 5000,
  maxHtmlChars: 20000,
  maxRulesPerGroup: 10,
  maxPatternChars: 200,
  maxTitleChars: 200,
  /** Hard ceiling on uploads regardless of per-block config. */
  fileMaxSizeMB: 10,
  fileMaxFiles: 5,
  /** Raw draft body cap (bytes). */
  draftBodyBytes: 512 * 1024,
} as const;
