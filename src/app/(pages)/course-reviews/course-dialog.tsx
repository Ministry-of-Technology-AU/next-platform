"use client";
import {
  Disclosure,
  DisclosureContent,
  DisclosureTrigger,
} from "@/components/ui/disclosure";
import { Button } from "@/components/ui/button";
import { Rating, RatingButton } from "@/components/ui/star-rating";
import { ChevronDown, X } from "lucide-react";
import { DialogHeader } from "@/components/ui/dialog";
import {
  DialogDescription,
  DialogTitle,
  DialogClose,
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

const colorMap: { label: number; key: string }[] = [
  { label: 5, key: "bg-green-extralight/20 dark:bg-green-extralight/60" },
  { label: 4, key: "bg-green/20 dark:bg-green/60" },
  { label: 3, key: "bg-secondary-light/20 dark:bg-secondary/60" },
  { label: 2, key: "bg-primary/20 dark:bg-primary-light/60" },
  { label: 1, key: "bg-primary-extradark/20 dark:bg-primary-dark/60" },
];

export function CourseDialog({ course }: CourseDialogProps) {
  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Course Title */}
      <DialogHeader className="flex justify-center text-center align-center">
        <DialogTitle>
          <h3 className="text-primary font-semibold text-sm sm:text-base px-8">
            {course.courseName} ({course.courseCode}){" "}
            <span className="text-black dark:text-white"> by </span>{" "}
            {course.faculty}
          </h3>
        </DialogTitle>
        <DialogDescription className="text-gray font-bold mb-4 text-base sm:text-lg text-center">
          {course.semester} {course.year}
        </DialogDescription>
      </DialogHeader>

      {/* Responsive Disclosure Layout */}
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        {/* Overall Rating + Metrics */}
        <Disclosure className="flex-1 rounded-md border border-gray-200 dark:border-gray-700 p-3 min-w-0">
          <DisclosureTrigger>
            <Button
              variant="ghost"
              className="w-full justify-between text-sm sm:text-base font-medium min-w-0"
            >
              <span className="truncate">Overall Rating:</span>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <Rating readOnly defaultValue={course.overallRating}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <RatingButton
                      key={index}
                      size={50}
                      className="text-secondary"
                    />
                  ))}
                </Rating>
                <ChevronDown className="w-4 h-4" />
              </div>
            </Button>
          </DisclosureTrigger>
          <DisclosureContent className="mt-2 space-y-2 px-2 sm:px-4">
            {ratingMetrics.map(({ label, key }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-2 w-full min-w-0"
              >
                <span className="text-primary-light font-semibold text-xs sm:text-sm truncate flex-shrink">
                  {label}:
                </span>
                <div className="flex-shrink-0">
                  <Rating readOnly defaultValue={course.ratingMetrics[key]}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <RatingButton
                        key={i}
                        size={16}
                        className="text-secondary"
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
        <Disclosure className="flex-1 rounded-md border border-gray-200 dark:border-gray-700 p-3 min-w-0">
          <DisclosureTrigger>
            <Button
              variant="ghost"
              className="w-full justify-between text-sm sm:text-base font-medium"
            >
              <span className="truncate">Details and Description</span>
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            </Button>
          </DisclosureTrigger>
          <DisclosureContent className="mt-2 px-2 space-y-2">
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
        <h4 className="text-sm sm:text-base lg:text-lg mb-3 mt-4">
          Reviews ({course.reviews.length})
        </h4>
        {course.reviews.length > 0 ? (
          <div className="space-y-3">
            {course.reviews.map((review, index) => (
              <div
                key={index}
                className={`rounded-sm p-3 w-full ${
                  colorMap.find(
                    (item) => item.label === Math.round(review.rating)
                  )?.key || ""
                }`}
              >
                <div className="font-bold text-gray-dark dark:text-gray-light text-xs">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1 justify-between">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-xs whitespace-nowrap">
                          Rating:
                        </span>
                        <Rating readOnly defaultValue={review.rating}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <RatingButton
                              key={i}
                              size={14}
                              className="text-secondary-dark"
                            />
                          ))}
                        </Rating>
                      </div>
                      <div className="text-xs flex-shrink-0">
                        Grade: {review.grade ?? "N/A"}
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-600 dark:text-gray-300">
                      <span className="whitespace-nowrap">
                        Batch: {review.batch}
                      </span>
                      <span className="truncate">Major: {review.major}</span>
                    </div>
                  </div>
                </div>

                <p className="font-normal mt-2 text-xs sm:text-sm break-words leading-relaxed">
                  {review.summary}
                </p>
                {review.taInfluence && (
                  <p className="mt-2 text-xs sm:text-sm break-words">
                    <span className="font-semibold text-secondary-dark">
                      TA Influence:{" "}
                    </span>
                    {review.taInfluence}
                  </p>
                )}
              </div>
            ))}
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
