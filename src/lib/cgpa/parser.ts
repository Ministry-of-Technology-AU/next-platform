/**
 * Parser for the AMS course report ("My Course Report and Degree/Diploma Status"),
 * as pasted by a student after Ctrl+A / Ctrl+C on that page.
 *
 * Runs on the server only (the CGPA planner routes call it), so every client gets the
 * same structured JSON. It is written to survive changes to the AMS markup:
 *
 * - Cells may be separated by tabs, by runs of spaces, or put one per line
 *   (depending on the browser and on how AMS renders the table).
 * - A course row is recognised by its shape (serial number, course code, title,
 *   then four trailing columns), not by its position on the page.
 * - Any heading with a year or a term keyword starts a new term, so summer terms,
 *   semesters abroad, internships and transfer credits all come through.
 * - Header figures (CGPA, major CGPA, credits) are read independently, so they
 *   still parse when the page squashes them onto one line.
 */

import type { CreditCategory, ParsedCGPAData, ParsedCourse, ParsedSemester, TermKind, TermStatus } from "./types";

// ---------------------------------------------------------------------------
// Token patterns
// ---------------------------------------------------------------------------

/** One course code: "CS-1104", "FC-0201", "CS-IS-3095", "PHY-1208A". */
const CODE = String.raw`[A-Z]{2,6}(?:-[A-Z0-9]{1,6})*-[0-9]{2,5}[A-Z]?`;
/** Cross-listed codes: "MAT-2020/ CS-1209/ PHY-1208". */
const CODE_LIST = String.raw`${CODE}(?:\s*\/\s*${CODE})*`;
/** A numeric cell, or one of the blanks AMS prints for "not yet". */
const NUM = String.raw`\d+(?:\.\d+)?|--|-|–|—`;
/** A grade cell: "A", "B+", "TP", "AU", "W", or a blank. */
const GRADE = String.raw`[A-Z]{1,3}[+-]?|--|-|–|—`;

const CODE_LIST_RE = new RegExp(`^${CODE_LIST}$`);
const CODE_ANYWHERE_RE = new RegExp(CODE);
const NUM_RE = new RegExp(`^(?:${NUM})$`);
const GRADE_RE = new RegExp(`^(?:${GRADE})$`);

/** A whole course row on one line, whatever the separators. The title is lazy so the tail anchors it. */
const ROW_RE = new RegExp(
  String.raw`^(\d{1,3})\s+(${CODE_LIST})\s+(.+?)\s+(${NUM})\s+(${GRADE})(?:\s+(${NUM})(?:\s+(${NUM}))?)?$`,
);

const YEAR_RE = /\b((?:19|20)\d{2})\b/;
const BLANK_RE = /^(?:--|-|–|—)?$/;

/** Order matters: the first match wins, so specific kinds come before seasons. */
const TERM_KIND_PATTERNS: ReadonlyArray<readonly [TermKind, RegExp]> = [
  ["internship", /\bintern(?:ship)?s?\b/i],
  ["abroad", /\b(?:abroad|exchange|study\s+away|semester\s+away|visiting|overseas)\b/i],
  ["transfer", /\btransfer(?:red)?\b/i],
  ["summer", /\bsummer\b/i],
  ["winter", /\bwinter\b/i],
  ["monsoon", /\b(?:monsoon|fall|autumn)\b/i],
  ["spring", /\bspring\b/i],
];

/** Words that make a short line a term heading even without a season, e.g. "Semester 5 (2025)". */
const GENERIC_TERM_RE = /\b(?:semester|term|session|trimester|quarter)\b/i;

