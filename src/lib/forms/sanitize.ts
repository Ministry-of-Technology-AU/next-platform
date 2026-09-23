import 'server-only';

/**
 * Server-side HTML sanitization for all org-authored and respondent-authored
 * HTML. This is the single stored-XSS guard (spec §14.5): org content is
 * rendered to other users, so every HTML string that crosses into a form must
 * pass through here at save/submit time. Never render unsanitized HTML.
 */

import DOMPurify from 'isomorphic-dompurify';
import {
  isInputBlock,
  type FormResponseData,
  type FormSchema,
  type ParagraphBlock,
} from './schema';

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'a',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'blockquote',
];
const ALLOWED_ATTR = ['href', 'target', 'rel'];
const ALLOWED_URI_REGEXP = /^(?:https?:|mailto:|tel:)/i;

let hookInstalled = false;
function ensureLinkHardeningHook() {
  if (hookInstalled) return;
  // Force safe link attributes on every sanitized anchor.
  DOMPurify.addHook('afterSanitizeAttributes', (node: Element) => {
    if (node.tagName === 'A' && node.getAttribute('href')) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
  hookInstalled = true;
}

/** Sanitize a single HTML string against the form allowlist. */
export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) return '';
  ensureLinkHardeningHook();
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP,
    FORBID_TAGS: ['style', 'script', 'iframe', 'form', 'input'],
  }) as unknown as string;
}

/**
 * Deep-clone `schema` and sanitize every org-authored HTML surface:
 * paragraph blocks' `html` and `settings.confirmationHtml`. Run this at builder
 * save time (spec §7.1 PUT), after zod validation.
 */
export function sanitizeFormSchema(schema: FormSchema): FormSchema {
  const next: FormSchema = structuredClone(schema);
  for (const page of next.pages) {
    for (const block of page.blocks) {
      if (block.type === 'paragraph') {
        (block as ParagraphBlock).html = sanitizeHtml((block as ParagraphBlock).html);
      }
    }
  }
  next.settings.confirmationHtml = sanitizeHtml(next.settings.confirmationHtml);
  return next;
}

/**
 * Sanitize respondent-authored rich-text answers in a response payload. Run at
 * submit time (spec §7.2 PUT) and again before email insertion. Mutates a copy.
 */
export function sanitizeResponseRichText(
  schema: FormSchema,
  data: FormResponseData,
): FormResponseData {
  const richTextIds = new Set<string>();
  for (const page of schema.pages) {
    for (const block of page.blocks) {
      if (isInputBlock(block) && block.type === 'rich-text') richTextIds.add(block.id);
    }
  }
  const next: FormResponseData = { ...data };
  for (const id of richTextIds) {
    if (typeof next[id] === 'string') next[id] = sanitizeHtml(next[id] as string);
  }
  return next;
}
