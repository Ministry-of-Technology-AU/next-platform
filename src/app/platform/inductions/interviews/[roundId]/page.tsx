import { notFound } from 'next/navigation';
import { getPipelineRoundDetails } from '@/lib/inductions/strapi-inductions';
import { auth } from '@/auth';
import { InterviewBookingClient } from './client';

interface InterviewPageProps {
  params: Promise<{
    roundId: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function InterviewBookingPage({ params }: InterviewPageProps) {
  const { roundId } = await params;
  if (!roundId) notFound();

  const round = await getPipelineRoundDetails(roundId);
  if (!round || round.type !== 'interview') {
    notFound();
  }

  const session = await auth();
  const currentUser = session?.user
    ? {
        email: session.user.email || '',
        name: session.user.name || '',
      }
    : null;

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <InterviewBookingClient round={round} currentUser={currentUser} />
    </div>
  );
}
