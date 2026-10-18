/**
 * CGPA maths on parsed AMS data. Pure functions, no React, so the planner UI, the API
 * and other tools all agree on the numbers.
 *
 * Rules (Ashoka, 4.0 scale):
 * - Letter grades count towards GPA with their points times the course credits.
 * - P counts towards earned credits only. F on a pass/fail course earns nothing and is not in GPA.
 * - TP earns its credits (at least 2) but is not in GPA; TP without credits does nothing.
 * - AU and anything that isn't a planner grade (bare "TP", "W", blanks) is ignored.
 * - A retaken course counts once: the best attempt wins. Zero-credit rows are never retakes.
 */

import type { CourseAttempt, GradeKey, ParsedCourse, ParsedSemester } from "./types";

export const GRADE_POINTS: Readonly<Record<GradeKey, number>> = {
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  "D-": 0.7,
  P: 0,
  "F (w P/F)": 0,
  "F (w/o P/F)": 0,
  AU: 0,
  "TP (w credits)": 0,
  "TP (w/o credits)": 0,
};

/** Grades a student can pick for a course still in progress, in the order they're shown. */
export const GRADE_OPTIONS: readonly GradeKey[] = [
  "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-",
  "P", "F (w P/F)", "F (w/o P/F)", "AU", "TP (w credits)", "TP (w/o credits)",
];

const GRADE_KEYS = new Set<string>(GRADE_OPTIONS);

export function isGradeKey(value: string): value is GradeKey {
  return GRADE_KEYS.has(value);
}

/**
 * Maps a stored grade onto a planner grade. Only exact planner grades count, as the planner
 * always has: bare AMS "TP", "F", "W" and blanks are left out of the maths.
 */
export function toGradeKey(raw: string | null | undefined): GradeKey | null {
  const grade = raw?.trim() ?? "";
  return grade && isGradeKey(grade) ? grade : null;
}

/** Identity used to spot retakes: the course codes, or the title when there are none. */
export function courseKey(course: Pick<ParsedCourse, "codes" | "code" | "title">): string | null {
  if (course.codes.length > 0) return course.codes.join("/");
  const code = course.code?.trim();
  if (code && code !== "--") return code.toUpperCase();
  const title = course.title?.trim();
  return title && title !== "--" ? title.toUpperCase() : null;
}

/** Stable reference to one course row: survives re-syncs as long as AMS keeps the row order. */
export function courseRef(term: Pick<ParsedSemester, "semester">, courseIndex: number): string {
  return `${term.semester}#${courseIndex}`;
}

/** Credits a grade earns for a course, for display in the planner. */
export function creditsFor(course: ParsedCourse, grade: GradeKey | null): number {
  if (grade === "TP (w credits)") return 2;
  if (grade === "TP (w/o credits)") return 0;
  return course.creditsRegistered ?? 0;
}

function attemptFor(
  key: string,
  grade: GradeKey,
  course: ParsedCourse,
  source: CourseAttempt["source"],
  sIdx: number,
  cIdx: number,
  useRecordedEarned: boolean,
): CourseAttempt | null {
  const registered = course.creditsRegistered ?? 0;
  const earned = useRecordedEarned ? course.creditsEarned ?? 0 : 0;
  const credits = registered > 0 ? registered : earned;
  const base = { key, gradeLabel: grade, source, sIdx, cIdx, gradePoints: 0, gpaCredits: 0, earnedCredits: 0, ratio: null };

  switch (grade) {
    case "AU":
    case "TP (w/o credits)":
    case "F (w P/F)":
      return base;
    case "P":
      return { ...base, earnedCredits: credits };
    case "TP (w credits)":
      return { ...base, earnedCredits: Math.max(earned, credits, 2) };
    default: {
      if (credits <= 0) return null;
      const gradePoints = GRADE_POINTS[grade] * credits;
      const earnedCredits = grade === "F (w/o P/F)" ? 0 : Math.max(earned, credits);
      return { ...base, gradePoints, gpaCredits: credits, earnedCredits, ratio: gradePoints / credits };
    }
  }
}

