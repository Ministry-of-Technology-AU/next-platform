// app/course-reviews/page.tsx
import { BookOpen } from "lucide-react";
import CourseReviewsClient from "./course-reviews-client";
import PageTitle from "@/components/page-title";
import DeveloperCredits from "@/components/developer-credits";
import { strapiGet } from "@/apis/strapi";
import { max } from "date-fns";

const maxCoursesToLoad = 5;

// Mock or fetched data can stay server-side
function calculateRating(ratings: number[]){
  if (ratings.length === 0) return 0;
  else return Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
}

async function getData(){
  const data = await strapiGet("/courses", {
    "fields[0]": "courseCode",
    "fields[1]": "courseTitle",
    "fields[2]": "semester",
    "fields[3]": "year",
    "populate[0]": "faculties",
    "populate[1]": "course_reviews",
    "populate[2]": "reviews",
    "pagination[pageSize]": maxCoursesToLoad,
    // "filters[$or][0][year][$eq]": 2022,
    // "filters[$or][1][year][$eq]": 2023,
    "filters[$or][2][year][$eq]": 2024,
    // "filters[$or][3][year][$eq]": 2025,
    "sort[0]": "year:desc",
  });

  console.log(data.data);

  const courses = data?data.data.map((item : any) => {
    return {
      id: item.id,
      courseCode: item.attributes.courseCode,
      courseName: item.attributes.courseTitle,
      faculty: item.attributes.faculties.data
        .map((f: any) => f.attributes.name)
        .join(", "),
      semester: item.attributes.semester,
      year: item.attributes.year,
      gradingType:
        item.attributes.reviews.data.length > 0
          ? item.attributes.reviews.data[0].attributes.grading_type : null,
      extraCredit:
        item.attributes.reviews.data.length > 0
          ? item.attributes.reviews.data[0].attributes.extracredit
          : false,
      classMode: item.attributes.reviews.data.length>0 && item.attributes.reviews.data[0].attributes.mode,
      description: item.attributes.description || "No description available.",
      overallRating: calculateRating(item.attributes.reviews.data.map((review: any) => review.attributes.overall)),
      reviews: item.attributes.reviews.data.map((review: any) => ({
        batch: review.attributes.batch,
        grade: review.attributes.grade,
        major: review.attributes.major,
        rating: review.attributes.overall,
        summary: review.attributes.review,
        taInfluence: review.attributes.tf,
      })),
      ratingMetrics: {
        transparentGrading: calculateRating(item.attributes.reviews.data.map((review: any) => review.attributes.transparent)),
        assignmentsMatchClassContent: calculateRating(item.attributes.reviews.data.map((review: any) => review.attributes.relatability)),
        gradesEasy: calculateRating(item.attributes.reviews.data.map((review: any) => 5 - review.attributes.strict)),
        gradesFairly: calculateRating(item.attributes.reviews.data.map((review: any) => review.attributes.fair)),
        goodLecturer: calculateRating(item.attributes.reviews.data.map((review: any) => review.attributes.lecturer)),
        courseRecommended: calculateRating(item.attributes.reviews.data.map((review: any) => review.attributes.overall)),
      },
    };
  }):[];
  return courses;
}

export default async function CourseReviewsPage() {
  const data = await getData();
  return (
    <div className="min-h-screen bg-neutral-extralight">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        {/** TODO: FIX THE ALIGNEMENT */}
        <PageTitle
          text="Course Reviews"
          icon={BookOpen}
          subheading='A small guide to navigating course reviews: 
          1. Courses listed below are courses offered in previous semesters, this includes their description as taken from 
          2. Use the search bar and filters to find courses. 
          3. For courses offered in multiple semesters, search by course name. 
          We also request that you add your own reviews to help your peers make more informed choices!
          Note: All course and faculty names are taken directly from AMS.'
        />

        {/* Client-side interactive part */}
        <CourseReviewsClient courses={data} />

        {/* Credits */}
        <DeveloperCredits developers={[{"name": "Soham Tulsyan", "role": "Lead Developer"}]}/>
      </div>
    </div>
  );
}
