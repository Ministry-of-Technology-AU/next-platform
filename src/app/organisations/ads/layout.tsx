import React from 'react';
import PageTitle from '@/components/page-title';
import DeveloperCredits from '@/components/developer-credits';
import { Megaphone } from 'lucide-react';
import { NewToolBanner } from '@/components/new-tool-banner';
import { OrientationDialog } from '@/components/orientation-dialog';

export default function TrajectoryPlannerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const developers = [
        { name: "Soham Tulsyan" }
    ];

    return (
        <>
            <NewToolBanner className='mt-[-24px]' />
            <div className="w-full flex flex-col min-h-screen">
                <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
                    <div className="mb-6">
                        <PageTitle
                            text="Ads and Showcases"
                            subheading="Create ads that will be displayed on our platform to promote your events, inductions, and more!"
                            icon={Megaphone}
                        />
                    </div>

                    {children}

                    <DeveloperCredits developers={developers} />
                    <OrientationDialog />
                </div>
            </div>
        </>
    );
}
