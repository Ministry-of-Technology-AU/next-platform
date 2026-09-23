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

/**
 * Normalizes a start date string (e.g. "2026-08-20" or ISO) to 12:00:00 AM (00:00:00.000) IST ISO string.
 */
export function normalizeStartDateToStartOfDay(value: string | null | undefined): string | null {
  if (!value) return null;
  const dateOnly = value.includes('T') ? value.split('T')[0] : value;
  // 12:00:00.000 AM IST (+05:30)
  const d = new Date(`${dateOnly}T00:00:00.000+05:30`);
  return Number.isNaN(d.getTime()) ? new Date(value).toISOString() : d.toISOString();
}

/**
 * Normalizes an end date / deadline string (e.g. "2026-08-20" or ISO) to 11:59:59.999 PM (23:59:59.999) IST ISO string.
 */
export function normalizeEndDateToEndOfDay(value: string | null | undefined): string | null {
  if (!value) return null;
  const dateOnly = value.includes('T') ? value.split('T')[0] : value;
  // 11:59:59.999 PM IST (+05:30)
  const d = new Date(`${dateOnly}T23:59:59.999+05:30`);
  return Number.isNaN(d.getTime()) ? new Date(value).toISOString() : d.toISOString();
}

const IST_CALENDAR_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: IST_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const IST_DISPLAY_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: IST_TIME_ZONE,
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

/**
 * Returns the calendar date parts for a date in IST (Asia/Kolkata).
 * Format: { year: 2026, month: 9, day: 11, dateString: '2026-09-11' }
 */
export function getISTCalendarDate(date: Date | string = new Date()): {
  year: number;
  month: number;
  day: number;
  dateString: string;
} {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    const fallback = new Date();
    const str = IST_CALENDAR_FORMATTER.format(fallback);
    const [year, month, day] = str.split('-').map(Number);
    return { year, month, day, dateString: str };
  }
  const dateString = IST_CALENDAR_FORMATTER.format(d);
  const [year, month, day] = dateString.split('-').map(Number);
  return { year, month, day, dateString };
}

/**
 * Calculates the difference in calendar days between a target date and a base date in IST.
 * Returns:
 *  0 = target is today (same calendar day in IST)
 *  1 = target is tomorrow
 *  2 = target is in 2 calendar days
 * <0 = target was in the past
 */
export function getISTCalendarDaysDiff(
  targetDate: Date | string,
  baseDate: Date | string = new Date()
): number {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const base = typeof baseDate === 'string' ? new Date(baseDate) : baseDate;

  if (isNaN(target.getTime()) || isNaN(base.getTime())) {
    return 0;
  }

  const tp = getISTCalendarDate(target);
  const bp = getISTCalendarDate(base);

  const targetUtc = Date.UTC(tp.year, tp.month - 1, tp.day);
  const baseUtc = Date.UTC(bp.year, bp.month - 1, bp.day);

  return Math.round((targetUtc - baseUtc) / (24 * 60 * 60 * 1000));
}

/**
 * Format a date into a human-readable string in IST (Asia/Kolkata).
 * Defaults to "Sep 11, 2026".
 */
export function formatISTDate(
  date: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  if (options) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: IST_TIME_ZONE,
      ...options,
    }).format(d);
  }

  return IST_DISPLAY_DATE_FORMATTER.format(d);
}

export interface DeadlineStatusIST {
  hasValidDeadline: boolean;
  isExpired: boolean;
  daysLeft: number | null;
  isToday: boolean;
  isTomorrow: boolean;
  isEndingSoon: boolean; // daysLeft <= 3 and daysLeft >= 0
  label: string; // "Closes Today!", "Closes Tomorrow!", "Closes in X days", or "X days left"
  formattedDeadline: string; // e.g. "Sep 11, 2026"
  deadlineDate: Date | null;
}

/**
 * Derives accurate deadline status based on IST (Asia/Kolkata) calendar day boundaries.
 * Correctly computes "Closes Today!", "Closes Tomorrow!", "Closes in X days" irrespective
 * of server time zone.
 */
export function getDeadlineStatusIST(
  deadlineInput: string | Date | null | undefined,
  nowInput: string | Date = new Date()
): DeadlineStatusIST {
  if (!deadlineInput) {
    return {
      hasValidDeadline: false,
      isExpired: false,
      daysLeft: null,
      isToday: false,
      isTomorrow: false,
      isEndingSoon: false,
      label: 'No active deadline',
      formattedDeadline: '',
      deadlineDate: null,
    };
  }

  const deadlineIso =
    typeof deadlineInput === 'string'
      ? normalizeEndDateToEndOfDay(deadlineInput) || deadlineInput
      : deadlineInput.toISOString();

  const deadlineDate = new Date(deadlineIso);
  const now = typeof nowInput === 'string' ? new Date(nowInput) : nowInput;

  if (isNaN(deadlineDate.getTime())) {
    return {
      hasValidDeadline: false,
      isExpired: false,
      daysLeft: null,
      isToday: false,
      isTomorrow: false,
      isEndingSoon: false,
      label: 'Invalid deadline',
      formattedDeadline: '',
      deadlineDate: null,
    };
  }

  const isExpired = deadlineDate.getTime() < now.getTime();
  const daysDiff = getISTCalendarDaysDiff(deadlineDate, now);
  const formattedDeadline = formatISTDate(deadlineDate);

  if (isExpired) {
    return {
      hasValidDeadline: true,
      isExpired: true,
      daysLeft: daysDiff,
      isToday: false,
      isTomorrow: false,
      isEndingSoon: false,
      label: `Ended ${formattedDeadline}`,
      formattedDeadline,
      deadlineDate,
    };
  }

  const isToday = daysDiff === 0;
  const isTomorrow = daysDiff === 1;
  const isEndingSoon = daysDiff >= 0 && daysDiff <= 3;

  let label: string;
  if (isToday) {
    label = 'Closes Today!';
  } else if (isTomorrow) {
    label = 'Closes Tomorrow!';
  } else if (isEndingSoon) {
    label = `Closes in ${daysDiff} days`;
  } else if (daysDiff > 3) {
    label = `${daysDiff} days left`;
  } else {
    label = 'Closes Today!';
  }

  return {
    hasValidDeadline: true,
    isExpired: false,
    daysLeft: Math.max(0, daysDiff),
    isToday,
    isTomorrow,
    isEndingSoon,
    label,
    formattedDeadline,
    deadlineDate,
  };
}

export interface DeadlineExtensionCheck {
  newDeadline?: string | null;
  extendedAt?: string | null;
  reason?: string | null;
}

/**
 * Determines whether a deadline extension banner should be shown.
 * Rules:
 * 1. Extension banner only shows for 1 day (24 hours) from extendedAt.
 * 2. Urgency trumps extension banner: if daysLeft <= 1 (Closes Tomorrow or Closes Today),
 *    this returns false so the urgency alert takes precedence.
 */
export function shouldShowDeadlineExtension(
  extension: DeadlineExtensionCheck | null | undefined,
  daysLeft: number | null,
  now: Date = new Date()
): boolean {
  if (!extension || !extension.extendedAt) return false;

  // Closes Tomorrow / Closes Today trumps the extended banner
  if (daysLeft !== null && daysLeft <= 1) {
    return false;
  }

  const extendedTime = new Date(extension.extendedAt).getTime();
  if (isNaN(extendedTime)) return false;

  const diffMs = now.getTime() - extendedTime;
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  // Only show for 1 day (24 hours) from extension
  return diffMs >= 0 && diffMs <= ONE_DAY_MS;
}