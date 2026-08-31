export type RoleTier = 'tier-1' | 'tier-2' | 'other';
export type CycleStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface DeadlineExtensionInfo {
  extendedAt: string;
  previousDeadline: string;
  newDeadline: string;
  reason?: string | null;
}

export interface CycleStats {
  totalOpens: number;
  totalFills: number;
  totalDrafts: number;
  completionRate: number;
  rolesCount: number;
  applicantsCount: number;
  deadlineExtension?: DeadlineExtensionInfo | null;
}

export interface InductionCycleSummary {
  id: string;
  name: string;
  status: CycleStatus;
  startDate: string | null;
  endDate: string | null;
  description?: string | null;
  stats: CycleStats;
  createdAt: string;
  deadlineExtension?: DeadlineExtensionInfo | null;
}

export interface RoleStats {
  opens: number;
  fills: number;
  drafts: number;
  completionRate: number;
  topUtm: string | null; // "Coming Soon"
}

export interface InductionRole {
  id: string;
  name: string;
  tier: RoleTier;
  department: string | null;
  description: string | null;
  accessEmails?: string[];
  formIds?: string[];
  primaryFormId?: string | null;
  sendResponseNotifications?: boolean; // default true
  stats: RoleStats;
  createdAt: string;
}

export type PipelineRoundType = 'form' | 'interview' | 'results';
export type PipelineRoundStatus = 'draft' | 'active' | 'completed' | 'paused';

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

export interface ResultsConfig {
  emailTemplate: string;   // HTML rich text
  sendEmail: boolean;      // default true
}

export interface PipelineRound {
  id: string;
  type: PipelineRoundType;
  label: string;
  status?: PipelineRoundStatus;
  /** @deprecated Use formIds instead. Kept for backward compat reads. */
  formId?: string | null;
  formIds: string[];
  deadline: string | null;
  description: string | null;
  order: number;
  interviewConfig?: InterviewConfig | null;
  resultsConfig?: ResultsConfig | null;
}

/** Placeholder stat values used when no real data is available yet. */
export const PLACEHOLDER_CYCLE_STATS: CycleStats = {
  totalOpens: 0,
  totalFills: 0,
  totalDrafts: 0,
  completionRate: 0,
  rolesCount: 0,
  applicantsCount: 0,
};

export const PLACEHOLDER_ROLE_STATS: RoleStats = {
  opens: 0,
  fills: 0,
  drafts: 0,
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
  'tier-1': 'Circle 1 (Leadership)',
  'tier-2': 'Circle 2 (Core Team)',
  'other': 'Circle 3 (General)',
};

export const CIRCLE_LABELS = TIER_LABELS;

export function formatCycleDateRange(startDateStr?: string | null, endDateStr?: string | null): string {
  if (!startDateStr && !endDateStr) return 'Dates TBD';

  const formatDatePart = (dStr: string, includeYear: boolean) => {
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return 'TBD';
    const day = d.getDate();
    const month = d.toLocaleDateString('en-IN', { month: 'short' });
    const year = d.getFullYear();
    return includeYear ? `${day} ${month} ${year}` : `${day} ${month}`;
  };

  const start = startDateStr ? formatDatePart(startDateStr, false) : 'TBD';
  const end = endDateStr ? formatDatePart(endDateStr, true) : 'TBD';

  return `${start} - ${end}`;
}

import { normalizeStartDateToStartOfDay, normalizeEndDateToEndOfDay } from '@/lib/date-utils';

export function getDerivedCycleStatus(
  status: CycleStatus = 'draft',
  startDateStr?: string | null,
  endDateStr?: string | null
): CycleStatus {
  if (status === 'archived') return 'archived';
  if (status === 'draft') return 'draft';
  if (!startDateStr && !endDateStr) return status;

  const now = new Date();

  let start: Date | null = null;
  if (startDateStr) {
    const startIso = normalizeStartDateToStartOfDay(startDateStr);
    const s = startIso ? new Date(startIso) : new Date(startDateStr);
    if (!isNaN(s.getTime())) {
      start = s;
    }
  }

  let end: Date | null = null;
  if (endDateStr) {
    const endIso = normalizeEndDateToEndOfDay(endDateStr);
    const e = endIso ? new Date(endIso) : new Date(endDateStr);
    if (!isNaN(e.getTime())) {
      end = e;
    }
  }

  if (start && now < start) {
    return 'draft';
  }
  if (end && now > end) {
    return 'completed';
  }
  if ((start && now >= start) || (!start && end && now <= end)) {
    return 'active';
  }

  return status;
}


