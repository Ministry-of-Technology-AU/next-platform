export type EventCategory =
  | 'sports'
  | 'cultural'
  | 'academic'
  | 'tech'
  | 'other';

export interface IntercolEvent {
  id: string;
  name: string;
  hostCollege: string;
  category: EventCategory;
  description: string;
  fullDescription: string;
  bannerUrl: string | null;
  location: string;
  startDate: string; // ISO date string, e.g. "2026-12-05"
  endDate: string | null;
  registrationUrl: string | null;
  registrationDeadline: string | null;
}