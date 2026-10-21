/** Who lends the item. Set per asset by the `owner` enum in Strapi; missing means Techmin. */
export type AssetOwner = 'Techmin' | 'Jazbaa';

export type AssetTab = 'All' | AssetOwner | 'Saved';

/**
 * `available` covers both "nobody has asked" and "someone has asked but it hasn't been
 * handed over yet". An item is out only while a POC has `is_issued` ticked on it in Strapi.
 */
export type AssetStatus = 'available' | 'borrowed' | 'overdue';

export interface OwnerContact {
  /** Who signs the email and approves requests. */
  team: string;
  /** Public inbox the page shows when the confirmation email fails. The POCs CC'd on requests come from Strapi. */
  email: string;
}

/**
 * The part of an asset that is the same for every viewer. Cached on the server, so it must
 * never carry anything about the person looking at it.
 */
export interface CatalogueAsset {
  id: string;
  name: string;
  description: string;
  /** Strapi `type` enum. Free-form so new kinds of item need no frontend change. */
  type: string;
  owner: AssetOwner;
  image: { url: string; alt: string } | null;
  /** The asset's `is_issued` flag in Strapi: a POC has handed it over. */
  onLoan: boolean;
  /** YYYY-MM-DD the current borrower is due to return it. Null unless it's on loan. */
  dueBack: string | null;
}

export interface Asset extends Omit<CatalogueAsset, 'onLoan'> {
  status: AssetStatus;
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
