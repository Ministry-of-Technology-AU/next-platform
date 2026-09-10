import { Skeleton } from "@/components/ui/skeleton";

export default function CycleLoading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Back to cycles button */}
      <Skeleton className="h-8 w-32 rounded-md" />

      {/* Page Title & Date Range */}
      <div className="flex items-start gap-3">
        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-8 w-64 max-w-full rounded-md" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-40 rounded" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>

      {/* Single Cycle Stats Bar */}
      <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-xs">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-7 w-16 rounded-md" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
        ))}
      </div>

      {/* Roles Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Roles Grid Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-5 flex flex-col justify-between gap-4 shadow-xs">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-full rounded" />
              <Skeleton className="h-3.5 w-4/5 rounded" />
            </div>
            <div className="pt-3 border-t border-border/50 flex items-center justify-between">
              <div className="flex gap-3">
                <Skeleton className="h-4 w-14 rounded" />
                <Skeleton className="h-4 w-14 rounded" />
              </div>
              <Skeleton className="h-7 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
