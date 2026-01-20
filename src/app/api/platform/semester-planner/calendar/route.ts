import { NextRequest, NextResponse } from "next/server";
import { HOLIDAYS_2025_2026, isHoliday } from "@/app/platform/semester-planner/holidays";

interface TimeSlot {
    day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
    slot: string;
}

interface ScheduledCourse {
    id: string;
    code: string;
    name: string;
    professor: string;
    department: string;
    location: string;
    description: string;
    prerequisites: string[];
    timeSlots: TimeSlot[];
    hasSaturday: boolean;
    color: string;
}

// Unique identifier for events created by this app
const EVENT_IDENTIFIER = "TIMETABLE_SYNC_2025_2026";

const WEEKDAY_MAP: Record<string, string> = {
    Monday: "MO",
    Tuesday: "TU",
    Wednesday: "WE",
    Thursday: "TH",
    Friday: "FR",
    Saturday: "SA",
};

const WEEKDAY_NUM: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
};

function getNextDateForDay(day: string): Date {
    const today = new Date();
    const targetDay = WEEKDAY_NUM[day];
    if (targetDay === undefined) throw new Error("Invalid day: " + day);

    const diff = (targetDay + 7 - today.getDay()) % 7 || 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + diff);
    nextDate.setHours(0, 0, 0, 0);
    return nextDate;
}

function parseTime(timeStr: string): { hours: number; minutes: number } {
    const meridiem = timeStr.slice(-2).toLowerCase();
    let [hours, minutes] = timeStr.slice(0, -2).split(":").map(Number);

    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;

    return { hours, minutes };
}

