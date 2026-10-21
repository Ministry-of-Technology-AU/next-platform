'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { addDaysToDateString, getCurrentDateISTString } from '@/lib/date-utils';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { MAX_BORROW_DAYS, QUICK_RETURN_DAYS } from '../data';
import { longDate, relativeDays } from '../utils';

interface ReturnDateFieldProps {
  /** YYYY-MM-DD, or '' when nothing is picked. */
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

/** Calendar dates as local midnight, so the day picker shows the same day the string names. */
function toLocalDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fromLocalDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const chip = 'h-10 rounded-full border px-4 text-sm transition-colors';
const chipIdle = 'bg-background text-foreground hover:bg-muted';
const chipActive = 'border-primary bg-primary text-primary-foreground';

export function ReturnDateField({ value, onChange, error }: ReturnDateFieldProps) {
  const today = getCurrentDateISTString();
  const quickValues = QUICK_RETURN_DAYS.map(({ days }) => addDaysToDateString(today, days));
  const isCustom = value !== '' && !quickValues.includes(value);
  const [calendarOpen, setCalendarOpen] = useState(isCustom);

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">
        Return by <span className="text-destructive">*</span>
      </legend>
      <div className="flex flex-wrap gap-2" aria-describedby={error ? 'return-date-error' : undefined}>
        {QUICK_RETURN_DAYS.map(({ label }, i) => {
          const date = quickValues[i];
          const active = value === date;
          return (
            <button
              key={label}
              type="button"
              aria-pressed={active}
              onClick={() => {
                void haptic.select();
                onChange(date);
                setCalendarOpen(false);
              }}
              className={cn(chip, active ? chipActive : chipIdle)}
            >
              {label}
            </button>
          );
        })}
        <button
          type="button"
          aria-pressed={isCustom || calendarOpen}
          aria-expanded={calendarOpen}
          onClick={() => {
            void haptic.select();
            setCalendarOpen((open) => !open);
          }}
          className={cn(chip, 'inline-flex items-center gap-1.5', isCustom ? chipActive : chipIdle)}
        >
          <CalendarDays className="size-4" aria-hidden />
          {isCustom ? longDate(value) : 'Other date'}
        </button>
      </div>

      <Collapsible open={calendarOpen} onOpenChange={setCalendarOpen}>
        <CollapsibleContent>
          <div className="mx-auto mt-1 w-fit rounded-lg border">
            <Calendar
              mode="single"
              selected={value ? toLocalDate(value) : undefined}
              defaultMonth={value ? toLocalDate(value) : toLocalDate(today)}
              disabled={{ before: toLocalDate(today), after: toLocalDate(addDaysToDateString(today, MAX_BORROW_DAYS)) }}
              onSelect={(date) => {
                if (!date) return;
                void haptic.select();
                onChange(fromLocalDate(date));
                setCalendarOpen(false);
              }}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {error ? (
        <p id="return-date-error" className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {value
            ? `${longDate(value)}, ${relativeDays(value)}.`
            : `Up to ${MAX_BORROW_DAYS} days.`}
        </p>
      )}
    </fieldset>
  );
}
