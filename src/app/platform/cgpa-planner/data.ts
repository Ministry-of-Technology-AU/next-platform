import { GradeComponent, Course } from "./types";

export const LETTERS = [
  "A", "A-", "B+", "B", "B-",
  "C+", "C", "C-", "D+", "D", "D-", "F",
];

    export const gradeOptions = [
        { value: "Select", label: "Select" },
        { value: "A", label: "A" },
        { value: "A-", label: "A-" },
        { value: "B+", label: "B+" },
        { value: "B", label: "B" },
        { value: "B-", label: "B-" },
        { value: "C+", label: "C+" },
        { value: "C", label: "C" },
        { value: "C-", label: "C-" },
        { value: "D+", label: "D+" },
        { value: "D", label: "D" },
        { value: "D-", label: "D-" },
        { value: "P", label: "P" },
        { value: "F (w P/F)", label: "F (w P/F)" },
        { value: "F (w/o P/F)", label: "F (w/o P/F)" },
        { value: "AU", label: "AU" },
        { value: "TP (w credits)", label: "TP (w credits)" },
        { value: "TP (w/o credits)", label: "TP (w/o credits)" }
    ];

export const gradePointsMap = {
        'A': 4.0,
        'A-': 3.7,
        'B+': 3.3,
        'B': 3.0,
        'B-': 2.7,
        'C+': 2.3,
        'C': 2.0,
        'C-': 1.7,
        'D+': 1.3,
        'D': 1.0,
        'D-': 0.7,
        'F (w P/F)': 0.0,
        'TP (w credits)': 0.0,
        'TP (w/o credits)': 0.0,
        'P': 0.0,
        'AU': 0.0,
        'F (w/o P/F)': 0.0
    };

export const letterRanges = [
  { letter: "A", min: 89.5, max: 100 },
  { letter: "A-", min: 84.5, max: 89.49 },
  { letter: "B+", min: 79.5, max: 84.99 },
  { letter: "B", min: 74.5, max: 79.99 },
  { letter: "B-", min: 69.5, max: 74.99 },
  { letter: "C+", min: 64.5, max: 69.99 },
  { letter: "C", min: 59.5, max: 64.99 },
  { letter: "C-", min: 54.5, max: 59.99 },
  { letter: "D+", min: 49.5, max: 54.99 },
  { letter: "D", min: 44.5, max: 49.99 },
  { letter: "D-", min: 39.5, max: 44.99 },
  { letter: "F", min: 0, max: 39.49 },
];

export function getLetterFromPercentage(percentage: number): string {
  const rounded = Math.round(percentage);
  if (rounded >= 90) return "A";
  if (rounded >= 85) return "A-";
  if (rounded >= 80) return "B+";
  if (rounded >= 75) return "B";
  if (rounded >= 70) return "B-";
  if (rounded >= 65) return "C+";
  if (rounded >= 60) return "C";
  if (rounded >= 55) return "C-";
  if (rounded >= 50) return "D+";
  if (rounded >= 45) return "D";
  if (rounded >= 40) return "D-";
  return "F";
}

export function defaultScoreForLetter(letter: string): number {
  const g = letterRanges.find((g) => g.letter === letter);
  if (!g) return 0;
  return Number(((g.min + g.max) / 2).toFixed(2));
}

export function newComponent(): GradeComponent {
  return {
    id: crypto.randomUUID(),
    name: "",
    score: "",
    total: "",
    letter: "",
    weight: "",
  };
}

export function newCourse(): Course {
  return {
    id: crypto.randomUUID(),
    name: "",
    components: [newComponent(), newComponent(), newComponent()],
    extraCredit: null,
    showExtraCredit: false,
  };
}

export const STORAGE_KEY = "cgpa-planner:grade-planner:v1";

export function parseNum(v: string) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : NaN;
}

export function computeRow(gc: GradeComponent) {
  const score = parseNum(gc.score);
  const total = parseNum(gc.total);
  const pct = Number.isFinite(score) && Number.isFinite(total) && total > 0 ? (score / total) * 100 : NaN;
  const pctStr = Number.isFinite(pct) ? pct.toFixed(2) : "";
  const letter = Number.isFinite(pct) ? getLetterFromPercentage(pct) : "";
  return { pct, pctStr, letter };
}



export function computeCourse(course: Course) {
  const rows: GradeComponent[] = [
    ...course.components,
    ...(course.showExtraCredit && course.extraCredit ? [course.extraCredit] : []),
  ];
  let totalWeighted = 0;
  let totalWeight = 0;
  for (const r of rows) {
    const { pct } = computeRow(r);
    const w = parseNum(r.weight);
    if (Number.isFinite(pct) && Number.isFinite(w) && w > 0) {
      totalWeighted += (pct * w) / 100;
      totalWeight += w;
    }
  }
  let final = totalWeighted;
  if (totalWeight > 0 && totalWeight < 100) {
    final = (totalWeighted / totalWeight) * 100;
  }
  return {
    finalPct: Number.isFinite(final) ? final : NaN,
    totalWeight,
  };
}





