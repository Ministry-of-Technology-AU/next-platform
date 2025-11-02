export type AssetStatus = 'available' | 'borrowed' | 'overdue' | 'unavailable';

export type AssetTab = 'All' | 'Techmin' | 'Jazbaa' | 'Bookmarks';

export type AssetType = 'mobile' | 'cable' | 'adapter';

export interface User {
  id: number;
  email: string;
  username: string;
  // Add other user fields as needed
}

export interface BorrowRequest {
  id: number;
  from: string; // date
  to: string; // date
  issued?: number; // 0 or 1
  returned?: number; // 0 or 1
  user: {
    data: User;
  };
  asset: {
    data: Asset;
  };
  reason: string;
  issued_by?: {
    data: User;
  };
  returned_to?: {
    data: User;
  };
  is_the_latest_booking_of?: {
    data: Asset;
  };
  issued_on?: string; // date
  returned_on?: string; // date
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface CreateBorrowRequestData {
  from: string;
  to: string;
  user: number;
  asset: number;
  reason: string;
  issued_on?: string; // Optional, set when request is created
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
