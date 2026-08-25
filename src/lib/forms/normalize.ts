/**
 * Schema normalisation — the last step before validation on every save.
 *
 * The builder lets an org clear any text field while editing (a question label,
 * an option label, the submit button text). Zod requires those to be non-empty,
 * so a half-finished edit used to fail the autosave with an opaque
 * `pages.0.blocks.9.title` error and block every later save. Normalising first
 * back-fills the blanks with the same defaults a freshly-created block gets, so
 * an in-progress edit can always be saved and picked up again later.
 *
 * Shared server/client module (no server-only imports).
 */

import { DEFAULT_INPUT_TITLES } from './defaults';
import {
  isInputBlock,
  type FormBlock,
  type FormSchema,
  type SelectOption,
} from './schema';

/** Title shown for an input block whose label the org has left blank. */
function fallbackTitle(block: FormBlock): string {
  return DEFAULT_INPUT_TITLES[block.type] ?? 'Untitled question';
}

function normalizeOptions(options: SelectOption[]): SelectOption[] {
  const next = options.map((option, index) => {
    const value = option.value?.trim() || `option-${index + 1}`;
    const label =
      option.label?.trim() ||
      // Auto-generated values read badly as labels; number them instead.
      (/^option-\d+$/.test(value) ? `Option ${index + 1}` : value);
    return { value, label };
  });
  // `select` / `multi-select` need at least one option to be a valid schema.
  return next.length > 0 ? next : [{ value: 'option-1', label: 'Option 1' }];
}

function normalizeBlock(block: FormBlock): FormBlock {
  const next = { ...block } as FormBlock;

  if (isInputBlock(next)) {
    next.title = next.title?.trim() || fallbackTitle(next);
    if (next.subtitle !== undefined) next.subtitle = next.subtitle.trim();
    if (next.placeholder !== undefined) next.placeholder = next.placeholder.trim();
  }

  if (next.type === 'social-links') {
    next.links = (next.links ?? [])
      .map((link) => {
        const url = link.url?.trim() ?? '';
        const label = link.label?.trim();
        return link.platform === 'custom'
          ? { platform: link.platform, url, label: label || 'Link' }
          : { platform: link.platform, url };
      })
      // A row whose URL hasn't been filled in yet would fail the https check
      // and block the save; it carries no value, so drop it.
      .filter((link) => link.url !== '');
  }

  if (next.type === 'select' || next.type === 'multi-select') {
    next.options = normalizeOptions(next.options ?? []);
    // A default that no longer matches any option would fail submit validation.
    if (next.type === 'select' && next.defaultValue) {
      const allowed = new Set(next.options.map((o) => o.value));
      if (!allowed.has(next.defaultValue)) next.defaultValue = undefined;
    }
    if (next.type === 'multi-select' && next.defaultValue) {
      const allowed = new Set(next.options.map((o) => o.value));
      next.defaultValue = next.defaultValue.filter((v) => allowed.has(v));
    }
  }

  return next;
}

/**
 * Returns a normalised copy of `schema`. Never throws — anything it cannot
 * repair is left for the validator to report.
 */
export function normalizeFormSchema(schema: FormSchema): FormSchema {
  return {
    ...schema,
    pages: (schema.pages ?? []).map((page) => ({
      ...page,
      title: page.title?.trim() || undefined,
      blocks: (page.blocks ?? []).map(normalizeBlock),
    })),
    settings: {
      ...schema.settings,
      submitButtonText: schema.settings?.submitButtonText?.trim() || 'Submit',
      confirmationTitle: schema.settings?.confirmationTitle?.trim() || 'Response recorded',
    },
  };
}
