'use client';

/**
 * Live preview — renders the ACTUAL filler renderer (FormThemeRoot + FormBlocks)
 * with throwaway answers and submission disabled, so builder preview ≡ filler
 * reality (spec §8.5). Fonts are applied inline via the theme; note Google
 * Fonts aren't network-loaded in the builder chrome, so families fall back to
 * the system stack here (they load for real on the published filler page).
 */

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormThemeRoot } from '@/components/forms/form-theme-root';
import { FormBlocks } from '@/components/forms/form-renderer';
import { visiblePages, visibleBlocks } from '@/lib/forms/conditions';
import { isInputBlock, type FormSchema } from '@/lib/forms/schema';

export function BuilderPreview({ schema, title }: { schema: FormSchema; title: string }) {
  const [answers, setAnswers] = useState<Record<string, unknown>>(() => {
    const a: Record<string, unknown> = {};
    for (const page of schema.pages) {
      for (const block of page.blocks) {
        if (isInputBlock(block) && 'defaultValue' in block && block.defaultValue !== undefined) {
          a[block.id] = block.defaultValue;
        }
      }
    }
    return a;
  });
  const [pageIndex, setPageIndex] = useState(0);

  const vPages = useMemo(() => visiblePages(schema, answers), [schema, answers]);
  const idx = Math.min(pageIndex, Math.max(0, vPages.length - 1));
  const page = vPages[idx];
  const isLast = idx >= vPages.length - 1;

  const handleChange = (blockId: string, value: unknown) =>
    setAnswers((prev) => ({ ...prev, [blockId]: value }));

  return (
    <FormThemeRoot theme={schema.theme} className="min-h-full w-full px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-4 flex items-center justify-center gap-1.5 text-xs text-[var(--form-text-muted)]">
          <Eye className="h-3.5 w-3.5" />
          Preview — responses are not saved
        </div>
        <div className="py-2">
          <h1
            className="mb-8 text-3xl font-bold text-[var(--form-text)]"
            style={{ fontFamily: 'var(--form-font-heading)' }}
          >
            {title}
          </h1>

          {page ? (
            <FormBlocks blocks={visibleBlocks(page, answers)} answers={answers} onChange={handleChange} />
          ) : (
            <p className="text-[var(--form-text-muted)]">No visible pages with the current answers.</p>
          )}

          <div className="mt-10 flex items-center justify-between border-t border-[var(--form-border)] pt-6">
            <Button
              type="button"
              variant="ghost"
              disabled={idx === 0}
              onClick={() => setPageIndex(idx - 1)}
              className="gap-1 text-[var(--form-text)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              variant={schema.theme.buttonStyle === 'outline' ? 'outline' : 'default'}
              disabled={isLast}
              onClick={() => setPageIndex(idx + 1)}
              className="min-w-28 gap-1.5"
            >
              {isLast ? schema.settings.submitButtonText : 'Next'}
              {!isLast && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </FormThemeRoot>
  );
}
