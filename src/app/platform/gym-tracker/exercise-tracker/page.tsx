import { Dumbbell } from 'lucide-react';
import PageTitle from '@/components/page-title';
import ExerciseTrackerClient from './exercise-tracker-client';

export const dynamic = 'force-dynamic';

export default function ExerciseTrackerPage() {
  return (
    <div className="min-h-screen container mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-12 py-4 sm:py-6 lg:py-8 max-w-none lg:max-w-full">
      <PageTitle
        text="Exercise Tracker"
        subheading="Log your sets, reps and weight. Track progress over time."
        icon={Dumbbell}
      />
      <div className="mt-6">
        <ExerciseTrackerClient />
      </div>
    </div>
  );
}
