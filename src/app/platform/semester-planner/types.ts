export interface Course {
  id: string;
  code: string;
  name: string;
  professor: string;
  department: string;
  type: "Core" | "Elective" | "Lab" | "Seminar";
  credits: number;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  slot: string;
}

export interface ScheduledCourse extends Course {
  color: string;
}

export interface TimetableDraft {
  id: string;
  name: string;
  courses: ScheduledCourse[];
  createdAt: Date;
  updatedAt: Date;
}

export const TIME_SLOTS = [
  "8:30am-10:00am",
  "10:10am-11:40am",
  "11:50am-1:20pm",
  "LUNCH",
  "3:00pm-4:30pm",
  "4:40pm-6:10pm",
  "6:20pm-8:50pm",
] as const;

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

export const COURSE_COLORS = [
  "#87281B", // Primary
  "#0267C1", // Blue Primary
  "#519872", // Green Primary
  "#FFCD74", // Yellow Primary
  "#9B4E43", // Primary Light
  "#5197D6", // Blue Light
  "#70C49C", // Green Light
  "#F4B448", // Yellow Dark
] as const;