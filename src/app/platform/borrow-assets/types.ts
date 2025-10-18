export type AssetStatus = 'available' | 'unavailable';

export type AssetTab = 'All' | 'Techmin' | 'Jazbaa' | 'Bookmarks';

export type AssetType = 'Phone' | 'Cable' | 'Speaker' | 'Lights' | 'Accessories';

export interface Asset {
  id: string;
  name: string;
  description: string;
  tab: AssetTab;
  type: AssetType;
  status: AssetStatus;
  imageUrl?: string;
  overdueDate?: string;
  bookmarked?: boolean;
}
