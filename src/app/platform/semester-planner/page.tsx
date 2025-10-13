import { CalendarCheck2, Clock } from "lucide-react";
import { Toaster } from "sonner";
import { SemesterPlannerClient } from "./semester-planner";
import { cookies } from "next/headers";
import PageTitle from "@/components/page-title";


async function fetchDraftsAndCourses() {
  const cookieStore = await cookies();
  let drafts = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/platform/semester-planner/drafts`, { 
      cache: 'no-store',
      headers: { 'Cookie': cookieStore.toString() },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        drafts = data.data;
      }
    }
  } catch (e) {
    // fallback: no drafts
    console.error('Error fetching drafts:', e);
  }

  // Also fetch courses as before
  let courses = [];
  let syncInfo = { date: 'Unknown', time: 'Unknown' };
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/platform/semester-planner`, {
      cache: 'no-store',
      headers: { 'Cookie': cookieStore.toString() },
    });
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        courses = data.data.courses;
        syncInfo = data.data.syncInfo;
      }
    }
  } catch (e) {
    console.error('Error fetching courses:', e);
  }

  return { drafts, courses, syncInfo };
}


export default async function SemesterPlannerPage() {
  const { drafts, courses, syncInfo } = await fetchDraftsAndCourses();
  return (
    <>
      <div className="w-full px-0 pb-16 pt-4 sm:px-1 md:px-2 lg:px-4 xl:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <PageTitle
            icon={CalendarCheck2}
            text="Semester Planner"
            subheading="Curate your perfect schedule, keep favourite combinations locked in place, and export polished timetables in a click."
            className="text-left"
          />
          <div className="flex items-center self-start rounded-full border border-border/60 bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm">
            <Clock className="mr-2 h-4 w-4" />
            <span>
              Last synced on {syncInfo.date} at {syncInfo.time}
            </span>
          </div>
        </div>

        <div className="mt-8 lg:mt-10">
          <SemesterPlannerClient courses={courses} initialDrafts={drafts} />
        </div>
      </div>
      <Toaster position="top-right" />
    </>
  );
}
