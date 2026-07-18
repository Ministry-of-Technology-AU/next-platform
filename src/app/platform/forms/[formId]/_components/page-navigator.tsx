'use client';

import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageNavigatorProps {
  /** 0–100, or null to hide the progress bar. */
  progress: number | null;
  stepLabel?: string;
  backLabel: string | null;
  onBack?: () => void;
  primaryLabel: string;
  onPrimary: () => void;
  primaryLoading?: boolean;
  primaryOutline?: boolean;
  showNextIcon?: boolean;
}

/** Progress bar + Back / primary-action footer for the filler (spec §9.1). */
export function PageNavigator({
  progress,
  stepLabel,
  backLabel,
  onBack,
  primaryLabel,
  onPrimary,
  primaryLoading = false,
  primaryOutline = false,
  showNextIcon = true,
}: PageNavigatorProps) {
  return (
    <div className="space-y-4">
      {progress !== null && (
        <div className="space-y-1.5">
          {stepLabel && (
            <p className="text-xs font-medium text-[var(--form-text-muted)]">{stepLabel}</p>
          )}
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--form-border)]"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-[var(--form-primary)] transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        {backLabel ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="min-h-11 gap-1 text-[var(--form-text)]"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
        ) : (
          <span />
        )}

        <Button
          type="button"
          variant={primaryOutline ? 'outline' : 'default'}
          onClick={onPrimary}
          disabled={primaryLoading}
          className="min-h-11 min-w-32 gap-1.5"
        >
          {primaryLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              {primaryLabel}
              {showNextIcon && <ArrowRight className="h-4 w-4" />}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
