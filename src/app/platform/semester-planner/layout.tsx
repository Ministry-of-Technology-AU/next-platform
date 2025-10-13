import { Suspense } from "react";
import Loader from "../loading";
import { OrientationDialog } from "@/components/orientation-dialog";

import DeveloperCredits from "@/components/developer-credits";

export default function SemesterPlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <div className="mx-auto w-full max-w-screen-2xl px-4 pb-12 pt-6 sm:px-6 lg:px-10">
      <OrientationDialog />
      <Suspense fallback={<Loader />}>
        {children}
      </Suspense>
      <div className="mt-12">
        <DeveloperCredits
          developers={[
            {
              name: "Soham Tulsyan",
              role: "Lead Developer",
              profileUrl:
                "https://www.linkedin.com/in/soham-tulsyan-0902482a7/",
            },
            { name: "Previous Teams" },
          ]}
        />
      </div>

  </div>
);
}