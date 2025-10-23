export type OrganizationType = 'Club' | 'Society' | 'Ministry' | 'Department' | 'Fest' | 'Collective' | 'ISO' | 'League';

export interface Person {
  id: number;
  username: string;
  email: string;
}

export interface Organization {
  id: string;
  title: string;
  type: OrganizationType;
  description: string;
  fullDescription: string;
  imageUrl: string;
  profile_url?: string;
  categories: string[];
  inductionsOpen: boolean;
  createdAt: string;
  updatedAt: string;
  circle1_humans: Person[]; // People (general members)
  circle2_humans: Person[]; // Core team
  interested_applicants: Person[];
  // Social links
  instagram?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  youtube?: string | null;
  website?: string | null;
  whatsapp?: string | null;
}

export interface FilterOptions {
  clubs: boolean;
  societies: boolean;
  departments: boolean;
}
