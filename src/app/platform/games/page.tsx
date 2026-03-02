"use server";
import { Puzzle } from "lucide-react";
import GameCard from "./_components/GameCard";
import PageTitle from "@/components/page-title";
import Image from "next/image";
import DeveloperCredits from "@/components/developer-credits";

export default async function GamesPage() {
    return (
        <div className="container py-8">
            <PageTitle text="Games and Puzzles" icon={Puzzle} subheading="Coming Very Soon!" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                {/* Example Game Card */}
                <GameCard
                    bannerImage="/ashoka-wordle.png"
                    href="/platform/games/ashoka-wordle"
                    name="Ashoka Wordle"
                    description="Test your vocabulary with this classic NYT Wordle game, now with Ashoka-themed words!"
                    isActive={true}
                />
                <GameCard
                    bannerImage="/Crossword.png"
                    href="/platform/games/crossword"
                    name="Crossword"
                    description="Another NYT style game - a standard crossword, with subtle themes and no paywalls!"
                    isActive={false}
                />

                {/* Add more game cards as needed */}
            </div>
        </div>
    );
}

// export default async function GamesPage() {
//     return (
//         <div className="container py-8">
//         <PageTitle text="Games and Puzzles" icon={Puzzle} subheading="Coming Very Soon!"/>
//         <Image
//         src="/mascot.png"
//         alt="Mascot"
//         width={400}
//         height={900}
//         className="mx-auto my-10"
//       />
//       <p className="text-center">We're working on something for you, and it's going to be out very very soon. Stay tuned!</p>
//   <DeveloperCredits developers={[{"name": "Vansh Bothra"}, {"name": "Soham Tulsyan", profileUrl: "https://www.linkedin.com/in/soham-tulsyan-0902482a7/"}]}/>
//         </div>
//     );
// }