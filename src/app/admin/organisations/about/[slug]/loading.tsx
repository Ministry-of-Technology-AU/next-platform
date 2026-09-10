import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOrganisationDetailLoading() {
  return (
    <div className="pt-2 px-1 sm:px-2 md:px-4 flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Page Title Skeleton */}
      <div className="flex items-start gap-3">
        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-8 w-72 max-w-full rounded-md" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
      </div>

      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24 rounded" />
        <span className="text-neutral-300">/</span>
        <Skeleton className="h-4 w-32 rounded" />
      </div>

      {/* Profile & Overview Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start shadow-xs">
          <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shrink-0" />
          <div className="flex-1 flex flex-col gap-3 min-w-0 w-full">
            <div className="flex flex-wrap items-center gap-2.5">
              <Skeleton className="h-7 w-48 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
            <Skeleton className="h-4 w-40 rounded" />
            <div className="flex flex-wrap gap-4 pt-2 border-t border-border/50">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
            </div>
          </div>
        </div>

        {/* Quick Action / Cycle selector card */}
        <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-6 flex flex-col justify-between shadow-xs">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="pt-4 border-t border-border/50 flex justify-between">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs & Table Container Skeleton */}
      <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-6 flex flex-col gap-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
          <Skeleton className="h-4 w-20 rounded" />
        </div>

        {/* Inner Table Skeleton */}
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-light/50 dark:bg-gray-dark border-b border-border">
              <tr>
                <th className="px-3.5 py-2.5"><Skeleton className="h-3.5 w-24" /></th>
                <th className="px-3.5 py-2.5"><Skeleton className="h-3.5 w-16" /></th>
                <th className="px-3.5 py-2.5"><Skeleton className="h-3.5 w-20" /></th>
                <th className="px-3.5 py-2.5 text-center"><Skeleton className="h-3.5 w-12 mx-auto" /></th>
                <th className="px-3.5 py-2.5 text-center"><Skeleton className="h-3.5 w-12 mx-auto" /></th>
                <th className="px-3.5 py-2.5 text-right"><Skeleton className="h-3.5 w-16 ml-auto" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-3.5 py-3"><Skeleton className="h-4 w-32 rounded" /></td>
                  <td className="px-3.5 py-3"><Skeleton className="h-4 w-14 rounded-full" /></td>
                  <td className="px-3.5 py-3"><Skeleton className="h-4 w-20 rounded" /></td>
                  <td className="px-3.5 py-3 text-center"><Skeleton className="h-4 w-8 mx-auto rounded" /></td>
                  <td className="px-3.5 py-3 text-center"><Skeleton className="h-4 w-8 mx-auto rounded" /></td>
                  <td className="px-3.5 py-3 text-right"><Skeleton className="h-4 w-12 ml-auto rounded" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
