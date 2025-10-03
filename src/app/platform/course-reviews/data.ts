import { useMemo } from "react";
import { Course, CourseWithReviews, SortField } from "./types";

export function uniqueSems(courses: (Course | CourseWithReviews)[]): string[] {
  const semesters = [...new Set(courses.map(course => course.semester))];
  return semesters;
}

export function uniqueYears(courses: (Course | CourseWithReviews)[]): number[] {
  const years = [...new Set(courses.map(course => {
    // Handle both number and string year types
    return typeof course.year === 'string' ? parseInt(course.year) : course.year;
  }))].sort((a, b) => b - a);
  return years;
}

export function sortAndFilterCourses(courses: CourseWithReviews[], searchTerm: string, semesterFilter: string, yearFilter: number | string, sortField: SortField, sortDirection: "asc" | "desc") {
  let filtered = courses.filter((course) => {
    // Search filter
    const matchesSearch = !searchTerm || 
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.faculty.toLowerCase().includes(searchTerm.toLowerCase());

    // Semester filter
    const matchesSemester = semesterFilter === "all" || course.semester === semesterFilter;

    // Year filter
    const matchesYear = yearFilter === "all" || course.year === yearFilter;

    return matchesSearch && matchesSemester && matchesYear;
  });

  // Sort the filtered results
  filtered.sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle string comparisons
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();

    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return filtered;
}

// Generate page numbers for pagination
export const getPageNumbers = (totalPages: number, currentPage: number): number[] => {
  const pages: number[] = [];
  const maxVisiblePages = 5;
  
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }
  
  return pages;
};