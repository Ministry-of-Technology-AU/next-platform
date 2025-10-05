"use client";

import { useState, Suspense, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReviewsTable, ReviewsTableSkeleton } from "./_components/table";
import { SortField, SortDirection, CourseWithReviews } from "./types";
import { sortAndFilterCourses, uniqueSems, uniqueYears, getPageNumbers } from "./data";

export default function CourseReviewsClient({ courses }: { courses: CourseWithReviews[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("courseCode");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Get unique years and semesters for filter options using useMemo at component level
  const availableYears = useMemo(() => uniqueYears(courses), [courses]);
  const availableSemesters = useMemo(() => uniqueSems(courses), [courses]);


  // Client-side filtering, searching, and sorting
  const filteredAndSortedCourses = useMemo(() => 
    sortAndFilterCourses(courses, searchTerm, semesterFilter, yearFilter, sortField, sortDirection),
    [courses, searchTerm, semesterFilter, yearFilter, sortField, sortDirection]
  );

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
            {availableSemesters.map(semester => (
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
            {availableYears.map(year => (
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
          <Suspense fallback={<ReviewsTableSkeleton entriesPerPage={entriesPerPage} />}>
            <ReviewsTable paginatedCourses={paginatedCourses} sortField={sortField} sortDirection={sortDirection} handleSort={handleSort} />
          </Suspense>
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
            {getPageNumbers(totalPages, currentPage).map((pageNum) => (
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
