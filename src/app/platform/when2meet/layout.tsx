import PageTitle from "@/components/page-title"
import { Suspense } from "react"
import { CalendarDays } from "lucide-react"
import Loader from "../loading"
import DeveloperCredits from "@/components/developer-credits"

export default function When2MeetLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
            <PageTitle
                text="When2Meet"
                icon={CalendarDays}
                subheading="Create a shared calendar to find the best meeting time with your group. Select your available time slots and share the link with participants."
            />
            <div className="mt-4 mb-[100px] border-t border-gray-300"></div>
            <Suspense fallback={<Loader />}>{children}</Suspense>
            <DeveloperCredits developers={[{ name: "Vaani Goenka" }]} />
        </div>
    )
}
