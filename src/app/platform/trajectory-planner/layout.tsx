import React from 'react';
import PageTitle from '@/components/page-title';
import DeveloperCredits from '@/components/developer-credits';
import { Map, Route } from 'lucide-react';

export default function TrajectoryPlannerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const developers = [
        { name: "Soham Tulsyan" },
        { name: "Vansh Bothra" }
    ];

    return (
        <div className="w-full flex flex-col min-h-screen">
            <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
                <div className="mb-6">
                    <PageTitle
                        text="Course Trajectory Planner"
                        subheading="Plan your academic journey semester by semester"
                        icon={Route}
                    />
                </div>

                {children}

                <DeveloperCredits developers={developers} />
            </div>
        </div>
    );
}
