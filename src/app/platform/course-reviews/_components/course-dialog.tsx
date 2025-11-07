"use client";
import {
  Disclosure,
  DisclosureContent,
  DisclosureTrigger,
} from "@/components/ui/disclosure";
import { Button } from "@/components/ui/button";
import { Rating, RatingButton } from "@/components/ui/star-rating";
import { ChevronDown } from "lucide-react";
import { DialogHeader } from "@/components/ui/dialog";
import {
  DialogDescription,
  DialogTitle,
} from "@radix-ui/react-dialog";

interface Review {
  batch: string;
  grade?: string;
  major: string;
  rating: number;
  summary: string;
  taInfluence: string;
}

interface Rating {
  transparentGrading: number;
  assignmentsMatchClassContent: number;
  gradesEasy: number;
  gradesFairly: number;
  goodLecturer: number;
  courseRecommended: number;
}

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  faculty: string;
  extraCredit?: boolean;
  classMode?: string;
  semester: string;
  year: string;
  gradingType?: string;
  description: string;
  overallRating: number;
  ratingMetrics: Rating;
  reviews: Review[];
}

interface CourseDialogProps {
  course: Course;
}

const ratingMetrics: { label: string; key: keyof Rating }[] = [
  { label: "Transparent Grading", key: "transparentGrading" },
  {
    label: "Assignments Match Class Content",
    key: "assignmentsMatchClassContent",
  },
  { label: "Grades Easy", key: "gradesEasy" },
  { label: "Grades Fairly", key: "gradesFairly" },
  { label: "Good Lecturer/Orator", key: "goodLecturer" },
  { label: "Course Recommended", key: "courseRecommended" },
];

const colorMap: { label: number; bgClass: string; borderClass: string }[] = [
  { label: 5, bgClass: "bg-green-500/10 dark:bg-green-400/5", borderClass: "border-green-500 dark:border-green-400" },
  { label: 4, bgClass: "bg-green-600/10 dark:bg-green-500/5", borderClass: "border-green-600 dark:border-green-500" },
  { label: 3, bgClass: "bg-yellow-500/10 dark:bg-yellow-400/5", borderClass: "border-yellow-500 dark:border-yellow-400" },
  { label: 2, bgClass: "bg-orange-500/10 dark:bg-orange-400/5", borderClass: "border-orange-500 dark:border-orange-400" },
  { label: 1, bgClass: "bg-red-500/10 dark:bg-red-400/5", borderClass: "border-red-500 dark:border-red-400" },
];

