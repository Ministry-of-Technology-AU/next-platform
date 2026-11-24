export type EventCategory =
  | 'sports'
  | 'cultural'
  | 'academic'
  | 'tech'
  | 'other';

export type EventType =
  | 'fest'
  | 'single_event'
  | 'seminar'
  | 'conference';

  export interface IntercolEvent {
    id: string;
    name: string;
    hostCollege: string;
    category: EventCategory;
    eventType: EventType;
    description: string;
    fullDescription: string;
    bannerUrl: string | null;
    location: string;
    startDate: string;
    endDate: string | null;
    registrationUrl: string | null;
    websiteUrl: string | null;
    registrationDeadline: string | null;
    tags: string;
  }