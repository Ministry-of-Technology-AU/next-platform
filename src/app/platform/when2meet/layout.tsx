import PageTitle from "@/components/page-title"
import { Suspense } from "react"
import { CalendarSearch } from "lucide-react"
import Loader from "../loading"
import DeveloperCredits from "@/components/developer-credits"
import { TourManager } from "./_components/tour-manager"
import { TourStep } from "@/components/guided-tour"

export default function When2MeetLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
            <TourManager />
            <TourStep
                id="when2meet-intro"
                title="Welcome to When2Meet!"
                content="Find the best meeting time by sharing your availability. Let's walk through how to use this tool."
                order={0}
            >
                <PageTitle
                    text="When2Meet"
                    icon={CalendarSearch}
                    subheading="Create a shared calendar to find the best meeting time with your group. Select your available time slots and share the link with participants."
                />
            </TourStep>
            <div className="mt-4 mb-[40px] border-t border-gray-300"></div>
            <Suspense fallback={<Loader />}>{children}</Suspense>
            <DeveloperCredits developers={[{ name: "Vaani Goenka", role: "Lead Developer" }, { name: "Soham Tulsyan", role: "Assistant Developer" }]} />
        </div>
    )
}
