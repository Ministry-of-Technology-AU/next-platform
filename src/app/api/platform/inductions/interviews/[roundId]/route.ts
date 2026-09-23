import { NextResponse } from 'next/server';
import { getPipelineRoundDetails, bookInterviewSlot } from '@/lib/inductions/strapi-inductions';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/platform/inductions/interviews/:roundId
 * Returns the interview scheduling metadata, available slots, and bookings.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ roundId: string }> }
) {
  try {
    const { roundId } = await params;
    if (!roundId) {
      return NextResponse.json({ success: false, error: 'Round ID is required' }, { status: 400 });
    }

    const round = await getPipelineRoundDetails(roundId);
    if (!round) {
      return NextResponse.json({ success: false, error: 'Interview round not found' }, { status: 404 });
    }

    if (round.type !== 'interview') {
      return NextResponse.json(
        { success: false, error: 'This round is not configured for interview scheduling' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: round,
    });
  } catch (error) {
    console.error('GET /api/platform/inductions/interviews/[roundId] failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch interview details' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/platform/inductions/interviews/:roundId
 * Reserves/books an interview slot for a candidate.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ roundId: string }> }
) {
  try {
    const { roundId } = await params;
    if (!roundId) {
      return NextResponse.json({ success: false, error: 'Round ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { slotKey, candidateEmail, candidateName } = body || {};

    if (!slotKey) {
      return NextResponse.json(
        { success: false, error: 'Please select a valid time slot' },
        { status: 400 }
      );
    }

    // Try to get session email if not provided in body
    let finalEmail = candidateEmail;
    let finalName = candidateName;

    if (!finalEmail) {
      const session = await auth();
      if (session?.user?.email) {
        finalEmail = session.user.email;
        finalName = finalName || session.user.name || undefined;
      }
    }

    if (!finalEmail) {
      return NextResponse.json(
        { success: false, error: 'Candidate email is required to book a slot' },
        { status: 400 }
      );
    }

    const result = await bookInterviewSlot(roundId, {
      slotKey,
      candidateEmail: finalEmail,
      candidateName: finalName,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to book slot' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Interview slot booked successfully',
      data: {
        slotKey,
        candidateEmail: finalEmail,
        candidateName: finalName,
      },
    });
  } catch (error) {
    console.error('POST /api/platform/inductions/interviews/[roundId] failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to book interview slot' },
      { status: 500 }
    );
  }
}
