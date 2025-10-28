export type OrganizationType = 'ministry' | 'club' | 'society' | 'fest' | 'collective' | 'iso' | 'league' | 'other';

export interface OrganizationMember {
  id: string | number;
  username: string;
  email: string;
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  description: string;
  fullDescription: string;
  bannerUrl: string;
  logoUrl: string | null; // Profile image from associated user
  
  // Member relations
  circle1_humans: OrganizationMember[];
  circle2_humans: OrganizationMember[];
  members: OrganizationMember[];
  interested_applicants: OrganizationMember[];
  
  // Induction details
  inductionsOpen: boolean;
  inductionEnd: string | null;
  inductionDescription: string;
  
  // Social links
  instagram: string;
  twitter: string;
  linkedin: string;
  youtube: string;
  website: string;
  whatsapp: string;
  
  // Additional fields
  calendarEventId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FilterOptions {
  clubs: boolean;
  societies: boolean;
  departments: boolean;
}
