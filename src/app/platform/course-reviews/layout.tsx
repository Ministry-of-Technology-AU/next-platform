import { Suspense } from "react";
import DeveloperCredits from "@/components/developer-credits";
import { ReviewsTableSkeleton } from "./_components/table";
import PageTitle from "@/components/page-title";
import { BookOpen } from "lucide-react";
import { cookies } from "next/headers";

async function getReviewCount() {
  const cookieStore = await cookies();
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  try {
    const response = await fetch(`${baseUrl}/api/platform/courses`, {
      cache: 'no-store',
      headers: { 'Cookie': cookieStore.toString() },
    });
    if (!response.ok) return 0;
    const data = await response.json();
    return data.data ? data.data.reduce((acc: any, item: any) => acc + item.attributes.reviews.data.length, 0) : 0;
  } catch (e) {
    console.error(e);
    return 0;
  }
}

export default async function CourseReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const totalReviews = await getReviewCount();
  return (
    <div className="max-w-7xl container mx-auto p-6 space-y-6">
      <PageTitle
        text="Course Reviews"
        icon={BookOpen}
        subheading={
          <span>
            We request that you add your own reviews to help your peers make more informed choices! Currently showing <span className="dark:text-secondary text-primary font-bold">{totalReviews}</span> reviews across all courses.
            Note: All course and faculty names are taken directly from AMS.
          </span>
        }
      />
      <Suspense fallback={<ReviewsTableSkeleton entriesPerPage={10} />}>
        {children}
      </Suspense>
      <DeveloperCredits developers={[{ "name": "Soham Tulsyan", "role": "Lead Developer", 'profileUrl': 'https://www.linkedin.com/in/soham-tulsyan-0902482a7/' }, { "name": "Previous Teams" }]} />
    </div>
  );
}