/** Picks the attempt that should count: higher grade ratio first, then more points, then fewer GPA credits. */
function betterAttempt(best: CourseAttempt, candidate: CourseAttempt): CourseAttempt {
  if (candidate.ratio !== null && best.ratio !== null) {
    if (candidate.ratio !== best.ratio) return candidate.ratio > best.ratio ? candidate : best;
    if (candidate.gradePoints !== best.gradePoints) return candidate.gradePoints > best.gradePoints ? candidate : best;
    return candidate.gpaCredits < best.gpaCredits ? candidate : best;
  }
  if (candidate.ratio !== null) return candidate.ratio > 0 ? candidate : best;
  if (best.ratio !== null) return best.ratio > 0 ? best : candidate;
  return candidate.earnedCredits > best.earnedCredits ? candidate : best;
}

export type PlanInput = {
  /** Every term, oldest first. */
  terms: ParsedSemester[];
  /** Grades picked for courses in in-progress terms, by course ref. */
  plannedGrades: Record<string, GradeKey>;
  /** Manual retake links: course ref -> the course key it retakes. */
  retakeLinks: Record<string, string>;
  /** Course refs the student has said are not retakes, overriding auto-detection. */
  unlinked: string[];
};

export type CourseState = {
  /** True when this row shares a course with another row (a retake group). */
  inRetakeGroup: boolean;
  /** In a retake group and this attempt is the one that counts. */
  counts: boolean;
  /** In a retake group and a better attempt replaced this one. */
  replaced: boolean;
};

export type PlanSummary = {
  totalGradePoints: number;
  totalGpaCredits: number;
  totalEarnedCredits: number;
  cgpa: number | null;
  /** Per course ref. Rows without a grade still appear, so the UI can show retake badges early. */
  courses: Record<string, CourseState>;
};

/** Runs the whole transcript (completed grades plus planned ones) through the retake rules. */
export function summarisePlan({ terms, plannedGrades, retakeLinks, unlinked }: PlanInput): PlanSummary {
  const unlinkedSet = new Set(unlinked);
  const groups = new Map<string, string[]>();
  const attempts = new Map<string, CourseAttempt[]>();
  const attemptRefs = new Map<CourseAttempt, string>();

  terms.forEach((term, sIdx) => {
    const isCompleted = term.status === "completed";
    term.courses.forEach((course, cIdx) => {
      const baseKey = courseKey(course);
      if (!baseKey) return;
      const ref = courseRef(term, cIdx);
      const zeroCredit = (course.creditsRegistered ?? 0) === 0 && (course.creditsEarned ?? 0) === 0;

      let bucket = baseKey;
      if (zeroCredit || unlinkedSet.has(ref)) bucket = `${baseKey}::${ref}`;
      else if (retakeLinks[ref]) bucket = retakeLinks[ref];

      groups.set(bucket, [...(groups.get(bucket) ?? []), ref]);

      const grade = isCompleted ? toGradeKey(course.grade) : plannedGrades[ref] ?? null;
      if (!grade) return;
      const attempt = attemptFor(baseKey, grade, course, isCompleted ? "past" : "current", sIdx, cIdx, isCompleted);
      if (!attempt) return;
      attempts.set(bucket, [...(attempts.get(bucket) ?? []), attempt]);
      attemptRefs.set(attempt, ref);
    });
  });

  const courses: Record<string, CourseState> = {};
  for (const refs of groups.values()) {
    for (const ref of refs) courses[ref] = { inRetakeGroup: refs.length > 1, counts: false, replaced: false };
  }

  let totalGradePoints = 0;
  let totalGpaCredits = 0;
  let totalEarnedCredits = 0;

  for (const bucketAttempts of attempts.values()) {
    const best = bucketAttempts.reduce(betterAttempt);
    totalGradePoints += best.gradePoints;
    totalGpaCredits += best.gpaCredits;
    totalEarnedCredits += best.earnedCredits;
    if (bucketAttempts.length < 2) continue;
    for (const attempt of bucketAttempts) {
      const ref = attemptRefs.get(attempt);
      const state = ref ? courses[ref] : undefined;
      if (!state) continue;
      state.counts = attempt === best;
      state.replaced = attempt !== best;
    }
  }

  return {
    totalGradePoints,
    totalGpaCredits,
    totalEarnedCredits,
    cgpa: totalGpaCredits > 0 ? totalGradePoints / totalGpaCredits : null,
    courses,
  };
}

/**
 * GPA and earned credits of one in-progress term from its planned grades, as AMS would print
 * them (no retake rules). TP with credits always earns 2.
 */
