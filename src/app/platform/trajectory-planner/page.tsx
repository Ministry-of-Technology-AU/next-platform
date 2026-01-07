'use client';

import { CoursePlannerProvider } from './course-planner-context';
import { CoursePlannerBoard } from './_components/course-planner-board';

export default function Page() {
    return (
        <CoursePlannerProvider>
            <div className="h-full">
                <CoursePlannerBoard />
            </div>
        </CoursePlannerProvider>
    );
}
