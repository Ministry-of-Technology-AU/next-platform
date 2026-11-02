import 'server-only';

import { strapiPost } from '@/lib/apis/strapi';
import type { BorrowRequestInput } from '@/app/platform/borrow-assets/types';

/**
 * Saves a pending request: no `issued_on` / `issued_by` until a POC hands the item over in Strapi.
 * Marks it as the asset's latest booking; Strapi moves the one-to-one link off the previous request.
 *
 * The cached catalogue is left alone on purpose. A pending request doesn't put the item on loan,
 * and the viewer's own "requested" state is read fresh on every load.
 */
export async function createBorrowRequest(
  uid: number,
  assetId: number,
  today: string,
  { to, reason }: Pick<BorrowRequestInput, 'to' | 'reason'>,
): Promise<number> {
  const created: { data: { id: number } } = await strapiPost('/borrow-requests', {
    data: {
      from: today,
      to,
      reason,
      user: uid,
      asset: assetId,
      is_the_latest_booking_of: assetId,
    },
  });
  return created.data.id;
}
