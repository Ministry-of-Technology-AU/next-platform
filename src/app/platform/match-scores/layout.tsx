import PageTitle from '@/components/page-title';
import DeveloperCredits from '@/components/developer-credits';
import { Award } from 'lucide-react';

export default function MatchScoresLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col h-full space-y-4 p-6">
            <div className="flex justify-between items-center">
                <PageTitle text="Match Scores" subheading="Live updates from ongoing matches across all leagues." icon={Award} />
            </div>

            <div className="flex-1 w-full relative">
                {children}
            </div>

            <div className="mt-auto pt-4">
                <DeveloperCredits developers={[{ name: "Soham Tulsyan", role: "Lead Developer" }, { name: "Eeshaja Swami", role: "UI/UX Engineer" }]} />
            </div>
        </div>
    );
}
