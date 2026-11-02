import { Skeleton } from "@/components/ui/skeleton";

/** Same blocks as the loaded page: title, overview, tabs, then rail and term panel. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading the CGPA planner">
      <Skeleton className="mx-auto h-10 w-64" />
      <Skeleton className="mx-auto mt-3 h-4 w-full max-w-xl" />
      <div className="mt-6 space-y-6 sm:mt-8">
        <Skeleton className="h-40 w-full rounded-xl sm:h-36" />
        <Skeleton className="h-11 w-full rounded-lg" />
        <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
          <Skeleton className="h-12 w-full rounded-xl lg:h-96" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
