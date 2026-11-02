import { Skeleton } from "@/components/ui/skeleton";

/** Same shape as the loaded page: title, filter card, a grid of pool cards. */
export default function ResultsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading open pools">
      <div className="flex items-start gap-3">
        <Skeleton className="size-8 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      </div>
      <div className="mt-6 space-y-6 sm:mt-8">
        <Skeleton className="h-[7.5rem] w-full rounded-xl sm:h-[6.5rem]" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-60 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
