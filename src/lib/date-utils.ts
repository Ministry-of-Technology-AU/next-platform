/**
 * Date utilities for handling IST (Indian Standard Time)
 * IST is UTC+5:30
 */

export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds

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