import { Calendar, Clock } from "lucide-react";
import { Toaster } from "sonner";
import { SemesterPlannerClient } from "./semester-planner";
import PageTitle from "@/components/page-title";
import { OrientationDialog } from "@/components/orientation-dialog";
import { cookies } from "next/headers";


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
      <div className="container mx-auto p-6 space-y-6">
        <OrientationDialog />
        <PageTitle text="Semester Planner" icon={Calendar} subheading="Plan and organize your course schedule" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            Last synced on {syncInfo.date} at {syncInfo.time}
          </span>
        </div>
        <SemesterPlannerClient courses={courses} initialDrafts={drafts} />
      </div>
      <Toaster position="top-right" />
    </>
  );
}
