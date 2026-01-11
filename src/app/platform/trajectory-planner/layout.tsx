import React from 'react';
import PageTitle from '@/components/page-title';
import DeveloperCredits from '@/components/developer-credits';
import { Route } from 'lucide-react';
import { TourStep } from '@/components/guided-tour';
import { NewToolBanner } from '@/components/new-tool-banner';
import { OrientationDialog } from '@/components/orientation-dialog';
import { TourManager } from './_components/tour-manager';

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
        <>
            <TourManager />
            <NewToolBanner className='mt-[-24px]' />
            <div className="w-full flex flex-col min-h-screen">
                <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
                    <div className="mb-6">
                        <TourStep
                            id="trajectory-planner-title"
                            title="Course Trajectory Planner [BETA]"
                            content="This is the beta version of the course trajectory planner. We're still in the process of adding more major templates, and communicating with reps for policy level implementations. For minors and concentrations, please add the courses manually for now. Let us know your thoughts on our new tool!"
                            order={0}
                        >
                            <PageTitle
                                text="Course Trajectory Planner"
                                subheading="Plan your academic journey semester by semester"
                                icon={Route}
                            />
                        </TourStep>
                    </div>

                    {children}

                    <DeveloperCredits developers={developers} />
                    <OrientationDialog />
                </div>
            </div>
        </>
    );
}