export function CourseDialog({ course }: CourseDialogProps) {
  return (
    <div className="w-full max-w-full max-h-[90vh] overflow-y-auto overflow-x-hidden p-1 sm:p-2">
      {/* Course Title */}
      <DialogHeader className="flex justify-center text-center align-center mb-2 sm:mb-4">
        <DialogTitle asChild>
          <h3 className="text-primary font-semibold text-sm sm:text-base px-2 sm:px-4 lg:px-8">
            {course.courseName} ({course.courseCode}){" "}
            <span className="text-black dark:text-white"> by </span>{" "}
            {course.faculty}
          </h3>
        </DialogTitle>
        <DialogDescription className="text-gray font-bold mb-2 sm:mb-4 text-sm sm:text-base lg:text-lg text-center">
          {course.semester} {course.year}
        </DialogDescription>
      </DialogHeader>

      {/* Responsive Disclosure Layout */}
      <div className="flex flex-col lg:flex-row gap-2 sm:gap-4 w-full mb-4">
        {/* Overall Rating + Metrics */}
        <Disclosure className="flex-1 rounded-md border border-gray-200 dark:border-gray-700 p-2 sm:p-3 min-w-0">
          <DisclosureTrigger>
            <Button
              variant="ghost"
              className="w-full justify-between text-xs sm:text-sm lg:text-base font-medium min-w-0 p-1 sm:p-2"
            >
              <span className="truncate">Overall Rating:</span>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <Rating readOnly defaultValue={course.overallRating}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <RatingButton
                      key={index}
                      size={40}
                      className="text-secondary pointer-events-none"
                    />
                  ))}
                </Rating>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </Button>
          </DisclosureTrigger>
          <DisclosureContent className="mt-1 sm:mt-2 space-y-1 sm:space-y-2 px-1 sm:px-2 lg:px-4">
            {ratingMetrics.map(({ label, key }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-1 sm:gap-2 w-full min-w-0"
              >
                <span className="text-primary-light font-semibold text-xs sm:text-sm truncate flex-shrink">
                  {label}:
                </span>
                <div className="flex-shrink-0">
                  <Rating readOnly defaultValue={course.ratingMetrics[key]}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <RatingButton
                        key={i}
                        size={14}
                        className="text-secondary pointer-events-none"
                      />
                    ))}
                  </Rating>
                </div>
              </div>
            ))}
            <p className="text-gray-500 dark:text-gray-light text-xs">From {course.reviews.length} reviews</p>
          </DisclosureContent>
        </Disclosure>

        {/* Course Description */}
        <Disclosure className="flex-1 rounded-md border border-gray-200 dark:border-gray-700 p-2 sm:p-3 min-w-0">
          <DisclosureTrigger>
            <Button
              variant="ghost"
              className="w-full justify-between text-xs sm:text-sm lg:text-base font-medium p-1 sm:p-2"
            >
              <span className="truncate">Details and Description</span>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            </Button>
          </DisclosureTrigger>
          <DisclosureContent className="mt-1 sm:mt-2 px-1 sm:px-2 space-y-1 sm:space-y-2">
            <p className="text-xs sm:text-sm break-words">
              <span className="text-secondary-dark font-semibold">
                Grading Type:{" "}
              </span>
              {course.gradingType ?? "Not Specified"}
            </p>
            <p className="text-xs sm:text-sm break-words">
              <span className="text-secondary-dark font-semibold">
                Extra Credit:{" "}
              </span>
              {course.extraCredit ? "Provided" : "Not Provided"}
            </p>
            <p className="text-xs sm:text-sm break-words">
              <span className="text-secondary-dark font-semibold">
                Class Mode:{" "}
              </span>
              {course.classMode ? course.classMode: "Not Provided"}
            </p>
          </DisclosureContent>
        </Disclosure>
      </div>

      {/* Reviews Section */}
      <div className="w-full">
        <h4 className="text-sm sm:text-base lg:text-lg mb-2 sm:mb-3">
          Reviews ({course.reviews.length})
        </h4>
        {course.reviews.length > 0 ? (
          <div className="space-y-2 sm:space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar">
            {course.reviews.map((review, index) => {
              const colorConfig = colorMap.find(
                (item) => item.label === Math.round(review.rating)
              );
              return (
              <div
                key={index}
                className={`rounded-sm p-2 sm:p-3 w-full border ${
                  colorConfig?.bgClass || "bg-gray-100/10 dark:bg-gray-700/15"
                } ${
                  colorConfig?.borderClass || "border-gray-300 dark:border-gray-600"
                }`}
              >
                <div className="font-bold text-gray-dark dark:text-gray-light text-xs">
                  <div className="flex flex-col gap-1 sm:gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 sm:justify-between">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-xs whitespace-nowrap">
                          Rating:
                        </span>
                        <div className="pointer-events-none">
                          <Rating readOnly defaultValue={review.rating}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <RatingButton
                                key={i}
                                size={12}
                                className="text-secondary-dark pointer-events-none"
                              />
                            ))}
                          </Rating>
                        </div>
                      </div>
                      <div className="text-xs flex-shrink-0">
                        Grade: {review.grade ?? "N/A"}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 lg:gap-3 text-xs text-gray-600 dark:text-gray-300">
                      <span className="whitespace-nowrap">
                        Batch: {review.batch}
                      </span>
                      <span className="truncate">Major: {review.major}</span>
                    </div>
                  </div>
                </div>

                <p className="font-normal mt-1 sm:mt-2 text-xs sm:text-sm break-words leading-relaxed">
                  {review.summary}
                </p>
                {review.taInfluence && (
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm break-words">
                    <span className="font-semibold text-secondary-dark">
                      TA Influence:{" "}
                    </span>
                    {review.taInfluence}
                  </p>
                )}
              </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray text-sm">
            No reviews available for this course. <strong className="text-primary">Be the first to add one!</strong>
          </p>
        )}
      </div>
    </div>
  );
}
