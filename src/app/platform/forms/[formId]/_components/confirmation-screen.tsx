'use client';

/**
 * Post-submit confirmation (spec §9.1 step 3) and the repeat-visit
 * "already responded" screen. Renders the org's customizable confirmation
 * message (sanitized server-side before it reaches here).
 */

import { CheckCircle2 } from 'lucide-react';

export function ConfirmationScreen({
  title,
  html,
  alreadyResponded = false,
}: {
  title: string;
  html: string;
  alreadyResponded?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: 'color-mix(in srgb, var(--form-primary) 14%, transparent)' }}
      >
        <CheckCircle2 className="h-9 w-9 text-[var(--form-primary)]" />
      </div>
      {alreadyResponded && (
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--form-text-muted)]">
          You&apos;ve already responded
        </p>
      )}
      <h1
        className="text-2xl font-bold text-[var(--form-text)]"
        style={{ fontFamily: 'var(--form-font-heading)' }}
      >
        {title}
      </h1>
      {html && (
        <div
          className="prose max-w-none text-[var(--form-text)]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}
