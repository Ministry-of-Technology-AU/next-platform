import { Skeleton } from '@/components/ui/skeleton';
import { AssetGridSkeleton } from './_components/asset-grid';

/** Same blocks as the loaded page: title, tabs and search, type chips, then the card grid. */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl" aria-busy="true" aria-label="Loading items to borrow">
      <Skeleton className="mx-auto h-10 w-64" />
      <Skeleton className="mx-auto mt-3 h-4 w-full max-w-xl" />
      <div className="mt-6 space-y-6 sm:mt-8 sm:space-y-8">
        <div className="space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:justify-between">
            <Skeleton className="h-11 w-full rounded-lg md:h-10 md:w-96" />
            <Skeleton className="h-11 w-full rounded-md md:h-10 md:w-72" />
          </div>
          <div className="flex gap-2">
            {[88, 72, 72, 88].map((w, i) => (
              <Skeleton key={i} className="h-10 rounded-full sm:h-9" style={{ width: w }} />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="mb-3 h-6 w-36 sm:mb-4" />
          <AssetGridSkeleton />
        </div>
      </div>
    </div>
  );
}
