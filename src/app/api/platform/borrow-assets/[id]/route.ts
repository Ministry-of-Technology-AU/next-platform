import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/forms/api-helpers';
import { checkRateLimit, tooManyRequests } from '@/lib/rate-limit';
import { strapiGet, strapiPost, strapiPut } from '@/lib/apis/strapi';
import { getCurrentDateISTString } from '@/lib/date-utils';
import { absoluteImageUrl, isOut } from '@/lib/borrow-assets/data';
import { sendBorrowRequestEmail } from '@/lib/borrow-assets/email';
import { borrowRequestSchema, toAssetOwner } from '@/lib/borrow-assets/policy';
import type { BorrowRequestResult } from '@/app/platform/borrow-assets/types';

const ParamsSchema = z.object({ id: z.coerce.number().int().positive() });

// A real borrower sends one or two; this stops a stuck button from flooding the team's inbox.
const REQUEST_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

interface StrapiAssetForRequest {
  data: {
    id: number;
    attributes: {
      name: string | null;
      model: string | null;
      owner?: string | null;
      Image?: { data: { attributes: { url: string } } | null };
      last_borrow_request?: { data: { attributes: { issued: number | null; returned: number | null } } | null };
    };
  } | null;
}

/**
 * POST /api/platform/borrow-assets/[id]
 * Creates a borrow request starting today and emails the borrower, CC'ing the lending team.
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

    const today = getCurrentDateISTString();

    const assetResponse: StrapiAssetForRequest | null = await strapiGet(`/assets/${assetId}`, {
      populate: {
        Image: { fields: ['url'] },
        last_borrow_request: { fields: ['issued', 'returned'] },
      },
    }).catch(() => null);
    const asset = assetResponse?.data;
    if (!asset) return jsonError('That item no longer exists.', 404);
    if (isOut(asset.attributes.last_borrow_request?.data?.attributes)) {
      return jsonError("Someone has this item right now. Save it and check back once it's returned.", 409);
    }

    // An open request is one nobody has issued or closed yet. `$ne: 1` alone skips nulls in SQL,
    // so a fresh request (issued = null) has to be matched explicitly.
    const notSet = (key: 'issued' | 'returned') => ({ $or: [{ [key]: { $null: true } }, { [key]: { $ne: 1 } }] });
    const existing: { data?: unknown[] } | null = await strapiGet('/borrow-requests', {
      filters: {
        $and: [{ asset: { id: { $eq: assetId } } }, { user: { id: { $eq: user.uid } } }, notSet('issued'), notSet('returned')],
      },
      fields: ['from'],
      pagination: { pageSize: 1 },
    });
    if ((existing?.data?.length ?? 0) > 0) {
      return jsonError('You already have an open request for this item. Check your email for updates.', 409);
    }

    const created: { data: { id: number } } = await strapiPost('/borrow-requests', {
      data: {
        from: today,
        to,
        reason,
        user: user.uid,
        asset: assetId,
        // Kept from the original flow: admins read this as the request date.
        issued_on: today,
      },
    });

    await strapiPut(`/assets/${assetId}`, { data: { last_borrow_request: created.data.id } });

    const imageUrl = asset.attributes.Image?.data?.attributes.url;
    let emailSent = true;
    try {
      await sendBorrowRequestEmail({
        to: user.email,
        assetName: asset.attributes.name?.trim() || 'Unnamed item',
        assetModel: asset.attributes.model?.trim() || null,
        assetImageUrl: imageUrl ? absoluteImageUrl(imageUrl) : null,
        owner: toAssetOwner(asset.attributes.owner),
        from: today,
        returnBy: to,
        reason,
        phone,
      });
    } catch (mailError) {
      // The request is saved either way; the page tells the borrower the email didn't go.
      emailSent = false;
      platform.error('POST /api/platform/borrow-assets/[id] email failed:', mailError);
    }

    const result: BorrowRequestResult = { requestId: created.data.id, emailSent };
    return jsonOk(result, 201);
  } catch (error) {
    platform.error('POST /api/platform/borrow-assets/[id] failed:', error);
    return jsonError("Your request didn't go through. Try again in a minute.", 500);
  }
}