const COURSE_HEADER_RE = /\bcode\b.*\btitle\b/i;
const CATEGORY_HEADER_RE = /\bcategory\b.*\bcredits?\b/i;
const FOOTER_RE = /©|for technical support/i;
const HONOUR_RE = /\b([A-Z][A-Za-z]*['’]s\s+List)\b/g;

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

/** Normalises line endings and invisible characters, and drops empty lines. Tabs are kept. */
function toLines(text: string): string[] {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[​-‍⁠﻿]/g, "")
    .replace(/[  -   　]/g, " ")
    .split("\n")
    .map((line) => line.replace(/ +/g, " ").trim())
    .filter((line) => line.length > 0);
}

/** Cells of a line: by tab when there are tabs, else by runs of two or more spaces. Empty cells are kept. */
function toCells(line: string): string[] {
  const parts = line.includes("\t") ? line.split("\t") : line.split(/ {2,}/);
  return parts.map((cell) => cell.trim());
}

function toNumber(cell: string | undefined): number | null {
  if (cell === undefined) return null;
  const trimmed = cell.trim();
  if (!/^\d+(?:\.\d+)?$/.test(trimmed)) return null;
  const value = Number.parseFloat(trimmed);
  return Number.isFinite(value) ? value : null;
}

function toGrade(cell: string | undefined): string | null {
  const trimmed = cell?.trim().toUpperCase() ?? "";
  return BLANK_RE.test(trimmed) ? null : trimmed;
}

/** "MAT-1001/ CS-2210" -> ["MAT-1001", "CS-2210"]. */
export function splitCodes(code: string | null | undefined): string[] {
  if (!code) return [];
  return code
    .split("/")
    .map((part) => part.trim().toUpperCase())
    .filter((part) => part.length > 0 && part !== "--");
}

export function classifyTerm(name: string): TermKind {
  return TERM_KIND_PATTERNS.find(([, pattern]) => pattern.test(name))?.[0] ?? "other";
}

export function yearOf(name: string): number | null {
  const match = name.match(YEAR_RE);
  return match ? Number.parseInt(match[1], 10) : null;
}

/** A term is complete once AMS shows any final grade or any earned credit. */
export function termStatus(term: Pick<ParsedSemester, "courses" | "gpa" | "semesterCreditsEarned">): TermStatus {
  const anyGrade = term.courses.some((course) => course.grade !== null);
  return anyGrade || term.gpa > 0 || term.semesterCreditsEarned > 0 ? "completed" : "in-progress";
}

function buildCourse(cells: {
  code: string;
  title: string;
  registered: string | undefined;
  grade: string | undefined;
  earned: string | undefined;
  points: string | undefined;
}): ParsedCourse {
  const codes = splitCodes(cells.code);
  const title = cells.title.replace(/\s+/g, " ").trim();
  return {
    code: codes.length > 0 ? codes.join("/ ") : null,
    codes,
    title: title && !BLANK_RE.test(title) ? title : null,
    creditsRegistered: toNumber(cells.registered),
    grade: toGrade(cells.grade),
    creditsEarned: toNumber(cells.earned),
    gradePoints: toNumber(cells.points),
  };
}

// ---------------------------------------------------------------------------
// Row parsers
// ---------------------------------------------------------------------------

/** Reads a course row from its cells (tab or wide-space separated). */
function parseRowFromCells(line: string): ParsedCourse | null {
  const cells = toCells(line);
  // Leading empty cells appear when AMS adds a blank column before the serial number.
  while (cells.length > 0 && cells[0] === "") cells.shift();
  if (cells.length < 5 || !/^\d{1,3}$/.test(cells[0]) || !CODE_LIST_RE.test(cells[1])) return null;

  // Trailing blanks are padding, unless they are the dash placeholders AMS prints.
  while (cells.length > 5 && cells[cells.length - 1] === "") cells.pop();

  // Find the tail: registered, grade, then up to two more numeric cells.
  for (const tailLength of [4, 3, 2]) {
    const tail = cells.slice(-tailLength);
    const titleCells = cells.slice(2, cells.length - tailLength);
    if (titleCells.length === 0) continue;
    const [registered, grade, earned, points] = tail;
    const numericOk = [registered, earned, points].every((cell) => cell === undefined || NUM_RE.test(cell));
    if (!numericOk || !GRADE_RE.test(grade ?? "")) continue;
    return buildCourse({ code: cells[1], title: titleCells.join(" "), registered, grade, earned, points });
  }
  return null;
}

/** Reads a course row from a single line with any whitespace between columns. */
function parseRowFromLine(line: string): ParsedCourse | null {
  const match = line.replace(/\s+/g, " ").match(ROW_RE);
  if (!match) return null;
  const [, , code, title, registered, grade, earned, points] = match;
  return buildCourse({ code, title, registered, grade, earned, points });
}

function parseCourseRow(line: string): ParsedCourse | null {
  return parseRowFromCells(line) ?? parseRowFromLine(line);
}

/** Looks like a course row (serial number plus a code) even if the columns don't line up. */
function looksLikeCourseRow(line: string): boolean {
  return /^\d{1,3}[\s\t]/.test(line) && CODE_ANYWHERE_RE.test(line);
}

/**
 * Some browsers copy each table cell onto its own line. When a bare serial number is followed
 * by a line of course codes, glue the next few lines back into one tab-separated row.
 */
function joinSplitRow(lines: string[], index: number): { row: ParsedCourse; consumed: number } | null {
  if (!/^\d{1,3}$/.test(lines[index]) || !CODE_LIST_RE.test(lines[index + 1] ?? "")) return null;
  // 7 cells is the usual row; 8 covers a wrapped title, 6 a missing grade-points column.
  for (const size of [7, 8, 6, 5]) {
    const slice = lines.slice(index, index + size);
    if (slice.length < size) continue;
    const row = parseRowFromCells(slice.join("\t"));
    if (row) return { row, consumed: size };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Term headings and term summaries
// ---------------------------------------------------------------------------

/** A term heading is a short single-cell line naming a season, a term keyword or a year. */
function parseTermHeading(line: string): string | null {
  const cells = toCells(line).filter((cell) => cell.length > 0);
  if (cells.length !== 1) return null;
  const name = cells[0];
  if (name.length > 60 || name.includes(":") || /^\d+\s/.test(name) || /^\d+$/.test(name)) return null;
  if (COURSE_HEADER_RE.test(name) || CATEGORY_HEADER_RE.test(name) || FOOTER_RE.test(name)) return null;

  const kind = classifyTerm(name);
  const hasYear = YEAR_RE.test(name);
  if (kind === "internship" || kind === "abroad" || kind === "transfer") return name;
  if (kind !== "other" && hasYear) return name;
  if (GENERIC_TERM_RE.test(name) && hasYear) return name;
  return null;
}

type TermSummary = { gpa?: number; credits?: number; cgpa?: number; honours: string[] };

/** Reads "GPA: 3.42  Semester Credits Earned: 16  CGPA: 3.80" and any honour on the same line. */
function parseTermSummary(line: string): TermSummary | null {
  const gpa = line.match(/(?<![A-Za-z])GPA\s*:\s*(\d+(?:\.\d+)?)/i);
  const credits = line.match(/Credits\s+Earned\s*:\s*(\d+(?:\.\d+)?)/i);
  const cgpa = line.match(/(?<![A-Za-z/])CGPA\s*:\s*(\d+(?:\.\d+)?)/i);
  const honours = Array.from(line.matchAll(HONOUR_RE), (match) => match[1].replace(/’/g, "'").replace(/\s+/g, " "));
  if (!gpa && !credits && !cgpa && honours.length === 0) return null;
  return {
    gpa: gpa ? Number.parseFloat(gpa[1]) : undefined,
    credits: credits ? Number.parseFloat(credits[1]) : undefined,
    cgpa: cgpa ? Number.parseFloat(cgpa[1]) : undefined,
    honours,
  };
}

// ---------------------------------------------------------------------------
// Report header and the credential summary table
// ---------------------------------------------------------------------------

function readFigure(text: string, pattern: RegExp): number {
  const match = text.match(pattern);
  const value = match ? Number.parseFloat(match[1]) : Number.NaN;
  return Number.isFinite(value) ? value : 0;
}

function parseHeader(lines: string[]) {
  const text = lines.join("\n");
  const programme = text.match(/Programme\s+Declaration\s*:?\s*([^\n\t]+)/i)?.[1]?.trim() ?? null;
  return {
    degreeCGPA: readFigure(text, /Degree\s*\/?\s*Diploma\s+CGPA\s*:?\s*(\d+(?:\.\d+)?)/i),
    majorCGPA: readFigure(text, /CGPA\s+for\s+Major\s*:?\s*(\d+(?:\.\d+)?)/i),
    totalCredits: readFigure(text, /Total\s+counted\s+credits\s*:?\s*(\d+(?:\.\d+)?)/i),
    programme: programme && programme.length > 0 ? programme : null,
  };
}

function parseCategoryRow(line: string): CreditCategory | null {
  if (line.includes("\t")) {
    const cells = toCells(line);
    while (cells.length > 0 && cells[0] === "") cells.shift();
    if (cells.length < 4 || !/^\d{1,3}$/.test(cells[0])) return null;
    const courses = toNumber(cells[cells.length - 2]);
    const credits = toNumber(cells[cells.length - 1]);
    if (courses === null || credits === null || !cells[1]) return null;
    const programme = cells.slice(2, -2).join(" ").trim();
    return { category: cells[1], programme: programme || null, coursesCompleted: courses, credits };
  }
  const match = line.match(/^\d{1,3}\s+(.+?)\s+(\d+)\s+(\d+(?:\.\d+)?)$/);
  if (!match || CODE_ANYWHERE_RE.test(match[1])) return null;
  return { category: match[1], programme: null, coursesCompleted: Number(match[2]), credits: Number(match[3]) };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

function newTerm(name: string): ParsedSemester {
  return {
    semester: name,
    kind: classifyTerm(name),
    year: yearOf(name),
    status: "in-progress",
    courses: [],
    gpa: 0,
    semesterCreditsEarned: 0,
    cgpa: 0,
    honours: [],
  };
}

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * Parses the pasted AMS course report into structured data.
 * Never throws on odd input; check `semesters.length` and `warnings` for how it went.
 */
export function parseCourseReport(text: string): ParsedCGPAData {
  const lines = toLines(text);
  const header = parseHeader(lines);

  const footerIndex = lines.findIndex((line) => FOOTER_RE.test(line));
  const end = footerIndex === -1 ? lines.length : footerIndex;
  const courseHeaderIndex = lines.findIndex((line, index) => index < end && COURSE_HEADER_RE.test(line));
  const categoryHeaderIndex = lines.findIndex((line, index) => index < end && CATEGORY_HEADER_RE.test(line));

  // Credential summary table: between its own header and the course table.
  const categories: CreditCategory[] = [];
  if (categoryHeaderIndex !== -1) {
    const stop = courseHeaderIndex > categoryHeaderIndex ? courseHeaderIndex : end;
    for (let i = categoryHeaderIndex + 1; i < stop; i++) {
      const row = parseCategoryRow(lines[i]);
      if (row) categories.push(row);
      else if (categories.length > 0) break;
    }
  }

  // Course table. Without a recognisable table header, scan everything after the summary table.
  const start = courseHeaderIndex !== -1
    ? courseHeaderIndex + 1
    : categoryHeaderIndex !== -1 ? categoryHeaderIndex + categories.length + 1 : 0;

  const terms = new Map<string, ParsedSemester>();
  const warnings: string[] = [];
  let current: ParsedSemester | null = null;

  const enterTerm = (name: string): ParsedSemester => {
    const key = name.toLowerCase().replace(/\s+/g, " ");
    // The same heading twice is an AMS page break, not a new term.
    const existing = terms.get(key);
    if (existing) return existing;
    const term = newTerm(name);
    terms.set(key, term);
    return term;
  };

  for (let i = start; i < end; i++) {
    const line = lines[i];

    const split = joinSplitRow(lines, i);
    if (split) {
      current ??= enterTerm("Other credits");
      current.courses.push(split.row);
      i += split.consumed - 1;
      continue;
    }

    const row = parseCourseRow(line);
    if (row) {
      current ??= enterTerm("Other credits");
      current.courses.push(row);
      continue;
    }

    const summary = parseTermSummary(line);
    if (summary) {
      // Header figures ("Degree/Diploma CGPA: ...") sit above the table and are not term summaries.
      if (current && !/Degree|Major|counted/i.test(line)) {
        if (summary.gpa !== undefined) current.gpa = summary.gpa;
        if (summary.credits !== undefined) current.semesterCreditsEarned = summary.credits;
        if (summary.cgpa !== undefined) current.cgpa = summary.cgpa;
        for (const honour of summary.honours) {
          if (!current.honours.includes(honour)) current.honours.push(honour);
        }
      }
      continue;
    }

    const heading = parseTermHeading(line);
    if (heading) {
      current = enterTerm(heading);
      continue;
    }

    if (current && looksLikeCourseRow(line)) {
      warnings.push(`Could not read the row "${line.replace(/\s+/g, " ").slice(0, 90)}"`);
    }
  }

  const semesters = Array.from(terms.values())
    .filter((term) => term.courses.length > 0)
    .map((term) => ({
      ...term,
      gpa: round2(term.gpa),
      semesterCreditsEarned: round2(term.semesterCreditsEarned),
      cgpa: round2(term.cgpa),
      status: termStatus(term),
    }));

  return {
    version: 2,
    degreeCGPA: round2(header.degreeCGPA),
    majorCGPA: round2(header.majorCGPA),
    totalCredits: round2(header.totalCredits),
    programme: header.programme,
    categories,
    semesters,
    warnings,
  };
}
