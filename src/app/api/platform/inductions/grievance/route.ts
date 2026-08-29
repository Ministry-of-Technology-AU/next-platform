import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getResponsesByUserEmail, getFormByUid } from '@/lib/forms/strapi-forms';
import { getPipelineForForm } from '@/lib/inductions/strapi-inductions';
import { sendGrievanceEmails } from '@/lib/inductions/grievance-email';
import type { GrievanceApplicationRecord, FormResponseEntry } from '@/lib/inductions/grievance-email';
import type { InterviewBooking } from '@/app/organisations/inductions/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    const userEmail = session.user.email;

    let body: { applicationId: number; subject: string; body: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 },
      );
    }

    const { applicationId, subject, body: grievanceBody } = body;

    if (!applicationId || typeof applicationId !== 'number') {
      return NextResponse.json(
        { success: false, error: 'applicationId is required' },
        { status: 400 },
      );
    }
    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'subject is required' },
        { status: 400 },
      );
    }
    if (!grievanceBody || typeof grievanceBody !== 'string' || grievanceBody.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'body is required' },
        { status: 400 },
      );
    }

    // Fetch ALL of the student's responses (we need them across all forms/rounds)
    const allResponses = await getResponsesByUserEmail(userEmail);
    const application = allResponses.find((r) => r.id === applicationId);

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 },
      );
    }

    // Security: only allow grievances on rejected applications owned by this student
    if (application.applicationStatus !== 'rejected') {
      return NextResponse.json(
        { success: false, error: 'Grievances can only be raised for rejected applications' },
        { status: 403 },
      );
    }

    if (application.respondentEmail?.trim().toLowerCase() !== userEmail.trim().toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 },
      );
    }

    const form = application.form;
    if (!form) {
      return NextResponse.json(
        { success: false, error: 'Associated form not found' },
        { status: 404 },
      );
    }

    // Fetch pipeline info (role, rounds, cycle)
    let pipelineInfo = null;
    if (form.id) {
      pipelineInfo = await getPipelineForForm(form.id);
    }

    const { role, rounds } = pipelineInfo ?? { role: null, rounds: [], cycle: null };
    const currentRoundIdx = typeof application.currentRound === 'number' ? application.currentRound : 0;

    // ── Collect ALL form responses across every round ─────────────────────
    // Start with the primary application form
    const formResponses: FormResponseEntry[] = [];

    // Build a map of all student responses by form uid for quick lookup
    const responseByFormUid = new Map<string, typeof allResponses[number]>();
    for (const r of allResponses) {
      if (r.form?.uid) responseByFormUid.set(r.form.uid, r);
    }

    // Fetch primary form schema so questions and answer labels render accurately
    const primaryFormRec = form.uid ? await getFormByUid(form.uid) : null;

    // Primary form response (round 0 / initial application)
    formResponses.push({
      formTitle: primaryFormRec?.title || form.title || 'Application Form',
      roundLabel: rounds?.[0]?.label ?? 'Initial Application',
      schema: primaryFormRec?.schema ?? null,
      data: application.data ?? null,
      submittedAt: application.submittedAt,
    });

    // Additional round forms (round index > 0)
    if (rounds && rounds.length > 0) {
      for (let i = 0; i < rounds.length; i++) {
        const round = rounds[i];
        if (round.type !== 'form') continue;
        const roundFormIds = round.formIds ?? (round.formId ? [round.formId] : []);
        for (const fid of roundFormIds) {
          if (!fid || fid === 'none' || fid === '[object Object]') continue;

          // Try to match to one of the student's existing responses
          let matchedResponse = responseByFormUid.get(fid);
          let matchedFormRec = null;

          // If fid is numeric, try fetching the uid first
          if (!matchedResponse && !isNaN(Number(fid)) && !fid.includes('-')) {
            matchedFormRec = await getFormByUid(fid);
            if (matchedFormRec?.uid) matchedResponse = responseByFormUid.get(matchedFormRec.uid);
          } else {
            matchedFormRec = await getFormByUid(fid);
          }

          if (matchedResponse && matchedResponse.id !== application.id) {
            // Avoid duplicates in formResponses
            const alreadyAdded = formResponses.some((fr) => fr.formTitle === (matchedFormRec?.title || matchedResponse?.form?.title));
            if (!alreadyAdded) {
              formResponses.push({
                formTitle: matchedFormRec?.title || matchedResponse.form?.title || round.label || `Round ${round.order ?? i + 1} Form`,
                roundLabel: round.label ?? `Round ${i + 1}`,
                schema: matchedFormRec?.schema ?? null,
                data: matchedResponse.data ?? null,
                submittedAt: matchedResponse.submittedAt,
              });
            }
          }
        }
      }
    }

    // ── Collect all interview details & timelines ─────────────────────────
    const interviewDetailsList: GrievanceApplicationRecord['interviewDetails'] = [];
    if (rounds && rounds.length > 0) {
      for (const round of rounds) {
        if (round.type !== 'interview') continue;
        const candidateBooking = round.interviewConfig?.bookings?.find(
          (b: InterviewBooking) => b.candidateEmail?.toLowerCase() === userEmail.toLowerCase(),
        );
        interviewDetailsList.push({
          roundLabel: round.label,
          eventTitle: round.interviewConfig?.eventTitle || null,
          location: round.interviewConfig?.location || 'Google Meet / Online',
          slotDuration: round.interviewConfig?.slotDuration || 30,
          startDate: round.interviewConfig?.startDate || null,
          endDate: round.interviewConfig?.endDate || null,
          deadline: round.deadline || null,
          isBooked: !!candidateBooking,
          booking: candidateBooking
            ? {
                slotKey: candidateBooking.slotKey,
                bookedAt: candidateBooking.bookedAt ?? null,
                candidateName: candidateBooking.candidateName ?? null,
              }
            : null,
        });
      }
    }

    const orgName = form.organisation?.name || role?.name || 'Organization';

    const applicationRecord: GrievanceApplicationRecord = {
      orgName,
      roleName: role?.name ?? null,
      formTitle: form.title || 'Application Form',
      formResponses,
      pipeline: rounds && rounds.length > 0 ? rounds : null,
      currentRound: currentRoundIdx,
      interviewDetails: interviewDetailsList && interviewDetailsList.length > 0 ? interviewDetailsList : null,
      submittedAt: application.submittedAt,
      rejectedAt: application.lastSavedAt,
      statusMessage: application.statusMessage ?? null,
    };

    await sendGrievanceEmails({
      studentEmail: userEmail,
      grievanceSubject: subject.trim(),
      grievanceBody: grievanceBody.trim(),
      applicationRecord,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[grievance] Error processing grievance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit grievance' },
      { status: 500 },
    );
  }
}
