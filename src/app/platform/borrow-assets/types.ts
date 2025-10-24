export type AssetStatus = 'available' | 'unavailable';

export type AssetTab = 'All' | 'Techmin' | 'Jazbaa' | 'Bookmarks';

export type AssetType = 'mobile' | 'cable' | 'adapter';

export interface BorrowRequest {
  id: string;
  // Add other borrow request fields as needed
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  name: string;
  model?: string;
  description: string;
  type: AssetType;
  tab: AssetTab; // Default to 'Techmin'
  status: AssetStatus; // Derived from borrow_requests
  Image?: {
    id: string;
    url: string;
    alternativeText?: string;
  };
  borrow_requests?: BorrowRequest[];
  last_borrow_request?: BorrowRequest;
  bookmarked?: boolean; // Default to false
  createdAt: string;
  updatedAt: string;
}
