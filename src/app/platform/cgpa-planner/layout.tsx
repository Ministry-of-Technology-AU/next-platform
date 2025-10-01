import PageTitle from "@/components/page-title"
import { Suspense } from "react"
import { Calculator } from "lucide-react"
import DeveloperCredits from "@/components/developer-credits"
import Loader from "../loading"


export default function CGPALayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
    <PageTitle
      text="CGPA Planner"
      icon={Calculator}
      subheading="With this set of predictive tools specifically designed for Ashokans, you can simulate future CGPA scenarios based on expected grades. Enter Retakes, Pass/Fail(s), Audits, Transfer Credits and more to calculate your Semester GPA, CGPA, Dean's List for Semester, Latin Honors, and more. Enter target CGPA and know what will be your minimum required grades."
    />
    <div className="my-4 border-t border-gray-300"></div>

  <Suspense fallback={<Loader />}>{children}</Suspense>
  <DeveloperCredits developers={[{"name": "Soham Tulsyan", "role": "Lead Developer"}]}/>
  </div>
)
}