/**
 * Borrow Assets rules shared by the page, the API routes and the confirmation email.
 * Client-safe: no secrets, no server imports.
 */

import { z } from 'zod';
import { field } from '@/lib/forms/fields';
import { addDaysToDateString, getCurrentDateISTString } from '@/lib/date-utils';
import type { AssetOwner } from '@/app/platform/borrow-assets/types';

/** Longest loan, in days from today. The form, the calendar and the API all enforce it. */
export const MAX_BORROW_DAYS = 30;

export const REASON_MIN_LENGTH = 10;
export const REASON_MAX_LENGTH = 300;

export interface OwnerContact {
  /** Who signs the email and approves requests. */
  team: string;
  /** Inbox that's CC'd on every request and receives replies. */
  email: string;
}

const TECHMIN_EMAIL = 'technology.ministry@ashoka.edu.in';

export const OWNER_CONTACTS: Record<AssetOwner, OwnerContact> = {
  Techmin: { team: 'Ministry of Technology', email: TECHMIN_EMAIL },
  // Jazbaa has no inbox on file yet, so its requests go to Techmin for now.
  Jazbaa: { team: 'Jazbaa', email: TECHMIN_EMAIL },
};

export const ASSET_OWNERS: readonly AssetOwner[] = ['Techmin', 'Jazbaa'];

/** Reads Strapi's `owner` enum. Anything missing or unknown is Techmin, the original lender. */
export function toAssetOwner(value: unknown): AssetOwner {
  return ASSET_OWNERS.find((owner) => owner === value) ?? 'Techmin';
}

/**
 * The request form, validated the same way in the browser and in the API route.
 * The start date is always today, so only the return date is sent.
 */
export const borrowRequestSchema = z.object({
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a return date.')
    .superRefine((to, ctx) => {
      const today = getCurrentDateISTString();
      if (to < today) ctx.addIssue({ code: 'custom', message: "The return date can't be in the past." });
      else if (to > addDaysToDateString(today, MAX_BORROW_DAYS)) {
        ctx.addIssue({ code: 'custom', message: `You can borrow for up to ${MAX_BORROW_DAYS} days. Pick an earlier date.` });
      }
    }),
  reason: z
    .string()
    .trim()
    .min(REASON_MIN_LENGTH, `Tell us a bit more about what it's for (at least ${REASON_MIN_LENGTH} characters).`)
    .max(REASON_MAX_LENGTH, `Keep it under ${REASON_MAX_LENGTH} characters.`),
  phone: field.phone({ label: 'Phone number' }),
});
