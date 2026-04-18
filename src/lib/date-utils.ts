/**
 * Date utilities for handling IST (Indian Standard Time)
 * IST is UTC+5:30
 */

export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
export const IST_TIME_ZONE = 'Asia/Kolkata';

const IST_DATE_FORMATTER = new Intl.DateTimeFormat('en-IN', {
  timeZone: IST_TIME_ZONE,
  dateStyle: 'medium',
});

const IST_TIME_FORMATTER = new Intl.DateTimeFormat('en-IN', {
  timeZone: IST_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const IST_INPUT_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: IST_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/**
 * Get current date in IST as a Date object
 */
export function getCurrentDateIST(): Date {
  const now = new Date();
  return new Date(now.getTime() + IST_OFFSET_MS);
}

/**
 * Get current date in IST as YYYY-MM-DD string
 */
export function getCurrentDateISTString(): string {
  return getCurrentDateIST().toISOString().split('T')[0];
}

/**
 * Convert a date to IST
 */
export function toIST(date: Date): Date {
  return new Date(date.getTime() + IST_OFFSET_MS);
}

/**
 * Get IST date string from a Date object
 */
export function toISTString(date: Date): string {
  return toIST(date).toISOString().split('T')[0];
}

/**
 * Convert an IST datetime-local string into a UTC ISO string for persistence.
 */
export function convertISTDateTimeLocalToISOString(value: string): string {
  if (!value) return '';

  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
  const normalizedValue = hasTimezone ? value : `${value}${value.length === 16 ? ':00' : ''}+05:30`;
  const parsed = new Date(normalizedValue);

  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
}

/**
 * Convert a stored UTC/ISO datetime into an IST datetime-local string.
 */
export function formatISTDateTimeForInput(value?: string): string {
  if (!value) return '';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';

  const parts = IST_INPUT_FORMATTER.formatToParts(parsed);
  const lookup = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  ) as Record<string, string>;

  if (!lookup.year || !lookup.month || !lookup.day || !lookup.hour || !lookup.minute) {
    return '';
  }

  return `${lookup.year}-${lookup.month}-${lookup.day}T${lookup.hour}:${lookup.minute}`;
}

/**
 * Format a stored datetime for APL display in IST.
 */
export function formatISTDateTimeDisplay(value?: string): { date: string; time: string } {
  if (!value) {
    return { date: '', time: '' };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { date: '', time: '' };
  }

  return {
    date: IST_DATE_FORMATTER.format(parsed),
    time: IST_TIME_FORMATTER.format(parsed),
  };
}

/**
 * Check if a date string (YYYY-MM-DD) is before today in IST
 */
export function isBeforeTodayIST(dateString: string): boolean {
  const inputDate = new Date(dateString);
  const todayIST = getCurrentDateISTString();
  return dateString < todayIST;
}

/**
 * Check if a date is overdue compared to current IST time
 */
export function isOverdueIST(dueDateString: string): boolean {
  const currentIST = getCurrentDateIST();
  const dueDate = new Date(dueDateString + 'T23:59:59.999Z'); // End of the due date
  return currentIST > dueDate;
}