import { NextRequest, NextResponse } from 'next/server';
import { getEvents } from '@/lib/apis/calendar';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 updated type
) {
  try {
    const { id: eventId } = await context.params; // 👈 must await
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const calId = searchParams.get('calId') || process.env.GOOGLE_CALENDAR_ID;

    const startTime = new Date(0).toISOString();
    const endTime = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10).toISOString();

    const event = await getEvents(calId as string, startTime, endTime, eventId);

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("Error fetching calendar event:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
