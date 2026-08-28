import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getResponsesByUserEmail, getFormById, type FormDetailSummary } from '@/lib/forms/strapi-forms';
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

    // Enrich applications with role, interview, and target round form details
    const enrichedApplications = await Promise.all(
      orgApplications.map(async (resp) => {
        if (!resp.form?.id) return resp;

        const pipelineInfo = await getPipelineForForm(resp.form.id);
        if (!pipelineInfo) return resp;

        const { role, rounds, cycle } = pipelineInfo;
        const currentRoundIdx = typeof resp.currentRound === 'number' ? resp.currentRound : 0;

        // Find the target evaluation round
        const targetRound =
          rounds[currentRoundIdx] ||
          rounds.find((r) => r.order === currentRoundIdx) ||
          (resp.applicationStatus === 'advanced' ? rounds.find((r) => r.type === 'interview') : null);

        let interviewDetails = null;
        let formDetails: FormDetailSummary | null = null;

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
        } else if (targetRound && targetRound.type === 'form' && currentRoundIdx > 0) {
          const rawFormId = targetRound.formId || targetRound.formIds?.[0];
          if (rawFormId && rawFormId !== 'none') {
            let formUid = String(rawFormId);
            if (!isNaN(Number(rawFormId)) && !String(rawFormId).includes('-')) {
              const formRec = await getFormById(rawFormId);
              if (formRec?.uid) formUid = formRec.uid;
            }

            const existingTargetResponse = allResponses.find(
              (r) => r.form?.uid === formUid || String(r.form?.id) === String(rawFormId),
            );
            const isCompleted = existingTargetResponse?.state === 'submitted';
            const isDraft = existingTargetResponse?.state === 'draft';

            formDetails = {
              roundId: targetRound.id,
              roundLabel: targetRound.label,
              formUid,
              deadline: targetRound.deadline,
              description: targetRound.description,
              isCompleted,
              isDraft,
              formUrl: `/platform/forms/${formUid}`,
            };
          }
        }

        return {
          ...resp,
          role,
          pipeline: rounds,
          cycle,
          deadlineExtension: cycle?.deadlineExtension || null,
          interviewDetails,
          formDetails,
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
