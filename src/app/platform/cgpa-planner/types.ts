import { gradePointsMap } from "./data";

export type GradeComponent = {
  id: string;
  name: string;
  score: string; // numeric string
  total: string; // numeric string
  letter: string; // e.g., "A", "B+"
  weight: string; // numeric string (percentage)
};

export type Course = {
  id: string;
  name: string;
  components: GradeComponent[];
  extraCredit: GradeComponent | null;
  showExtraCredit: boolean;
};

export type ParsedCourse = {
    code?: string | null;
    title?: string | null;
    creditsRegistered?: number | null;
    grade?: string | null;
    creditsEarned?: number | null;
    gradePoints?: number | null;
};

export type ParsedSemester = {
    semester: string;
    courses: ParsedCourse[];
    gpa: number;
    semesterCreditsEarned: number;
    cgpa: number;
};

export type GradeKey = keyof typeof gradePointsMap | 'Select';

   export type AttemptSource = 'past' | 'current';

export type CourseAttempt = {
        key: string;
        gradeLabel: GradeKey;
        gradePoints: number;
        gpaCredits: number;
        earnedCredits: number;
        ratio: number | null;
        source: AttemptSource;
    };

export type ParsedCGPAData = {
    degreeCGPA: number;
    majorCGPA: number;
    totalCredits: number;
    semesters: ParsedSemester[];
};

export type ComponentRowViewProps = {
  courseId: string;
  gc: GradeComponent;
  updateComponentField: (courseId: string, compId: string, key: keyof GradeComponent, value: string) => void;
  onLetterChange: (courseId: string, compId: string, letter: string) => void;
  removeComponentFromCourse: (courseId: string, compId: string) => void;
};

export type ExtraCreditCardProps = {
  course: Course;
  updateExtraCreditField: (courseId: string, key: keyof GradeComponent, value: string) => void;
  onExtraLetterChange: (courseId: string, letter: string) => void;
};



