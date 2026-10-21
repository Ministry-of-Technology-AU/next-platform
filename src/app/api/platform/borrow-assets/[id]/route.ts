import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/forms/api-helpers';
import { checkRateLimit, tooManyRequests } from '@/lib/rate-limit';
import { getCurrentDateISTString } from '@/lib/date-utils';
import { getAssetUncached, getOpenRequestAssetIds } from '@/app/platform/borrow-assets/_server/data';
import { sendBorrowRequestEmail } from '@/app/platform/borrow-assets/_server/email';
import { borrowRequestSchema } from '@/app/platform/borrow-assets/schema';
import type { BorrowRequestResult } from '@/app/platform/borrow-assets/types';
import { createBorrowRequest } from './helper';

export const dynamic = 'force-dynamic';

const ParamsSchema = z.object({ id: z.coerce.number().int().positive() });

// A real borrower sends one or two; this stops a stuck button from flooding the POCs' inboxes.
const REQUEST_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

/**
 * POST /api/platform/borrow-assets/[id]
 * Creates a borrow request starting today and emails the requester, CC'ing the Borrow Assets POCs.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return jsonError('Sign in to borrow items.', 401);
    if (!user.uid) return jsonError("Your account isn't set up on the platform yet.", 404);

    const limit = checkRateLimit(`borrow-assets:request:${user.email}`, REQUEST_LIMIT);
    if (!limit.ok) {
      return tooManyRequests(limit.retryAfter, 'You have sent a lot of requests in a short time. Wait a few minutes and try again.');
    }

    const parsedParams = ParamsSchema.safeParse(await params);
    if (!parsedParams.success) return jsonError('That item no longer exists.', 404);
    const assetId = parsedParams.data.id;

    const parsedBody = borrowRequestSchema.safeParse(await request.json().catch(() => null));
    if (!parsedBody.success) {
      return jsonError(parsedBody.error.issues[0]?.message ?? 'Check the form and try again.', 400);
    }
    const { to, reason, phone } = parsedBody.data;

    // Both read fresh: a loan or a request recorded seconds ago must still block this one.
    const [asset, openRequests] = await Promise.all([getAssetUncached(assetId), getOpenRequestAssetIds(user.uid)]);
    if (!asset) return jsonError('That item no longer exists.', 404);
    if (asset.onLoan) {
      return jsonError("This item is currently unavailable in the inventory.", 409);
    }
    if (openRequests.has(asset.id)) {
      return jsonError('You already have an open request for this item. Check your email for updates.', 409);
    }

    const today = getCurrentDateISTString();
    const requestId = await createBorrowRequest(user.uid, assetId, today, { to, reason });

    let emailSent = true;
    try {
      await sendBorrowRequestEmail({ requester: user.email, asset, from: today, returnBy: to, reason, phone });
    } catch (mailError) {
      // The request is saved either way; the page tells the requester the email didn't go.
      emailSent = false;
      platform.error('POST /api/platform/borrow-assets/[id] email failed:', mailError);
    }

    const result: BorrowRequestResult = { requestId, emailSent };
    return jsonOk(result, 201);
  } catch (error) {
    platform.error('POST /api/platform/borrow-assets/[id] failed:', error);
    return jsonError("Your request didn't go through. Try again in a minute.", 500);
  }
}
