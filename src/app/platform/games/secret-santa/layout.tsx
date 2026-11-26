import DeveloperCredits from "@/components/developer-credits"
import { TourManager } from "./_components/tour-manager"

const developers = [{ name: "Soham Tulsyan", role: "Development" }, { name: "Manavi Jain", role: "Ideation" }]

export default function SecretSantaLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="mx-auto w-full max-w-7xl px-2 py-2 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <TourManager />
            {children}
            <DeveloperCredits developers={developers} />
        </div>
    )
}
