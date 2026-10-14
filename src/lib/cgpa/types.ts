/**
 * Shapes of a parsed AMS course report ("My Course Report and Degree/Diploma Status").
 *
 * This is the contract of POST /api/platform/cgpa-planner/parse and of the saved
 * `cgpa_data` on the Strapi user. Other tools (trajectory planner, external callers)
 * read it too, so changes must stay additive: older fields keep their names.
 */

/** What sort of term a block of courses belongs to. */
export type TermKind =
  | "monsoon"
  | "spring"
  | "summer"
  | "winter"
  | "abroad"
  | "internship"
  | "transfer"
  | "other";

/** `completed` once AMS shows at least one final grade; `in-progress` while every grade is blank. */
export type TermStatus = "completed" | "in-progress";

export type ParsedCourse = {
  /** All course codes as shown, joined with "/ " (cross-listed courses have several). */
  code: string | null;
  /** The same codes split out and normalised, e.g. ["MAT-1001", "CS-2210"]. */
  codes: string[];
  title: string | null;
  creditsRegistered: number | null;
  /** Grade exactly as AMS shows it ("A-", "P", "TP", "W"...). Null when AMS shows "--". */
  grade: string | null;
  creditsEarned: number | null;
  gradePoints: number | null;
};

export type ParsedSemester = {
  /** Term name as AMS shows it, e.g. "Monsoon 2023" or "Semester Abroad 2025". */
  semester: string;
  kind: TermKind;
  year: number | null;
  status: TermStatus;
  courses: ParsedCourse[];
  /** Term GPA from AMS. 0 when AMS has not computed one. */
  gpa: number;
  semesterCreditsEarned: number;
  /** CGPA after this term, from AMS. */
  cgpa: number;
  /** Distinctions printed next to the term, e.g. "Dean's List". */
  honours: string[];
};

/** One row of the credential summary table (FC, CT, CC, Internship, Major, Minor...). */
export type CreditCategory = {
  category: string;
  programme: string | null;
  coursesCompleted: number;
  credits: number;
};

export type ParsedCGPAData = {
  /** Bumped when the shape changes in a way readers need to know about. */
  version: 2;
  degreeCGPA: number;
  majorCGPA: number;
  totalCredits: number;
  /** e.g. "4 Year Degree". */
  programme: string | null;
  categories: CreditCategory[];
  semesters: ParsedSemester[];
  /** Lines that looked like course rows but could not be read. Empty when the parse was clean. */
  warnings: string[];
};

/** Grade labels the planner understands. AMS grades are mapped onto these before any maths. */
export type GradeKey =
  | "A" | "A-" | "B+" | "B" | "B-"
  | "C+" | "C" | "C-" | "D+" | "D" | "D-"
  | "P" | "F (w P/F)" | "F (w/o P/F)" | "AU"
  | "TP (w credits)" | "TP (w/o credits)";

export type AttemptSource = "past" | "current";

export type CourseAttempt = {
  key: string;
  gradeLabel: GradeKey;
  gradePoints: number;
  gpaCredits: number;
  earnedCredits: number;
  ratio: number | null;
  source: AttemptSource;
  sIdx: number | null;
  cIdx: number | null;
};
