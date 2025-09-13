"use server";
import { NextRequest, NextResponse } from 'next/server';
import { getEvents } from '@/lib/apis/calendar';

/**
 * GET handler for /api/calendar
 * Returns all events in a given date range (defaults to current month)
 */
export async function GET(request: NextRequest) {
    try {
        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const calId = searchParams.get('calId') || process.env.GOOGLE_CALENDAR_ID;
        
        // Default to current month if no dates provided
        const now = new Date();
        const startTime = searchParams.get('startTime') || now.toISOString();
        
        const then = new Date();
        then.setMonth(then.getMonth() + 1);
        const endTime = searchParams.get('endTime') || then.toISOString();
        
        console.log('API Route - Fetching events with params:', { 
            calId,
            startTime,
            endTime
        });
        
        // Get events from calendar API
        const events = await getEvents(
            calId as string,
            startTime,
            endTime
        );
        
        console.log('API Route - Events fetched:', events ? 
            `${Array.isArray(events) ? events.length : 1} events` : 
            'No events');
        
        return NextResponse.json({ 
            success: true, 
            data: events || []
        });
    } catch (error) {
        console.error("Error fetching calendar events:", error);
        return NextResponse.json(
            { 
                success: false, 
                error: (error as Error).message 
            },
            { status: 500 }
        );
    }
}