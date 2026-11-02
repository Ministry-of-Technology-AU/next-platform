import { z } from 'zod';
import { field } from '@/lib/forms/fields';
import { addDaysToDateString, getCurrentDateISTString } from '@/lib/date-utils';
import { MAX_BORROW_DAYS, REASON_MAX_LENGTH, REASON_MIN_LENGTH } from './data';

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
