export type OrganizationType = 'Club' | 'Society' | 'Ministry' | 'Department' | 'Fest' | 'Collective' | 'ISO' | 'League';

export interface Organization {
  id: string;
  title: string;
  type: OrganizationType;
  description: string;
  fullDescription: string;
  imageUrl: string;
  categories: string[];
  inductionsOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FilterOptions {
  clubs: boolean;
  societies: boolean;
  departments: boolean;
}
