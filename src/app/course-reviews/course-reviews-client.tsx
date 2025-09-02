"use client";

import { useState } from "react";
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

  // filtering & sorting
  const filteredCourses = courses
    .filter((course) => {
      const matchesSearch =
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.faculty.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSemester =
        semesterFilter === "all" || course.semester === semesterFilter;
      const matchesYear = yearFilter === "all" || course.year === yearFilter;
      return matchesSearch && matchesSemester && matchesYear;
    })
    .sort((a, b) => {
      const aValue = a[sortField].toLowerCase();
      const bValue = b[sortField].toLowerCase();
      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const totalPages = Math.ceil(filteredCourses.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedCourses = filteredCourses.slice(
    startIndex,
    startIndex + entriesPerPage
  );

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

  return (
    <>
      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 mb-6 my-6">
        <Select value={semesterFilter} onValueChange={setSemesterFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            <SelectItem value="Monsoon">Monsoon</SelectItem>
            <SelectItem value="Spring">Spring</SelectItem>
            <SelectItem value="Summer">Summer</SelectItem>
          </SelectContent>
        </Select>

        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
            <SelectItem value="2022">2022</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Entries + Search */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-dark">Show</span>
          <Select
            value={entriesPerPage.toString()}
            onValueChange={(value) => setEntriesPerPage(Number(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-neutral-dark">entries</span>
        </div>

        <div className="flex-1 max-w-md ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-primary" />
            <Input
              placeholder="Search Course or Professor"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-dark/15 rounded-lg border border-neutral-light overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-primary-light/40 dark:bg-primary-dark/40 z-10">
              <TableRow>
                {[
                  "courseCode",
                  "courseName",
                  "faculty",
                  "semester",
                  "year",
                ].map((field) => (
                  <TableHead
                    key={field}
                    className="cursor-pointer hover:bg-neutral-light"
                    onClick={() => handleSort(field as SortField)}
                  >
                    <div className="flex items-center gap-2">
                      {field}
                      <SortIcon field={field as SortField} />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCourses.map((course) => (
                <Dialog key={course.id}>
                  <DialogTrigger asChild>
                    <TableRow className="cursor-pointer hover:bg-neutral-extralight transition-colors">
                      <TableCell>{course.courseCode}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{course.courseName}</div>
                          <div className="text-xs text-gray">
                            {course.semester} {course.year}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{course.faculty}</TableCell>
                      <TableCell>{course.semester}</TableCell>
                      <TableCell>{course.year}</TableCell>
                    </TableRow>
                  </DialogTrigger>
                  <DialogContent className="w-4/5 max-w-[80vw] overflow-y-scroll max-h-[90vh]">
                    <CourseDialog course={course} />
                    <Button variant="animated" className="mt-3">
                      <CirclePlus /> Add Review
                    </Button>
                  </DialogContent>
                </Dialog>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-neutral-primary">
          Showing {startIndex + 1} to{" "}
          {Math.min(startIndex + entriesPerPage, filteredCourses.length)} of{" "}
          {filteredCourses.length} entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          {totalPages > 5 && (
            <>
              <span className="text-neutral-primary">...</span>
              <Button
                variant={currentPage === totalPages ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
