"use client";

import { useState } from "react";
import { BookOpen, Search, ChevronUp, ChevronDown, CirclePlus } from "lucide-react";
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

// Mock data for courses
const mockCourses = [
  {
    id: 1,
    courseCode: "PHY301",
    courseName: "Mathematical Physics",
    faculty: "Dr. Rajesh Kumar",
    semester: "Monsoon",
    year: "2024",
    description:
      "This course covers advanced mathematical methods used in physics including complex analysis, differential equations, and vector calculus.",
    overallRating: 4.6,
    reviews: [
      {
        batch: "2022",
        grade: "A",
        major: "Physics",
        rating: 5,
        summary:
          "Excellent course with clear explanations. The professor makes complex topics easy to understand. This is sample text to make a review look longer so we can get more of a feel about how the overall review card looks with the line and letter spacing as well as the clutter of content.",
        taInfluence: "Very helpful during office hours",
      },
      {
        batch: "2022",
        grade: "A",
        major: "Physics",
        rating: 4,
        summary:
          "Excellent course with clear explanations. The professor makes complex topics easy to understand.",
        taInfluence: "Very helpful during office hours",
      },
      {
        batch: "2021",
        grade: "B+",
        major: "Mathematics",
        rating: 3,
        summary:
          "Good course content but quite challenging. Requires consistent effort throughout the semester.",
        taInfluence: "TA was knowledgeable and supportive",
      },
      {
        batch: "2021",
        grade: "B+",
        major: "Mathematics",
        rating: 2,
        summary:
          "Good course content but quite challenging. Requires consistent effort throughout the semester.",
        taInfluence: "TA was knowledgeable and supportive",
      },
      {
        batch: "2021",
        grade: "B+",
        major: "Mathematics",
        rating: 1,
        summary:
          "Good course content but quite challenging. Requires consistent effort throughout the semester.",
        taInfluence: "TA was knowledgeable and supportive",
      },
    ],
    ratingMetrics: {
      transparentGrading: 4.5,
      assignmentsMatchClassContent: 4.2,
      gradesEasy: 3.8,
      gradesFairly: 4.0,
      goodLecturer: 4.8,
      courseRecommended: 4.7,
    },
  },
  {
    id: 2,
    courseCode: "CSE201",
    courseName: "Data Structures and Algorithms",
    faculty: "Prof. Anita Sharma",
    semester: "Spring",
    year: "2024",
    description:
      "Fundamental data structures and algorithms including arrays, linked lists, trees, graphs, sorting, and searching algorithms.",
    overallRating: 4.2,
    reviews: [
      {
        batch: "2023",
        grade: "A-",
        major: "Computer Science",
        rating: 4,
        summary:
          "Well-structured course with practical assignments. Good preparation for technical interviews.",
        taInfluence: "TA provided excellent coding support",
      },
    ],
    ratingMetrics: {
      transparentGrading: 4.5,
      assignmentsMatchClassContent: 4.2,
      gradesEasy: 3.8,
      gradesFairly: 4.0,
      goodLecturer: 4.8,
      courseRecommended: 4.7,
    },
  },
  {
    id: 3,
    courseCode: "ECO101",
    courseName: "Principles of Economics",
    faculty: "Dr. Priya Mehta",
    semester: "Monsoon",
    year: "2023",
    description:
      "Introduction to microeconomics and macroeconomics principles, market structures, and economic policy.",
    overallRating: 3.8,
    reviews: [
      {
        batch: "2022",
        grade: "B",
        major: "Economics",
        rating: 4,
        summary:
          "Good introduction to economics. Case studies were particularly helpful.",
        taInfluence: "TA sessions were informative",
      },
    ],
    ratingMetrics: {
      transparentGrading: 4.5,
      assignmentsMatchClassContent: 4.2,
      gradesEasy: 3.8,
      gradesFairly: 4.0,
      goodLecturer: 4.8,
      courseRecommended: 4.7,
    },
  },
];

type SortField = "courseCode" | "courseName" | "faculty" | "semester" | "year";
type SortDirection = "asc" | "desc";

export default function CourseReviewsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("courseCode");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  // Filter and sort courses
  const filteredCourses = mockCourses
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
    <div className="min-h-screen bg-neutral-extralight">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-4xl text-center font-bold text-neutral-extradark">
            Course Reviews
          </h1>
        </div>

        {/* Subheading */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-dark/15 rounded-lg border border-neutral-light">
          <h2 className="text-xl font-semibold text-neutral-extradark mb-4">
            A small guide to navigating course reviews:
          </h2>
          <div className="space-y-2 text-neutral-dark">
            <p>
              <strong>1.</strong> Courses listed below are courses offered in
              previous semesters, this includes their description as taken from
              AMS.
            </p>
            <p>
              <strong>2.</strong> To navigate to a particular course you can
              search by course code or course name in the search bar. You can
              see all courses for a particular semester or academic year using
              the filters.
            </p>
            <p>
              <strong>3.</strong> Please note that for courses offered in
              multiple semesters searching for a given semester will show only
              the course from that semester, in such a case please search by
              course name instead.
            </p>
            <p className="text-primary-primary font-medium">
              We also request that you add your own reviews to help your peers
              make more informed choices!
            </p>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-4 mb-6">
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

        {/* Entries per page and Search */}
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
                  <TableHead
                    className="cursor-pointer hover:bg-neutral-light"
                    onClick={() => handleSort("courseCode")}
                  >
                    <div className="flex items-center gap-2">
                      Course Code
                      <SortIcon field="courseCode" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-neutral-light"
                    onClick={() => handleSort("courseName")}
                  >
                    <div className="flex items-center gap-2">
                      Course Name
                      <SortIcon field="courseName" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-neutral-light"
                    onClick={() => handleSort("faculty")}
                  >
                    <div className="flex items-center gap-2">
                      Faculty
                      <SortIcon field="faculty" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-neutral-light"
                    onClick={() => handleSort("semester")}
                  >
                    <div className="flex items-center gap-2">
                      Semester
                      <SortIcon field="semester" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-neutral-light"
                    onClick={() => handleSort("year")}
                  >
                    <div className="flex items-center gap-2">
                      Year
                      <SortIcon field="year" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCourses.map((course) => (
                  <Dialog key={course.id}>
                    <DialogTrigger asChild>
                      <TableRow className="cursor-pointer hover:bg-neutral-extralight transition-colors">
                        <TableCell className="font-medium">
                          {course.courseCode}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {course.courseName}
                            </div>
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
                      <Button variant="animated" className="justify-self-end sticky bottom-1 max-w-1/8 mt-3"><CirclePlus />Add Review</Button>
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

        {/* Credits */}
        <div className="mt-12 pt-6 border-t border-neutral-light text-center text-sm text-neutral-primary">
          <p>
            Developed by{" "}
            <a href="#" className="text-primary-primary hover:underline">
              Soham Tulsyan - Lead Developer
            </a>
            {", "}
            <a href="#" className="text-primary-primary hover:underline">
              Vaani Goenka - Creative Manager
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
