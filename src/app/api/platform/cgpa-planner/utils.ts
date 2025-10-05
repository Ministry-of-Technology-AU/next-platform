/**
 * Utility functions for mapping CGPA data between different formats
 * This handles potential differences between frontend format and Strapi storage format
 */

// TypeScript interfaces for CGPA data structure
export interface Course {
  code: string;
  title: string;
  creditsRegistered: number;
  grade: string | null;
  creditsEarned: number | null;
  gradePoints: number | null;
}

export interface Semester {
  semester: string;
  courses: Course[];
  gpa: number;
  semesterCreditsEarned: number;
  cgpa: number;
}

export interface CGPAData {
  degreeCGPA: number;
  majorCGPA: number;
  totalCredits: number;
  semesters: Semester[];
}

/**
 * Maps Strapi CGPA data format to frontend format
 * Use this if Strapi stores data differently than our expected format
 */
export function mapStrapiToFrontend(strapiData: any): CGPAData {
  // If the data is already in the correct format, return as-is
  if (isFrontendFormat(strapiData)) {
    return strapiData;
  }
  
  // Add mapping logic here if Strapi format differs
  // For example, if Strapi stores nested differently:
  /*
  return {
    degreeCGPA: strapiData.attributes?.degreeCGPA || strapiData.degreeCGPA,
    majorCGPA: strapiData.attributes?.majorCGPA || strapiData.majorCGPA,
    totalCredits: strapiData.attributes?.totalCredits || strapiData.totalCredits,
    semesters: mapSemestersFromStrapi(strapiData.attributes?.semesters || strapiData.semesters)
  };
  */
  
  return strapiData;
}

/**
 * Maps frontend CGPA data format to Strapi format
 * Use this if Strapi expects data in a different format
 */
export function mapFrontendToStrapi(frontendData: CGPAData): any {
  // If no special mapping is needed, return as-is
  // Add mapping logic here if needed
  
  return frontendData;
}

/**
 * Validates if data is in the expected frontend format
 */
export function isFrontendFormat(data: any): data is CGPAData {
  return (
    data &&
    typeof data.degreeCGPA === 'number' &&
    typeof data.majorCGPA === 'number' &&
    typeof data.totalCredits === 'number' &&
    Array.isArray(data.semesters) &&
    data.semesters.every((semester: any) => 
      typeof semester.semester === 'string' &&
      Array.isArray(semester.courses) &&
      typeof semester.gpa === 'number' &&
      typeof semester.semesterCreditsEarned === 'number' &&
      typeof semester.cgpa === 'number'
    )
  );
}

/**
 * Validates if a course object is in the correct format
 */
export function isValidCourse(course: any): course is Course {
  return (
    course &&
    typeof course.code === 'string' &&
    typeof course.title === 'string' &&
    typeof course.creditsRegistered === 'number' &&
    (course.grade === null || typeof course.grade === 'string') &&
    (course.creditsEarned === null || typeof course.creditsEarned === 'number') &&
    (course.gradePoints === null || typeof course.gradePoints === 'number')
  );
}

/**
 * Validates if a semester object is in the correct format
 */
export function isValidSemester(semester: any): semester is Semester {
  return (
    semester &&
    typeof semester.semester === 'string' &&
    Array.isArray(semester.courses) &&
    semester.courses.every(isValidCourse) &&
    typeof semester.gpa === 'number' &&
    typeof semester.semesterCreditsEarned === 'number' &&
    typeof semester.cgpa === 'number'
  );
}

/**
 * Sanitizes and validates CGPA data before saving
 */
export function sanitizeCGPAData(data: any): CGPAData {
  if (!isFrontendFormat(data)) {
    throw new Error('Invalid CGPA data format');
  }
  
  // Ensure numeric values are properly formatted
  const sanitized: CGPAData = {
    degreeCGPA: Number(data.degreeCGPA.toFixed(2)),
    majorCGPA: Number(data.majorCGPA.toFixed(2)),
    totalCredits: Math.round(data.totalCredits),
    semesters: data.semesters.map((semester: Semester) => ({
      ...semester,
      gpa: Number(semester.gpa.toFixed(2)),
      semesterCreditsEarned: Math.round(semester.semesterCreditsEarned),
      cgpa: Number(semester.cgpa.toFixed(2)),
      courses: semester.courses.map((course: Course) => ({
        ...course,
        creditsRegistered: Math.round(course.creditsRegistered),
        creditsEarned: course.creditsEarned ? Math.round(course.creditsEarned) : null,
        gradePoints: course.gradePoints ? Number(course.gradePoints.toFixed(1)) : null
      }))
    }))
  };
  
  return sanitized;
}

/**
 * Calculates summary statistics from CGPA data
 */
export function calculateSummaryStats(data: CGPAData) {
  const completedSemesters = data.semesters.filter((s: Semester) => s.semesterCreditsEarned > 0);
  const currentSemester = data.semesters.find((s: Semester) => s.semesterCreditsEarned === 0);
  
  return {
    totalSemesters: data.semesters.length,
    completedSemesters: completedSemesters.length,
    hasCurrentSemester: !!currentSemester,
    currentSemesterName: currentSemester?.semester || null,
    averageGPA: completedSemesters.length > 0 
      ? Number((completedSemesters.reduce((sum: number, s: Semester) => sum + s.gpa, 0) / completedSemesters.length).toFixed(2))
      : 0,
    totalCourses: data.semesters.reduce((sum: number, s: Semester) => sum + s.courses.length, 0),
    completedCourses: data.semesters.reduce((sum: number, s: Semester) => 
      sum + s.courses.filter((c: Course) => c.creditsEarned !== null).length, 0
    )
  };
}