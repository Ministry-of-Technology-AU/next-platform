'use client';

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { PhoneInput } from '@/components/form';
import { useIsMac } from '@/hooks/useIsMac';
import { OWNER_CONTACTS, REASON_MAX_LENGTH } from '../data';
import { borrowRequestSchema } from '../schema';
import { haptic } from '@/lib/haptics';
import type { Asset, BorrowRequestInput, BorrowRequestResult } from '../types';
import { ReturnDateField } from './return-date-field';
import { TermsGate } from './terms-gate';

type FieldErrors = Partial<Record<keyof BorrowRequestInput | 'agreed', string>>;

interface RequestFormProps {
  asset: Asset;
  defaultPhone: string;
  onCancel?: () => void;
  onRequested: (asset: Asset) => void;
}

export function RequestForm({ asset, defaultPhone, onCancel, onRequested }: RequestFormProps) {
  const isMac = useIsMac();
  const contact = OWNER_CONTACTS[asset.owner];
  const [to, setTo] = useState('');
  const [reason, setReason] = useState('');
  const [phone, setPhone] = useState(defaultPhone);
  const [termsRead, setTermsRead] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): BorrowRequestInput | null {
    const parsed = borrowRequestSchema.safeParse({ to, reason, phone });
    const next: FieldErrors = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof BorrowRequestInput;
        next[key] ??= issue.message;
      }
    }
    if (!agreed) next.agreed = termsRead ? 'Tick the box to agree to the terms.' : 'Read the terms to the end, then tick the box.';
    setErrors(next);
    if (!parsed.success || !agreed) {
      // Take the borrower to the first problem rather than leaving them to hunt.
      const first = (['agreed', 'to', 'reason', 'phone'] as const).find((key) => next[key]);
      if (first) document.querySelector<HTMLElement>(`[data-field="${first}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return null;
    }
    return parsed.data;
  }

  async function submit(e?: FormEvent) {
    e?.preventDefault();
    if (submitting) return;
    const body = validate();
    if (!body) {
      void haptic.error();
      return;
    }

    void haptic.press();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/platform/borrow-assets/${asset.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json: { success: true; data: BorrowRequestResult } | { success: false; error: string } = await res
        .json()
        .catch(() => ({ success: false, error: "Your request didn't go through. Try again in a minute." }));

      if (!json.success) {
        void haptic.error();
        toast.error(json.error);
        // 409 means there's already an open request from this person; reflect it.
        if (res.status === 409 && json.error.includes('open request')) onRequested(asset);
        return;
      }

      void haptic.confirm();
      if (json.data.emailSent) {
        toast.success(`Request sent for ${asset.name}`, {
          description: `Check your inbox. ${contact.team} will reply there to approve it and set a pickup time.`,
        });
      } else {
        toast.warning(`Request saved for ${asset.name}`, {
          description: `The confirmation email didn't send. If you don't hear back in a day, write to ${contact.email}.`,
          duration: 10000,
        });
      }
      onRequested(asset);
    } catch {
      void haptic.error();
      toast.error("You seem to be offline. Your request wasn't sent.");
    } finally {
      setSubmitting(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLFormElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void submit();
    }
  }

  return (
    <form onSubmit={submit} onKeyDown={onKeyDown} noValidate className="flex min-h-0 flex-1 flex-col" aria-busy={submitting}>
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 pb-4 sm:px-6">
        <div data-field="agreed">
          <TermsGate
            read={termsRead}
            onRead={() => setTermsRead(true)}
            agreed={agreed}
            onAgreedChange={(value) => {
              setAgreed(value);
              if (value) setErrors((prev) => ({ ...prev, agreed: undefined }));
            }}
            error={errors.agreed}
          />
        </div>

        <div data-field="to">
          <ReturnDateField
            value={to}
            onChange={(value) => {
              setTo(value);
              setErrors((prev) => ({ ...prev, to: undefined }));
            }}
            error={errors.to}
          />
        </div>

        <div className="space-y-2" data-field="reason">
          <Label htmlFor="borrow-reason">
            What&apos;s it for? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="borrow-reason"
            value={reason}
            maxLength={REASON_MAX_LENGTH}
            onChange={(e) => {
              setReason(e.target.value);
              if (errors.reason) setErrors((prev) => ({ ...prev, reason: undefined }));
            }}
            placeholder="e.g. Testing our app on Android for the CS project demo on Friday"
            rows={3}
            aria-invalid={!!errors.reason}
            aria-describedby="borrow-reason-hint"
            className="resize-none text-base sm:text-sm"
          />
          <div id="borrow-reason-hint" className="flex justify-between gap-4 text-sm">
            <span className={errors.reason ? 'text-destructive' : 'text-muted-foreground'}>
              {errors.reason ?? 'A line or two is enough.'}
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {reason.length}/{REASON_MAX_LENGTH}
            </span>
          </div>
        </div>

        <div data-field="phone">
          <PhoneInput
            title="Phone number"
            description={defaultPhone ? 'From your profile. Change it if you want to be reached on another number.' : 'So the team can reach you about pickup.'}
            isRequired
            value={phone}
            onChange={(value) => {
              setPhone(value);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
            }}
            errorMessage={errors.phone}
          />
        </div>

      </div>

      <div className="space-y-3 border-t bg-background px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-6">
        <p id="borrow-submit-hint" className="text-xs text-muted-foreground" aria-live="polite">
          {!termsRead
            ? 'Read the borrowing terms to the end to send a request.'
            : !agreed
              ? 'Tick the box under the terms to send a request.'
              : `You'll get a confirmation email. ${contact.team} approves and sets up pickup by replying to it.`}
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void haptic.tap();
                onCancel();
              }}
              className="hidden sm:inline-flex"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={submitting || !agreed}
            aria-describedby="borrow-submit-hint"
            className="h-11 sm:h-9 sm:min-w-40"
          >
            {submitting ? (
              <>
                <Spinner className="size-4" />
                Sending
              </>
            ) : (
              <>
                Send request
                <kbd className="ml-1 hidden rounded border border-primary-foreground/30 px-1 font-mono text-[10px] opacity-80 sm:inline">
                  {isMac ? '⌘↵' : 'Ctrl+↵'}
                </kbd>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
