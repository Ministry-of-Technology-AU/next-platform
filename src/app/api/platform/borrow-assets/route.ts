import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/forms/api-helpers';
import { withCacheControl } from '@/lib/cache/headers';
import { strapiGet } from '@/lib/apis/strapi';
import { getBorrowAssets, setBookmark } from '@/app/platform/borrow-assets/_server/data';

export const dynamic = 'force-dynamic';

/**
 * GET /api/platform/borrow-assets
 * The catalogue with the viewer's bookmarks. The catalogue part comes from L2; the per-user part
 * is read fresh, and the combined body is per-user, so the browser never keeps it.
 */
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return jsonError('Sign in to see what you can borrow.', 401);

    const data = await getBorrowAssets(user);
    return withCacheControl(jsonOk(data), 'private');
  } catch (error) {
    platform.error('GET /api/platform/borrow-assets failed:', error);
    return jsonError("The item list didn't load. Try again in a minute.", 500);
  }
}

const BookmarkSchema = z.object({
  action: z.literal('bookmark'),
  assetId: z.coerce.number().int().positive(),
  bookmarked: z.boolean(),
});

/**
 * POST /api/platform/borrow-assets
 * Saves or unsaves an item. Sets the state rather than toggling, so a retry can't flip it back.
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return jsonError('Sign in to save items.', 401);
    if (!user.uid) return jsonError("Your account isn't set up on the platform yet.", 404);

    const parsed = BookmarkSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("That request didn't make sense. Reload and try again.", 400);
    const { assetId, bookmarked } = parsed.data;

    if (bookmarked) {
      const asset: { data?: { id: number } | null } | null = await strapiGet(`/assets/${assetId}`, {
        fields: ['name'],
      }).catch(() => null);
      if (!asset?.data) return jsonError('That item no longer exists.', 404);
    }

    await setBookmark(user.uid, assetId, bookmarked);
    return jsonOk({ bookmarked });
  } catch (error) {
    platform.error('POST /api/platform/borrow-assets failed:', error);
    return jsonError("Couldn't update your saved items. Try again.", 500);
  }
}
