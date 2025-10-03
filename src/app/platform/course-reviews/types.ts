// Basic course interface for table display and filtering
export interface Course {
  id: string | number;
  courseCode: string;
  courseName: string;
  faculty: string;
  semester: string;
  year: number;
}

// Extended course interface for detailed course dialog
export interface CourseWithReviews {
  id: number;
  courseCode: string;
  courseName: string;
  faculty: string;
  semester: string;
  year: string; // Changed to string to match CourseDialog expectations
  extraCredit?: boolean;
  classMode?: string;
  gradingType?: string;
  description: string;
  overallRating: number;
  ratingMetrics: {
    transparentGrading: number;
    assignmentsMatchClassContent: number;
    gradesEasy: number;
    gradesFairly: number;
    goodLecturer: number;
    courseRecommended: number;
  };
  reviews: {
    batch: string;
    grade?: string;
    major: string;
    rating: number;
    summary: string;
    taInfluence: string;
  }[];
}

export type SortField = "courseCode" | "courseName" | "faculty" | "semester" | "year";
export type SortDirection = "asc" | "desc";

export interface FormData {
  reviewExperience: string;
  grading_transparent: string;
  strict: string;
  fair: string;
  lecturer: string;
  relatable: string;
  overall: string;
  mode: string;
  grading: string;
  extracredit: string;
  taInfluence: string;
  batch: string;
  major: string;
  grade: string;
  isAnonymous: boolean;
}

export interface SearchParams {
  name: string;
  code: string;
  year: number;
  semester: string;
}