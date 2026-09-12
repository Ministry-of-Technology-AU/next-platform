import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOrganisationsLoading() {
  return (
    <div className="pt-2 px-1 sm:px-2 md:px-4 flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Page Title Skeleton */}
      <div className="flex items-start gap-3">
        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-8 w-64 max-w-full rounded-md" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
      </div>

      {/* Summary Metric Cards Skeleton (5 cards) */}
      <section aria-label="Loading summary statistics" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-4 sm:p-5 flex flex-col justify-between shadow-xs ${
              i === 4 ? "col-span-2 sm:col-span-1" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-20 rounded" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <div className="mt-4 flex flex-col gap-1.5">
              <Skeleton className="h-8 w-16 rounded-md" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
          </div>
        ))}
      </section>

      {/* Filter Toolbar Skeleton */}
      <section aria-label="Loading filters" className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-4 sm:p-5 flex flex-col gap-4 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <Skeleton className="h-10 flex-1 max-w-md rounded-md" />
          <div className="flex flex-wrap items-center gap-2.5">
            <Skeleton className="h-10 w-[160px] rounded-md" />
            <Skeleton className="h-10 w-[140px] rounded-md" />
            <Skeleton className="h-10 w-[195px] rounded-md" />
            <Skeleton className="h-10 w-[90px] rounded-md" />
          </div>
        </div>
        <div className="pt-2 border-t border-border/50 flex justify-between items-center">
          <Skeleton className="h-3.5 w-48 rounded" />
        </div>
      </section>

      {/* Organisations Table Skeleton */}
      <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-neutral-light/50 dark:bg-gray-dark border-b border-border text-neutral-primary uppercase text-[11px] tracking-wider font-semibold">
              <tr>
                <th scope="col" className="px-4 py-3.5">Organisation</th>
                <th scope="col" className="px-4 py-3.5">Type</th>
                <th scope="col" className="px-4 py-3.5">Induction Status</th>
                <th scope="col" className="px-4 py-3.5 text-center">Open Roles</th>
                <th scope="col" className="px-4 py-3.5 text-center">Applications</th>
                <th scope="col" className="px-4 py-3.5 text-center">Team Size</th>
                <th scope="col" className="px-4 py-3.5">Last Inducted</th>
                <th scope="col" className="px-4 py-3.5 text-right"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="hover:bg-neutral-light/20 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <Skeleton className="h-4 w-36 rounded" />
                        <Skeleton className="h-3 w-24 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex justify-center">
                      <Skeleton className="h-4 w-6 rounded" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Skeleton className="h-4 w-8 rounded" />
                      <Skeleton className="h-2.5 w-14 rounded" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex justify-center">
                      <Skeleton className="h-4 w-6 rounded" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-3.5 w-20 rounded" />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex justify-end">
                      <Skeleton className="h-4 w-16 rounded" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar Skeleton */}
        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <Skeleton className="h-3.5 w-32 rounded" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
