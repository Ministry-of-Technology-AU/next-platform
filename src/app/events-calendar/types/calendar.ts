export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  organizingBody: string;
  description: string;
  category: "clubs" | "societies" | "departments" | "ministries" | "others";
  organization: string;
}

export interface Organization {
  id: string;
  name: string;
  category: "clubs" | "societies" | "departments" | "ministries" | "others";
}

export type CalendarView = "month" | "week" | "list" | "today";

export interface Preferences {
  selectedOrganizations: string[];
  selectedCategories: string[];
  categoryColors: Record<string, string>;
}
