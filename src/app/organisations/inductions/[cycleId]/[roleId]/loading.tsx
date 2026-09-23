import { Skeleton } from "@/components/ui/skeleton";

export default function RoleLoading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Back button */}
      <Skeleton className="h-8 w-28 rounded-xl" />

      {/* Role Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-48 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-72 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-xs">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-6 w-14 rounded-md" />
          </div>
        ))}
      </div>

      {/* Tabs list */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      {/* Main Tab Content Card */}
      <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-6 flex flex-col gap-4 shadow-xs">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
        <div className="space-y-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-lg border border-border/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-7 rounded-md" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-3 w-48 rounded" />
                </div>
              </div>
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
