export type Credits = 2 | 4 | 8
export type CourseType = "FC" | "CC" | "Major" | "Minor" | "Open Credits"
export type DepartmentCode = "CS" | "ENT" | "ECO" | "MATH" | "PHY" | "HUM" | "CW" | "" // empty string for no dept

export interface Course {
    id: string
    name: string
    credits: Credits
    deptCode: DepartmentCode
    type: CourseType
    isInSemester?: boolean // Track if course is in a semester (read-only by default)
}

export interface Semester {
    id: string
    name: string
    courses: Course[]
}

export interface CoursePlannerState {
    semesters: Semester[]
    availableCourses: Course[]
}
