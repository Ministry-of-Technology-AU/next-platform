import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizePlayerName(name: string | null | undefined): string {
  if (!name) return 'Unknown';
  return name.replace(/\s+\d+\s*$/, '').trim() || 'Unknown';
}

const HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
};

/**
 * Flattens a rich-text/HTML string into readable plain text.
 *
 * Descriptions authored in the rich-text editor are stored as HTML. Anywhere we
 * show a short clamped preview (cards, tooltips) we render text, not markup —
 * without this the raw tags leak into the middle of the preview.
 */
export function htmlToPlainText(input: string | null | undefined): string {
  if (!input) return '';
  return input
    // Drop anything whose contents are not user-visible.
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    // Block-level boundaries become spaces so words don't run together.
    .replace(/<\s*br\s*\/?\s*>/gi, ' ')
    .replace(/<\/\s*(p|div|li|h[1-6]|tr|blockquote)\s*>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name: string) => HTML_ENTITIES[name.toLowerCase()] ?? match)
    .replace(/\s+/g, ' ')
    .trim();
}
