import DeveloperCredits from "@/components/developer-credits"
import { OrientationDialog } from "@/components/orientation-dialog"
import { TourManager } from "./_components/tour-manager"

const developers = [
    { name: "Soham Tulsyan", role: "Development" },
    { name: "Vansh Bothra", role: "Development" },
    { name: "Aryan Nath", role: "Ideation" },
]

export default function TrajectoryPlannerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="mx-auto w-full max-w-[96rem] px-2 py-2 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <TourManager />
            <OrientationDialog description="The planner works in portrait, but you see more semesters at once in landscape." />
            {children}
            <DeveloperCredits developers={developers} />
        </div>
    )
}
