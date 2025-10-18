export type AssetStatus = 'available' | 'unavailable';

export type AssetCategory = 'Techmin' | 'Jazbaa';

export interface Asset {
  id: string;
  name: string;
  description: string;
  category: AssetCategory;
  status: AssetStatus;
  imageUrl?: string;
  overdueDate?: string;
  bookmarked?: boolean;
}

export interface AssetFilters {
  category: AssetCategory | 'All';
  status?: AssetStatus;
}
