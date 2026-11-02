import { Skeleton } from "@/components/ui/skeleton"

/** Same blocks as the loaded page: title, summary bar, then tray and semester columns. */
export default function Loading() {
    return (
        <div aria-busy="true" aria-label="Loading the trajectory planner">
            <Skeleton className="mx-auto h-10 w-72" />
            <Skeleton className="mx-auto mt-3 h-4 w-full max-w-md" />
            <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-6">
                <Skeleton className="h-40 w-full rounded-xl sm:h-20" />
                <div className="flex h-[calc(100dvh-5rem)] min-h-[28rem] gap-4 overflow-hidden md:h-[calc(100dvh-7rem)]">
                    <Skeleton className="h-full w-[min(85vw,20rem)] shrink-0 rounded-xl md:w-64" />
                    {[0, 1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-full w-72 shrink-0 rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    )
}
