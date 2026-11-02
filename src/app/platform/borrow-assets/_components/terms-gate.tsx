'use client';

import { useEffect, useRef } from 'react';
import { ArrowDown, CheckCircle2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { BORROWING_TERMS } from '../data';

interface TermsGateProps {
  /** The borrower has scrolled to the end of the terms. */
  read: boolean;
  onRead: () => void;
  agreed: boolean;
  onAgreedChange: (agreed: boolean) => void;
  error?: string;
}

// A few pixels of slack so sub-pixel scroll positions still count as the end.
const END_SLACK_PX = 8;

/**
 * The borrower's undertaking, shown first in the form. The agree box stays locked until the
 * terms have been scrolled to the end, and the request can't be sent until it's ticked.
 */
export function TermsGate({ read, onRead, agreed, onAgreedChange, error }: TermsGateProps) {
  const boxRef = useRef<HTMLDivElement>(null);

  function checkEnd() {
    const box = boxRef.current;
    if (!box || read) return;
    if (box.scrollTop + box.clientHeight >= box.scrollHeight - END_SLACK_PX) {
      void haptic.select();
      onRead();
    }
  }

  // On a tall screen the whole list may fit without scrolling; that counts as read.
  useEffect(() => {
    const box = boxRef.current;
    if (box && box.scrollHeight <= box.clientHeight + END_SLACK_PX) onRead();
    // Only on mount: after that, scrolling decides.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section aria-labelledby="borrow-terms-heading" className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="borrow-terms-heading" className="!text-left !text-sm !font-medium">
          Borrowing terms <span className="text-destructive">*</span>
        </h3>
        <span className={cn('flex items-center gap-1 text-xs', read ? 'text-green' : 'text-muted-foreground')} aria-live="polite">
          {read ? (
            <>
              <CheckCircle2 className="size-3.5" aria-hidden /> Read
            </>
          ) : (
            <>
              <ArrowDown className="size-3.5 motion-safe:animate-bounce" aria-hidden /> Scroll to the end
            </>
          )}
        </span>
      </div>

      <div className="relative">
        <div
          ref={boxRef}
          onScroll={checkEnd}
          tabIndex={0}
          role="region"
          aria-labelledby="borrow-terms-heading"
          className="max-h-60 overflow-y-auto rounded-lg border bg-muted/40 p-4 text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:max-h-72"
        >
          <p className="mb-3 text-muted-foreground">Read these before you ask to borrow. By sending a request, you agree to:</p>
          <ol className="list-decimal space-y-2 pl-5">
            {BORROWING_TERMS.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ol>
        </div>
        {/* Fade hints there's more below until the end is reached. */}
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-x-px bottom-px h-10 rounded-b-lg bg-gradient-to-t from-background to-transparent transition-opacity duration-200',
            read && 'opacity-0',
          )}
        />
      </div>

      <div
        className={cn(
          'flex items-start gap-3 rounded-lg border p-3 transition-colors',
          error ? 'border-destructive' : agreed ? 'border-primary/40 bg-primary/5' : '',
          !read && 'opacity-60',
        )}
      >
        <Checkbox
          id="borrow-agree"
          checked={agreed}
          disabled={!read}
          onCheckedChange={(checked) => {
            void haptic.tap();
            onAgreedChange(checked === true);
          }}
          aria-invalid={!!error}
          aria-describedby={error ? 'borrow-agree-error' : undefined}
          className="mt-0.5 size-5"
        />
        <Label htmlFor="borrow-agree" className={cn('text-sm font-normal leading-snug', !read && 'cursor-not-allowed')}>
          {read ? "I've read the terms and I'll follow them." : 'Read the terms to the end to agree.'}
        </Label>
      </div>
      {error && (
        <p id="borrow-agree-error" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
