import { Calculator } from "lucide-react";
import { TourStep } from "@/components/guided-tour";
import PageTitle from "@/components/page-title";
import { getAuthenticatedUser } from "@/lib/auth";
import { getCGPAReport } from "@/lib/cgpa/data";
import type { ParsedCGPAData } from "@/lib/cgpa/types";
import { CGPAPlannerClient } from "./client";

// Per-user data read with the session; never statically cached.
export const dynamic = "force-dynamic";

async function loadReport(): Promise<{ data: ParsedCGPAData | null; error: string | null }> {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.uid) return { data: null, error: null };
    const { report } = await getCGPAReport(user.uid);
    return { data: report, error: null };
  } catch (err) {
    platform.error("CGPA planner: loading the saved report failed:", err);
    return { data: null, error: "Your saved grades didn't load. Paste your AMS report again, or reload in a minute." };
  }
}

export default async function CGPAPlannerPage() {
  const { data, error } = await loadReport();

  return (
    <>
      <TourStep
        id="page-title"
        title="CGPA Planner"
        content="Paste your AMS course report once. Then try out grades for this term, link retakes, and work out what you need to hit a target CGPA."
        order={0}
      >
        <PageTitle
          icon={Calculator}
          text="CGPA Planner"
          subheading="See how this term's grades move your CGPA. Retakes, pass/fail, audits, summer terms, semesters abroad and transfer credits all count the way AMS counts them."
        />
      </TourStep>

      <div className="mt-6 sm:mt-8">
        <CGPAPlannerClient initialData={data} initialError={error} />
      </div>
    </>
  );
}
