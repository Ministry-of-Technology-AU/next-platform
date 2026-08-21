export type RoleTier = 'tier-1' | 'tier-2' | 'other';
export type CycleStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface CycleStats {
  totalOpens: number;
  totalFills: number;
  completionRate: number;
  rolesCount: number;
  applicantsCount: number;
}

export interface InductionCycleSummary {
  id: string;
  name: string;
  status: CycleStatus;
  startDate: string | null;
  endDate: string | null;
  stats: CycleStats;
  createdAt: string;
}

export interface RoleStats {
  opens: number;
  fills: number;
  completionRate: number;
  topUtm: string | null; // "Coming Soon"
}

export interface InductionRole {
  id: string;
  name: string;
  tier: RoleTier;
  department: string | null;
  description: string | null;
  stats: RoleStats;
  createdAt: string;
}

export type PipelineRoundType = 'form' | 'interview';

export interface InterviewBooking {
  slotKey: string; // e.g. "2026-08-25-10:00am-10:30am" or "Mon-10:00am-10:30am"
  candidateEmail: string;
  candidateName?: string;
  bookedAt: string;
}

export interface InterviewConfig {
  eventTitle: string;
  eventDescription: string;
  location?: string;
  invitees: string[]; // Org & panelist emails to add as calendar invitees
  dateMode: 'dates' | 'days';
  startDate?: string | null;
  endDate?: string | null;
  selectedDays?: string[];
  slotMode: 'default' | 'ashoka' | 'custom';
  slotDuration: number; // 15, 30, 45, 60
  selectedSlots: string[]; // List of selected cell keys
  disclaimer?: string;
  bookings?: InterviewBooking[];
}

export interface PipelineRound {
  id: string;
  type: PipelineRoundType;
  label: string;
  formId: string | null;
  deadline: string | null;
  description: string | null;
  order: number;
  interviewConfig?: InterviewConfig | null;
}

/** Placeholder stat values used when no real data is available yet. */
export const PLACEHOLDER_CYCLE_STATS: CycleStats = {
  totalOpens: 0,
  totalFills: 0,
  completionRate: 0,
  rolesCount: 0,
  applicantsCount: 0,
};

export const PLACEHOLDER_ROLE_STATS: RoleStats = {
  opens: 0,
  fills: 0,
  completionRate: 0,
  topUtm: null,
};

export const CYCLE_STATUS_STYLE: Record<CycleStatus, string> = {
  active: 'bg-green/15 text-green-dark dark:text-green-light',
  draft: 'bg-secondary/40 text-secondary-extradark dark:text-secondary',
  completed: 'bg-blue/15 text-blue-dark dark:text-blue-light',
  archived: 'bg-muted text-muted-foreground',
};

export const TIER_LABELS: Record<RoleTier, string> = {
  'tier-1': 'Tier 1',
  'tier-2': 'Tier 2',
  'other': 'Other',
};
