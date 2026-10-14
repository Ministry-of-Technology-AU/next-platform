import { z } from "zod";
import { classifyTerm, splitCodes, termStatus, yearOf } from "./parser";
import type { ParsedCGPAData, ParsedCourse, ParsedSemester } from "./types";

/**
 * Validates report JSON from outside the parser (a client POSTing a report, or data saved
 * before the v2 shape existed) and fills in anything missing. Unknown keys are dropped.
 */

const finite = z.number().refine(Number.isFinite);
const figure = z.coerce.number().refine(Number.isFinite).catch(0);
const optionalFigure = finite.nullable().catch(null);
const optionalText = z.string().nullable().catch(null);

const CourseSchema = z.object({
  code: optionalText,
  codes: z.array(z.string()).catch([]),
  title: optionalText,
  creditsRegistered: optionalFigure,
  grade: optionalText,
  creditsEarned: optionalFigure,
  gradePoints: optionalFigure,
});

const TermSchema = z.object({
  semester: z.string().trim().min(1),
  courses: z.array(CourseSchema).catch([]),
  gpa: figure,
  semesterCreditsEarned: figure,
  cgpa: figure,
  honours: z.array(z.string()).catch([]),
});

const CategorySchema = z.object({
  category: z.string().min(1),
  programme: optionalText,
  coursesCompleted: figure,
  credits: figure,
});

const ReportSchema = z.object({
  degreeCGPA: figure,
  majorCGPA: figure,
  totalCredits: figure,
  programme: optionalText.optional(),
  categories: z.array(CategorySchema).catch([]),
  semesters: z.array(z.unknown()),
  warnings: z.array(z.string()).catch([]),
});

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

function normaliseCourse(course: z.infer<typeof CourseSchema>): ParsedCourse {
  const codes = course.codes.length > 0 ? course.codes.map((code) => code.trim().toUpperCase()) : splitCodes(course.code);
  const grade = course.grade?.trim() ?? "";
  return {
    code: course.code?.trim() || (codes.length > 0 ? codes.join("/ ") : null),
    codes,
    title: course.title?.trim() || null,
    creditsRegistered: course.creditsRegistered,
    grade: grade && grade !== "--" ? grade : null,
    creditsEarned: course.creditsEarned,
    gradePoints: course.gradePoints === null ? null : round2(course.gradePoints),
  };
}

function normaliseTerm(raw: unknown): ParsedSemester | null {
  const parsed = TermSchema.safeParse(raw);
  if (!parsed.success) return null;
  const term = parsed.data;
  const courses = term.courses.map(normaliseCourse);
  const base = {
    semester: term.semester,
    courses,
    gpa: round2(term.gpa),
    semesterCreditsEarned: round2(term.semesterCreditsEarned),
    cgpa: round2(term.cgpa),
  };
  // kind, year and status are always re-derived so a client can't send ones that disagree with the data.
  return {
    ...base,
    kind: classifyTerm(term.semester),
    year: yearOf(term.semester),
    status: termStatus(base),
    honours: term.honours,
  };
}

/** Returns a clean v2 report, or null when the input isn't a report at all. */
export function normaliseReport(raw: unknown): ParsedCGPAData | null {
  const parsed = ReportSchema.safeParse(raw);
  if (!parsed.success) return null;
  const report = parsed.data;
  return {
    version: 2,
    degreeCGPA: round2(report.degreeCGPA),
    majorCGPA: round2(report.majorCGPA),
    totalCredits: round2(report.totalCredits),
    programme: report.programme ?? null,
    categories: report.categories,
    semesters: report.semesters
      .map(normaliseTerm)
      .filter((term): term is ParsedSemester => term !== null),
    warnings: report.warnings,
  };
}
