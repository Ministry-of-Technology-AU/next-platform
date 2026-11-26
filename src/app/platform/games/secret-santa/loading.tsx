import { Skeleton } from "@/components/ui/skeleton"

export default function SecretSantaLoading() {
    return (
        <div className="flex flex-col gap-8" aria-busy="true" aria-label="Loading Secret Santa">
            <Skeleton className="h-16 w-72" />
            <Skeleton className="h-56 w-full rounded-2xl" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }, (_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>
        </div>
    )
}
