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
  hasBanner?: boolean;
  logoUrl: string | null; // Profile image from associated user
  email?: string | null;
  
  // Member relations
  circle1_humans: OrganizationMember[];
  circle2_humans: OrganizationMember[];
  members: OrganizationMember[];
  interested_applicants: OrganizationMember[];
  
  // Induction details
  inductionsOpen: boolean;
  inductionEnd: string | null;
  inductionDescription: string;
  /**
   * Set when this entry represents one specific cycle. The catalogue API returns
   * one entry per organisation; the inductions page expands `inductionCycles`
   * into one entry per cycle, and stamps the cycle's id here.
   */
  cycleId?: string;
  cycleName?: string;
  cycleDescription?: string;
  openPositions?: OpenPosition[];
  /** Every cycle the org currently has running, newest deadline first. */
  inductionCycles?: InductionCycleEntry[];
  deadlineExtension?: DeadlineExtension | null;
  
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

export interface DeadlineExtension {
  extendedAt: string;
  previousDeadline: string;
  newDeadline: string;
  reason?: string | null;
}

/** One concurrently-running induction cycle belonging to an organisation. */
export interface InductionCycleEntry {
  id: string;
  name: string | null;
  description: string;
  endDate: string | null;
  openPositions: OpenPosition[];
  deadlineExtension: DeadlineExtension | null;
}

export interface OpenPosition {
  id: string;
  title: string;
  department?: string;
  description?: string;
  tier?: string;
  formUid?: string | null;
}

export interface FilterOptions {
  clubs: boolean;
  societies: boolean;
  departments: boolean;
}
