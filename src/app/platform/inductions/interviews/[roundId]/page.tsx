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

  let round = await getPipelineRoundDetails(roundId);
  if (!round || round.type !== 'interview') {
    if (roundId === 'preview' || roundId.startsWith('new-') || roundId.includes('-') || isNaN(Number(roundId))) {
      // Fallback preview mode so live preview always renders
      round = {
        id: roundId,
        type: 'interview',
        label: 'Interview Scheduling',
        order: 1,
        formIds: [],
        description: null,
        deadline: null,
        interviewConfig: {
          eventTitle: 'Interview Scheduling',
          eventDescription: 'Select an available interview slot from the options below.',
          location: 'Google Meet',
          invitees: [],
          dateMode: 'dates',
          slotMode: 'custom',
          slotDuration: 30,
          selectedSlots: [],
          disclaimer: 'Please do not modify the event details on Google Calendar.',
          bookings: [],
        },
        role: {
          id: '1',
          name: 'Applicant Role',
          tier: 'tier-1',
          department: null,
        },
        cycle: {
          id: '1',
          name: 'Induction Cycle',
        },
        organisation: {
          id: '1',
          name: 'Organisation',
          logoUrl: null,
          email: null,
        },
      };
    } else {
      notFound();
    }
  }

  if (!round) notFound();

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
