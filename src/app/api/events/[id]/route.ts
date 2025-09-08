"use server";
import { NextRequest, NextResponse } from 'next/server';
import { getEvents } from '@/lib/apis/calendar';

/**
 * GET handler for /api/calendar/[id]
 * Returns a single event by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Get event ID from route params
        const eventId = params.id;
        if (!eventId) {
            return NextResponse.json(
                { success: false, error: "Event ID is required" },
                { status: 400 }
            );
        }

        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const calId = searchParams.get('calId') || process.env.GOOGLE_CALENDAR_ID;
        
        // For single event fetching, time range isn't used but API requires it
        // Pass placeholder values that should include any event
        const startTime = new Date(0).toISOString(); // beginning of time
        const endTime = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10).toISOString(); // 10 years from now
        
        // Get event details from calendar API
        const event = await getEvents(
            calId as string,
            startTime,
            endTime,
            eventId
        );
        
        return NextResponse.json({ 
            success: true, 
            data: event
        });
    } catch (error) {
        console.error(`Error fetching calendar event:`, error);
        return NextResponse.json(
            { 
                success: false, 
                error: (error as Error).message 
            },
            { status: 500 }
        );
    }
}
