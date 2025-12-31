'use client';

import { CoursePlannerProvider } from './course-planner-context';
import { CoursePlannerBoard } from './_components/course-planner-board';

export default function Page() {
    return (
        <CoursePlannerProvider>
            <div className="min-h-screen bg-background">
                <main className="container mx-auto px-4 py-8">
                    <CoursePlannerBoard />
                </main>
            </div>
        </CoursePlannerProvider>
    );
}
