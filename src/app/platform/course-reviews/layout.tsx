import PageTitle from "@/components/page-title";
import { Suspense } from "react";
import { BookOpen } from "lucide-react";
import DeveloperCredits from "@/components/developer-credits";
import {ReviewsTableSkeleton} from "./_components/table";

export default function CourseReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl container mx-auto p-6 space-y-6">
      <PageTitle
        text="Course Reviews"
        icon={BookOpen}
        subheading='We request that you add your own reviews to help your peers make more informed choices!
          Note: All course and faculty names are taken directly from AMS.'

        />
        <Suspense fallback={<ReviewsTableSkeleton entriesPerPage={10} />}>
      {children}
      </Suspense>
    <DeveloperCredits developers={[{"name": "Soham Tulsyan", "role": "Lead Developer", 'profileUrl': 'https://www.linkedin.com/in/soham-tulsyan-0902482a7/'}, {"name": "Previous Teams"}]}/>
    </div>
  );
}