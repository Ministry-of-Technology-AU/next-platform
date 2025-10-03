import PageTitle from "@/components/page-title";
import { Suspense } from "react";
import { Calendar } from "lucide-react";
import Loader from "../loading";
import { OrientationDialog } from "@/components/orientation-dialog";

import DeveloperCredits from "@/components/developer-credits";

export default function SemesterPlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <div className="min-h-screen bg-neutral-extralight container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <PageTitle
          text="Semester Planner"
          icon={Calendar}
          subheading='Plan and organize your course schedule'
        />
        <OrientationDialog />
        <Suspense fallback={<Loader />}>
      {children}
      </Suspense>
    <DeveloperCredits developers={[{"name": "Soham Tulsyan", "role": "Lead Developer", 'profileUrl': 'https://www.linkedin.com/in/soham-tulsyan-0902482a7/'}]}/>

  </div>
);
}