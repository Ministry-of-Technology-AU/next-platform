import { Dumbbell } from 'lucide-react';
import PageTitle from '@/components/page-title';
import GymTrackerClient from './gym-tracker-client';

export const dynamic = 'force-dynamic';

export default function GymTrackerPage() {
  return (
    <div className="min-h-screen container mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-12 py-4 sm:py-6 lg:py-8 max-w-none lg:max-w-full">
      <PageTitle
        text="Gym Tracker"
        subheading="Plan your workout better with last-week occupancy patterns and real-time gym footfall from QR scans."
        icon={Dumbbell}
      />

      <div className="mt-6">
        <GymTrackerClient />
      </div>
    </div>
  );
}
