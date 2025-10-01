"use client";

import { useState, useMemo } from "react";
import { Search, ChevronUp, ChevronDown, CirclePlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CourseDialog } from "./course-dialog";

type SortField = "courseCode" | "courseName" | "faculty" | "semester" | "year";
type SortDirection = "asc" | "desc";

export default function CourseReviewsClient({ courses }: { courses: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("courseCode");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Get unique years and semesters for filter options
  const uniqueYears = useMemo(() => {
    const years = [...new Set(courses.map(course => course.year))].sort((a, b) => b - a);
    return years;
  }, [courses]);

  const uniqueSemesters = useMemo(() => {
    const semesters = [...new Set(courses.map(course => course.semester))];
    return semesters;
  }, [courses]);

  // Client-side filtering, searching, and sorting
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = courses.filter((course) => {
      // Search filter
      const matchesSearch = !searchTerm || 
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.faculty.toLowerCase().includes(searchTerm.toLowerCase());

      // Semester filter
      const matchesSemester = semesterFilter === "all" || course.semester === semesterFilter;

      // Year filter
      const matchesYear = yearFilter === "all" || course.year.toString() === yearFilter;

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
  }, [courses, searchTerm, semesterFilter, yearFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCourses.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, filteredAndSortedCourses.length);
  const paginatedCourses = filteredAndSortedCourses.slice(startIndex, startIndex + entriesPerPage);

  // Reset to page 1 when filters change
  const handleFilterChange = (type: string, value: string) => {
    setCurrentPage(1);
    if (type === 'semester') setSemesterFilter(value);
    if (type === 'year') setYearFilter(value);
    if (type === 'search') setSearchTerm(value);
  };

  const handleEntriesPerPageChange = (value: string) => {
    setCurrentPage(1);
    setEntriesPerPage(Number(value));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ChevronUp className="w-4 h-4 opacity-30" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
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

  return (
    <>
      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 my-6">
        <Select value={semesterFilter} onValueChange={(value) => handleFilterChange('semester', value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            {uniqueSemesters.map(semester => (
              <SelectItem key={semester} value={semester}>{semester}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={yearFilter} onValueChange={(value) => handleFilterChange('year', value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {uniqueYears.map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Entries + Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-dark">Show</span>
          <Select
            value={entriesPerPage.toString()}
            onValueChange={handleEntriesPerPageChange}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-neutral-dark">entries</span>
        </div>

        <div className="flex-1 w-full sm:max-w-md sm:ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-primary" />
            <Input
              placeholder="Search Course or Professor"
              value={searchTerm}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {searchTerm || semesterFilter !== "all" || yearFilter !== "all" ? (
        <div className="mb-4 text-sm text-neutral-primary">
          {filteredAndSortedCourses.length} courses found
          {searchTerm && ` matching "${searchTerm}"`}
          {semesterFilter !== "all" && ` in ${semesterFilter}`}
          {yearFilter !== "all" && ` for ${yearFilter}`}
        </div>
      ) : null}

      {/* Table */}
      <div className="bg-white dark:bg-gray-dark/15 rounded-lg border border-neutral-light overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-primary-light/40 dark:bg-primary-dark/40 z-10">
              <TableRow>
                {[
                  { field: "courseCode", label: "Course Code" },
                  { field: "courseName", label: "Course Name" },
                  { field: "faculty", label: "Faculty" },
                  { field: "semester", label: "Semester", hideOnMobile: true },
                  { field: "year", label: "Year", hideOnMobile: true },
                ].map(({ field, label, hideOnMobile }) => (
                  <TableHead
                    key={field}
                    className={`cursor-pointer hover:bg-neutral-light ${hideOnMobile ? 'hidden sm:table-cell' : ''}`}
                    onClick={() => handleSort(field as SortField)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm">{label}</span>
                      <SortIcon field={field as SortField} />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCourses.length > 0 ? (
                paginatedCourses.map((course: any) => (
                  <Dialog key={course.id}>
                    <DialogTrigger asChild>
                      <TableRow className="cursor-pointer hover:bg-neutral-extralight transition-colors">
                        <TableCell className="text-xs sm:text-sm">{course.courseCode}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-xs sm:text-sm">{course.courseName}</div>
                            <div className="text-xs text-gray sm:hidden">
                              {course.semester} {course.year}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">{course.faculty}</TableCell>
                        <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{course.semester}</TableCell>
                        <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{course.year}</TableCell>
                      </TableRow>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] sm:w-4/5 max-w-[95vw] sm:max-w-[80vw] max-h-[90vh] p-3 sm:p-4 lg:p-6">
                      <CourseDialog course={course} />
                      <Button variant="animated" className="mt-2 sm:mt-3 w-full sm:w-auto text-xs sm:text-sm" onClick={()=>{window.location.href=`/course-reviews/add/${course.id}`}}>
                        <CirclePlus className="w-4 h-4" /> Add Review
                      </Button>
                    </DialogContent>
                  </Dialog>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-neutral-primary">
                    No courses found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {filteredAndSortedCourses.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <div className="text-sm text-neutral-primary text-center sm:text-left">
            Showing {startIndex + 1} to {endIndex} of {filteredAndSortedCourses.length} entries
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="text-xs"
            >
              Previous
            </Button>
            
            {/* Dynamic pagination buttons */}
            {getPageNumbers().map((pageNum) => (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className="text-xs min-w-[32px]"
              >
                {pageNum}
              </Button>
            ))}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="text-neutral-primary text-xs">...</span>
                <Button
                  variant={currentPage === totalPages ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  className="text-xs min-w-[32px]"
                >
                  {totalPages}
                </Button>
              </>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
