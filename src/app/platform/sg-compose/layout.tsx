import DeveloperCredits from "@/components/developer-credits"
import { Suspense } from "react"
import Loader from "../loading"


export default function CGPALayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
<div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
  <Suspense fallback={<Loader />}>{children}</Suspense>
  <DeveloperCredits developers={[{"name": "Vansh Bothra", "role": "Backend Engineer"}, {"name": "Soham Tulsyan", "role": "Frontend Engineer", profileUrl: "https://www.linkedin.com/in/soham-tulsyan-0902482a7/"}, {"name": "Previous Teams", "role": ""}]}/>
  </div>
)
}