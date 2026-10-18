/** Who lends the item. Set per asset by the `owner` enum in Strapi; missing means Techmin. */
export type AssetOwner = 'Techmin' | 'Jazbaa';

export type AssetTab = 'All' | AssetOwner | 'Saved';

/**
 * `available` covers both "nobody has asked" and "someone has asked but it hasn't been
 * handed over yet". Only an issued, unreturned item is out.
 */
export type AssetStatus = 'available' | 'borrowed' | 'overdue';

export interface Asset {
  id: string;
  name: string;
  model: string | null;
  description: string;
  /** Strapi `type` enum. Free-form so new kinds of item need no frontend change. */
  type: string;
  owner: AssetOwner;
  status: AssetStatus;
  image: { url: string; alt: string } | null;
  /** YYYY-MM-DD the current borrower is due to return it. Null unless it's out. */
  dueBack: string | null;
  /** The viewer has an open request for this item that hasn't been issued yet. */
  pendingForMe: boolean;
  bookmarked: boolean;
}

/** What the page needs: the catalogue plus the viewer's saved phone number to prefill the form. */
export interface BorrowAssetsData {
  assets: Asset[];
  phone: string;
}

/** Body of POST /api/platform/borrow-assets/[id]. */
export interface BorrowRequestInput {
  /** YYYY-MM-DD return date. The start date is always today, set on the server. */
  to: string;
  reason: string;
  phone: string;
}

export interface BorrowRequestResult {
  requestId: number;
  /** False when the request saved but the confirmation email failed to send. */
  emailSent: boolean;
}

/** Body of POST /api/platform/borrow-assets — sets the saved state rather than toggling, so retries are safe. */
export interface BookmarkInput {
  action: 'bookmark';
  assetId: string;
  bookmarked: boolean;
}