export function plannedTermGPA(term: ParsedSemester, plannedGrades: Record<string, GradeKey>) {
  let points = 0;
  let gpaCredits = 0;
  let earned = 0;
  term.courses.forEach((course, index) => {
    const grade = plannedGrades[courseRef(term, index)];
    if (!grade) return;
    const credits = course.creditsRegistered ?? 0;
    if (grade === "AU" || grade === "TP (w/o credits)" || grade === "F (w P/F)") return;
    if (grade === "P") {
      earned += credits;
      return;
    }
    if (grade === "TP (w credits)") {
      earned += 2;
      return;
    }
    points += GRADE_POINTS[grade] * credits;
    gpaCredits += credits;
    if (!grade.startsWith("F")) earned += credits;
  });
  return { gpa: gpaCredits > 0 ? points / gpaCredits : null, earnedCredits: earned };
}

// ---------------------------------------------------------------------------
// Goal calculators
// ---------------------------------------------------------------------------

/** A calculator answer: a number to show, or a sentence explaining why there isn't one. */
export type GoalResult = { kind: "value"; value: number } | { kind: "note"; text: string } | { kind: "empty" };

type Standing = { cgpa: number; gpaCredits: number; gradePoints: number };

const MAX_GPA = 4;

function readNumber(input: string): number | null {
  if (!input.trim()) return null;
  const value = Number.parseFloat(input);
  return Number.isFinite(value) ? value : Number.NaN;
}

/** GPA needed over the next `credits` to reach `target`. */
export function requiredGPA(standing: Standing, creditsInput: string, targetInput: string): GoalResult {
  const credits = readNumber(creditsInput);
  const target = readNumber(targetInput);
  if (credits === null || target === null) return { kind: "empty" };
  if (Number.isNaN(credits) || credits <= 0) return { kind: "note", text: "Enter a credit count above 0." };
  if (Number.isNaN(target) || target < 0 || target > MAX_GPA) return { kind: "note", text: "Target must be between 0 and 4." };
  if (standing.gpaCredits === 0) return { kind: "note", text: "Needs at least one graded term." };
  if (target <= standing.cgpa) return { kind: "note", text: "You're already at or above this target." };
  const needed = (target * (standing.gpaCredits + credits) - standing.gradePoints) / credits;
  if (needed > MAX_GPA) return { kind: "note", text: "Not reachable in these credits, even with straight As." };
  return { kind: "value", value: needed };
}

/** CGPA after `credits` more credits at an average of `average`. */
export function projectedCGPA(standing: Standing, averageInput: string, creditsInput: string): GoalResult {
  const average = readNumber(averageInput);
  const credits = readNumber(creditsInput);
  if (average === null || credits === null) return { kind: "empty" };
  if (Number.isNaN(average) || average < 0 || average > MAX_GPA) return { kind: "note", text: "Average must be between 0 and 4." };
  if (Number.isNaN(credits) || credits <= 0) return { kind: "note", text: "Enter a credit count above 0." };
  if (standing.gpaCredits === 0) return { kind: "note", text: "Needs at least one graded term." };
  return { kind: "value", value: (standing.gradePoints + average * credits) / (standing.gpaCredits + credits) };
}

/** Credits needed at a steady `average` to lift the CGPA to `target`. */
export function creditsToTarget(standing: Standing, targetInput: string, averageInput: string): GoalResult {
  const target = readNumber(targetInput);
  const average = readNumber(averageInput);
  if (target === null || average === null) return { kind: "empty" };
  if (Number.isNaN(target) || target < 0 || target > MAX_GPA) return { kind: "note", text: "Target must be between 0 and 4." };
  if (Number.isNaN(average) || average <= 0 || average > MAX_GPA) return { kind: "note", text: "Average must be between 0 and 4." };
  if (standing.gpaCredits === 0) return { kind: "note", text: "Needs at least one graded term." };
  const gap = target * standing.gpaCredits - standing.gradePoints;
  if (target <= standing.cgpa || gap <= 0) return { kind: "note", text: "You're already at or above this target." };
  if (average <= target) return { kind: "note", text: "Your average has to be above the target to pull the CGPA up." };
  return { kind: "value", value: gap / (average - target) };
}

/** Two decimals, or a dash when there's nothing to show. */
export function formatGPA(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? (Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2) : "--";
}
