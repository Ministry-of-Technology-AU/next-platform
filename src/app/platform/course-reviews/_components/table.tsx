import { Table, TableRow, TableHeader, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SortField, SortDirection, CourseWithReviews } from "../types";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CourseDialog } from "./course-dialog";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ReviewsTable({ paginatedCourses, sortField, sortDirection, handleSort }: { paginatedCourses: CourseWithReviews[], sortField: SortField, sortDirection: SortDirection, handleSort: (field: SortField) => void }) {
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ChevronUp className="w-4 h-4 opacity-30" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };
  return (
    <Table>
      <TableHeader className="sticky top-0 bg-primary-light/30 dark:bg-primary-dark/40 !text-white z-10">
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
              className={`cursor-pointer text-gray dark:text-gray-light hover:bg-neutral-light ${hideOnMobile ? 'hidden sm:table-cell' : ''}`}
              onClick={() => handleSort(field as SortField)}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm">{label}</span>
                <SortIcon field={field as SortField} />
              </div>
            </TableHead>
          ))}
          <TableHead className="hidden sm:table-cell text-gray dark:text-gray-light">
            <span className="text-xs sm:text-sm"></span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paginatedCourses.length > 0 ? (
          paginatedCourses.map((course: CourseWithReviews) => {
            const reviewCount = course.reviews?.length || 0;
            const hasReviews = reviewCount > 0;
            const textOpacityClass = hasReviews ? "" : "opacity-60";

            return (
              <Dialog key={course.id}>
                <DialogTrigger asChild>
                  <TableRow className="cursor-pointer hover:bg-neutral-extralight transition-colors">
                    <TableCell className="text-xs sm:text-sm">
                      <span className={textOpacityClass}>{course.courseCode}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-xs sm:text-sm flex items-center gap-2 flex-wrap">
                          <span className={`flex-1 min-w-0 ${textOpacityClass}`}>{course.courseName}</span>
                          <span className={`text-gray dark:text-gray-light font-normal whitespace-nowrap ${textOpacityClass}`}>
                            ({reviewCount})
                          </span>
                          {/* Mobile: Add Review button inline */}
                          <Button
                            variant="animatedGhost"
                            size="sm"
                            className="sm:hidden h-7 w-7 p-0 text-primary-bright hover:text-secondary-dark dark:text-secondary-dark hover:dark:text-primary-bright flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/platform/course-reviews/add/${course.id}`
                            }}
                          >
                            <CirclePlus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className={`text-xs text-gray sm:hidden mt-1 ${textOpacityClass}`}>
                          {course.semester} {course.year}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <span className={textOpacityClass}>{course.faculty}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                      <span className={textOpacityClass}>{course.semester}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                      <span className={textOpacityClass}>{course.year}</span>
                    </TableCell>
                    {/* Desktop: Add Review button in separate column */}
                    <TableCell className="hidden sm:table-cell">
                      <Button
                        variant="animatedGhost"
                        size="sm"
                        className="h-8 text-xs px-3 text-primary-bright hover:text-secondary-dark dark:text-secondary-dark hover:dark:text-primary-bright cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/platform/course-reviews/add/${course.id}`
                        }}
                      >
                        <CirclePlus className="w-4 h-4 mr-2" />
                        Add Review
                      </Button>
                    </TableCell>
                  </TableRow>
                </DialogTrigger>
                <DialogContent className="w-[95vw] sm:w-4/5 max-w-[95vw] sm:max-w-[80vw] max-h-[90vh] p-3 sm:p-4 lg:p-6">
                  <CourseDialog course={course} />
                  <Button variant="animated" className="mt-2 sm:mt-3 w-full sm:w-auto text-xs sm:text-sm" onClick={() => { window.location.href = `/platform/course-reviews/add/${course.id}` }}>
                    <CirclePlus className="w-4 h-4" /> Add Review
                  </Button>
                </DialogContent>
              </Dialog>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-neutral-primary">
              No courses found matching your criteria.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

// Skeleton loading component for the reviews table
export function ReviewsTableSkeleton({ entriesPerPage = 10 }: { entriesPerPage?: number }) {
  return (
    <Table className="animate-pulse rounded-lg">
      <TableHeader className="sticky top-0 bg-primary-light/40 dark:bg-primary-dark/40 z-10">
        <TableRow>
          <TableHead className="cursor-pointer hover:bg-neutral-light">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm">Course Code</span>
              <ChevronUp className="w-4 h-4 opacity-30" />
            </div>
          </TableHead>
          <TableHead className="cursor-pointer hover:bg-neutral-light">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm">Course Name</span>
              <ChevronUp className="w-4 h-4 opacity-30" />
            </div>
          </TableHead>
          <TableHead className="cursor-pointer hover:bg-neutral-light">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm">Faculty</span>
              <ChevronUp className="w-4 h-4 opacity-30" />
            </div>
          </TableHead>
          <TableHead className="hidden sm:table-cell cursor-pointer hover:bg-neutral-light">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm">Semester</span>
              <ChevronUp className="w-4 h-4 opacity-30" />
            </div>
          </TableHead>
          <TableHead className="hidden sm:table-cell cursor-pointer hover:bg-neutral-light">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm">Year</span>
              <ChevronUp className="w-4 h-4 opacity-30" />
            </div>
          </TableHead>
          <TableHead>
            <span className="text-xs sm:text-sm"></span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: entriesPerPage }).map((_, index) => (
          <TableRow key={index} className="hover:bg-neutral-extralight transition-colors">
            <TableCell className="text-xs sm:text-sm">
              <Skeleton className="h-4 w-16" />
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium text-xs sm:text-sm">
                  <Skeleton className="h-4 w-32 mb-1" />
                </div>
                <div className="text-xs text-gray sm:hidden">
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </TableCell>
            <TableCell className="text-xs sm:text-sm">
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
              <Skeleton className="h-4 w-16" />
            </TableCell>
            <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
              <Skeleton className="h-4 w-12" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-8 w-24" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}