async function getAllExistingEvents(accessToken: string): Promise<Set<string>> {
    const existingCourseIds = new Set<string>();

    // Get time range for the academic year
    const timeMin = new Date('2025-08-25T00:00:00Z').toISOString();
    const timeMax = new Date('2026-05-09T23:59:59Z').toISOString();

    try {
        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&maxResults=2500&singleEvents=false`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            console.error('Failed to fetch existing events');
            return existingCourseIds;
        }

        const data = await response.json();
        const events = data.items || [];

        // Extract course IDs from existing events
        for (const event of events) {
            if (event.description?.includes(EVENT_IDENTIFIER)) {
                // Extract course ID from description: [TIMETABLE_SYNC_2025_2026:COURSE_ID]
                const match = event.description.match(/\[TIMETABLE_SYNC_2025_2026:([^\]]+)\]/);
                if (match && match[1]) {
                    existingCourseIds.add(match[1]);
                }
            }
        }

        console.log(`Found ${existingCourseIds.size} existing synced courses`);
    } catch (error) {
        console.error('Error fetching existing events:', error);
    }

    return existingCourseIds;
}

async function createCalendarEvent(
    course: ScheduledCourse,
    accessToken: string
): Promise<{ success: boolean; error?: string; eventId?: string; skipped?: boolean }> {
    try {
        const firstSlot = course.timeSlots[0];
        const startDate = getNextDateForDay(firstSlot.day);

        const [startStr, endStr] = firstSlot.slot.split("-");
        const start = parseTime(startStr);
        const end = parseTime(endStr);

        const startDateTime = new Date(startDate);
        startDateTime.setHours(start.hours, start.minutes, 0);

        const endDateTime = new Date(startDate);
        endDateTime.setHours(end.hours, end.minutes, 0);

        // Get unique days for recurrence rule
        const BYDAY = Array.from(new Set(course.timeSlots.map((ts) => ts.day)))
            .map((d) => WEEKDAY_MAP[d])
            .filter(Boolean)
            .join(",");

        const event = {
            summary: course.name,
            location: course.location,
            description: `[${EVENT_IDENTIFIER}:${course.id}]\n\nCourse Code: ${course.code}\nProfessor: ${course.professor}\nDepartment: ${course.department}\n\n${course.description}`,
            start: {
                dateTime: startDateTime.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            recurrence: [`RRULE:FREQ=WEEKLY;COUNT=30;BYDAY=${BYDAY}`],
            colorId: "1",
        };

        const response = await fetch(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(event),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error(`Failed to create event for course ${course.code}:`, error);
            return {
                success: false,
                error: error.error?.message || "Failed to create event",
            };
        }

        const result = await response.json();
        return { success: true, eventId: result.id };
    } catch (error) {
        console.error(`Error creating event for course ${course.code}:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

async function getEventsOnHolidays(
    accessToken: string
): Promise<Array<{ id: string; start: string; summary: string }>> {
    const eventsOnHolidays: Array<{ id: string; start: string; summary: string }> = [];

    // Get time range for the academic year
    const timeMin = new Date('2025-08-25T00:00:00Z').toISOString();
    const timeMax = new Date('2026-05-09T23:59:59Z').toISOString();

    try {
        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&maxResults=2500&singleEvents=true`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            console.error('Failed to fetch events for holiday check');
            return [];
        }

        const data = await response.json();
        const events = data.items || [];

        // Filter events that match our identifier and fall on holidays
        for (const event of events) {
            if (
                event.description?.includes(EVENT_IDENTIFIER) &&
                event.start?.dateTime
            ) {
                const eventDate = new Date(event.start.dateTime);
                if (isHoliday(eventDate)) {
                    eventsOnHolidays.push({
                        id: event.id,
                        start: event.start.dateTime,
                        summary: event.summary,
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error checking for events on holidays:', error);
    }

    return eventsOnHolidays;
}

async function deleteEvent(
    eventId: string,
    accessToken: string
): Promise<boolean> {
    try {
        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return response.ok;
    } catch (error) {
        console.error(`Error deleting event ${eventId}:`, error);
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        const { courses, accessToken } = await request.json();

        if (!courses || !Array.isArray(courses) || !accessToken) {
            return NextResponse.json(
                { success: false, error: "Courses and access token are required" },
                { status: 400 }
            );
        }

        if (courses.length === 0) {
            return NextResponse.json(
                { success: false, error: "No courses to sync" },
                { status: 400 }
            );
        }

        // Step 0: Get all existing events to check for duplicates
        console.log('Step 0: Checking for existing events...');
        const existingCourseIds = await getAllExistingEvents(accessToken);

        // Filter out courses that already exist
        const coursesToCreate = courses.filter(course => !existingCourseIds.has(course.id));
        const skippedCount = courses.length - coursesToCreate.length;

        if (skippedCount > 0) {
            console.log(`Skipping ${skippedCount} courses that already exist in calendar`);
        }

        if (coursesToCreate.length === 0) {
            return NextResponse.json({
                success: true,
                message: `All ${courses.length} course${courses.length !== 1 ? "s" : ""} already synced. No new events created.`,
                successful: 0,
                failed: 0,
                skipped: skippedCount,
                total: courses.length,
                deletedOnHolidays: 0,
            });
        }

        // Step 1: Create calendar events for new courses only
        console.log(`Step 1: Creating ${coursesToCreate.length} new calendar events...`);
        const results = await Promise.all(
            coursesToCreate.map((course) => createCalendarEvent(course, accessToken))
        );

        const successful = results.filter((r) => r.success).length;
        const failed = results.filter((r) => !r.success).length;

        if (failed > 0) {
            const errors = results
                .filter((r) => !r.success)
                .map((r) => r.error)
                .join(", ");
            console.error(`Failed to sync ${failed} courses:`, errors);
        }

        if (successful === 0 && skippedCount === 0) {
            return NextResponse.json({
                success: false,
                error: "Failed to create any events",
                successful: 0,
                failed,
                skipped: skippedCount,
                total: courses.length,
            });
        }

        // Step 2: Wait a moment for Google Calendar to process
        if (successful > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Step 3: Find and delete events on holidays
        console.log('Step 2: Checking for events on holidays...');
        const eventsOnHolidays = await getEventsOnHolidays(accessToken);

        let deletedCount = 0;
        if (eventsOnHolidays.length > 0) {
            console.log(`Found ${eventsOnHolidays.length} events on holidays. Deleting...`);

            const deleteResults = await Promise.all(
                eventsOnHolidays.map((event) => deleteEvent(event.id, accessToken))
            );

            deletedCount = deleteResults.filter(Boolean).length;
            console.log(`Deleted ${deletedCount} events that fell on holidays`);
        } else {
            console.log('No events found on holidays');
        }

        const messageParts = [];
        if (successful > 0) {
            messageParts.push(`Successfully synced ${successful} new course${successful !== 1 ? "s" : ""}`);
        }
        if (skippedCount > 0) {
            messageParts.push(`${skippedCount} already existed`);
        }
        if (failed > 0) {
            messageParts.push(`${failed} failed`);
        }
        if (deletedCount > 0) {
            messageParts.push(`Removed ${deletedCount} event(s) on holidays`);
        }

        return NextResponse.json({
            success: true,
            message: messageParts.join(". "),
            successful,
            failed,
            skipped: skippedCount,
            total: courses.length,
            deletedOnHolidays: deletedCount,
            holidays: HOLIDAYS_2025_2026.length,
        });
    } catch (error) {
        console.error("Error syncing calendar:", error);
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error ? error.message : "Failed to sync calendar",
            },
            { status: 500 }
        );
    }
}