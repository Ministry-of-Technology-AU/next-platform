import PageTitle from "@/components/page-title"
import { Suspense } from "react"
import { MapPinned } from "lucide-react"
import Loader from "../loading"
import DeveloperCredits from "@/components/developer-credits"
import { TourManager } from "./_components/tour-manager"
import { TourStep } from "@/components/guided-tour"
import { DismissNewToolAlert } from "@/components/dismiss-new-tool-alert"

export default function AshokanAroundLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="max-w-7xl mx-auto p-6 sm:px-6 lg:px-8 pb-10">
      <DismissNewToolAlert storageKey="ASHOKA_AROUND_LAYOUT_ALERT_SEEN_V1" />
      <TourManager />
      <TourStep
        id="ashokan-around-intro"
        title="Welcome to Ashokan Around!"
        content="Find and share accommodation or ridesharing options around Ashoka University. Whether you're looking for a roommate outside campus, or offering a spare room during an internship, use this platform to connect with other Ashokans."
        order={0}
      >
        <PageTitle
          text="Ashokan Around"
          icon={MapPinned}
          subheading="Find and share accommodation or ridesharing options around Ashoka University. Whether you're looking for a roommate outside campus, or offering a spare room during an internship, use this platform to connect with other Ashokans."
        />
      </TourStep>
      <div className="mt-4 mb-[40px] border-t border-gray-300"></div>
      <Suspense fallback={<Loader />}>{children}</Suspense>
      <DeveloperCredits developers={[{ name: "Shashwat Bhajanka" }, { name: "Ayush Thonge" }, { name: "Soham Tulsyan" }]} />
    </div>
  )
}
