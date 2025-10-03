import { Table, TableRow, TableHeader,TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SortField, SortDirection, CourseWithReviews } from "../types";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CourseDialog } from "./course-dialog";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ReviewsTable({paginatedCourses, sortField, sortDirection, handleSort}: {paginatedCourses: CourseWithReviews[], sortField: SortField, sortDirection: SortDirection, handleSort: (field: SortField) => void}) {
    const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ChevronUp className="w-4 h-4 opacity-30" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };
    return(
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
                paginatedCourses.map((course: CourseWithReviews) => (
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
                      <Button variant="animated" className="mt-2 sm:mt-3 w-full sm:w-auto text-xs sm:text-sm" onClick={()=>{window.location.href=`/platform/course-reviews/add/${course.id}`}}>
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}