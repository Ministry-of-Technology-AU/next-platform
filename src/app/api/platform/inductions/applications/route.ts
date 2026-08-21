import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getResponsesByUserEmail } from '@/lib/forms/strapi-forms';
import { getPipelineForForm } from '@/lib/inductions/strapi-inductions';
import type { InterviewBooking } from '@/app/organisations/inductions/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;
    const allResponses = await getResponsesByUserEmail(userEmail);

    // Filter responses to only those where the form belongs to an organization with active inductions.
    const orgApplications = allResponses.filter((resp) => {
      const org = resp.form?.organisation;
      return !!org;
    });

    // Enrich applications with role and interview details
    const enrichedApplications = await Promise.all(
      orgApplications.map(async (resp) => {
        if (!resp.form?.id) return resp;

        const pipelineInfo = await getPipelineForForm(resp.form.id);
        if (!pipelineInfo) return resp;

        const { role, rounds } = pipelineInfo;
        const currentRoundIdx = typeof resp.currentRound === 'number' ? resp.currentRound : 0;

        // Find the target evaluation round (if advanced, look for the next round / interview round)
        const targetRound =
          rounds[currentRoundIdx] ||
          rounds.find((r) => r.order === currentRoundIdx) ||
          (resp.applicationStatus === 'advanced' ? rounds.find((r) => r.type === 'interview') : null);

        let interviewDetails = null;
        if (targetRound && targetRound.type === 'interview') {
          const candidateBooking = targetRound.interviewConfig?.bookings?.find(
            (b: InterviewBooking) => b.candidateEmail.toLowerCase() === userEmail.toLowerCase(),
          );

          interviewDetails = {
            roundId: targetRound.id,
            roundLabel: targetRound.label,
            deadline: targetRound.deadline,
            location: targetRound.interviewConfig?.location || 'Google Meet',
            slotDuration: targetRound.interviewConfig?.slotDuration || 30,
            isBooked: !!candidateBooking,
            booking: candidateBooking || null,
            bookingUrl: `/platform/inductions/interviews/${targetRound.id}`,
          };
        }

        return {
          ...resp,
          role,
          pipeline: rounds,
          interviewDetails,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      data: {
        applications: enrichedApplications,
      }
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
