import PageTitle from "@/components/page-title";
import Image from "next/image";
import DeveloperCredits from "@/components/developer-credits";
import { Route } from "lucide-react";

export default async function GamesPage() {
    return (
        <div className="container py-8">
            <PageTitle text="Trajectory Planner" icon={Route} subheading="Coming Very Soon!" />
            <Image
                src="/mascot.png"
                alt="Mascot"
                width={400}
                height={900}
                className="mx-auto my-10"
            />
            <p className="text-center">We're working on something for you, and it's going to be out very very soon. Stay tuned!</p>
            <DeveloperCredits developers={[{ "name": "Soham Tulsyan", profileUrl: "https://www.linkedin.com/in/soham-tulsyan-0902482a7/" }, { "name": "Vansh Bothra" }]} />
        </div>
    );
}