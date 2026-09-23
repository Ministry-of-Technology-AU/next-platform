import type { FormStatus } from '@/lib/forms/strapi-forms';

export interface FormStatsView {
  uniqueVisits: number;
  draftCount: number;
  submissionCount: number;
  lastSubmissionAt: string | null;
  completionRate: number;
}

/** Public form summary sent to the org dashboard (id = form_uid, never numeric). */
export interface FormSummary {
  id: string;
  title: string;
  form_status: FormStatus;
  start_date: string | null;
  end_date: string | null;
  stats: FormStatsView;
  updatedAt: string | null;
}
