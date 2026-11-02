"use server";
import UnderMaintenance from "@/components/under-maintenance";

export default async function GamesPage() {
    return <UnderMaintenance />;
}

// --- Previous GamesPage (card grid) — re-enable when ready ---
// import { Puzzle } from "lucide-react";
// import GameCard from "./_components/GameCard";
// import PageTitle from "@/components/page-title";
// import Image from "next/image";
// import DeveloperCredits from "@/components/developer-credits";
//
// export default async function GamesPage() {
//     return (
//         <div className="container py-8">
//             <PageTitle text="Games and Puzzles" icon={Puzzle} subheading="Coming Very Soon!" />
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
//                 <GameCard
//                     bannerImage="/ashoka-wordle.png"
//                     href="/platform/games/ashoka-wordle"
//                     name="Ashoka Wordle"
//                     description="Test your vocabulary with this classic NYT Wordle game, now with Ashoka-themed words!"
//                     isActive={true}
//                 />
//                 <GameCard
//                     bannerImage="/Crossword.png"
//                     href="/platform/games/crossword"
//                     name="Crossword"
//                     description="Another NYT style game - a standard crossword, with subtle themes and no paywalls!"
//                     isActive={false}
//                 />
//             </div>
//         </div>
//     );
// }