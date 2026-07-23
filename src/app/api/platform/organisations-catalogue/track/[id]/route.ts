import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { strapiGet, strapiPut } from '@/lib/apis/strapi';
import { getUserIdByEmail } from '@/lib/userid';
import { addEvent, getEvents, updateEvent } from '@/lib/apis/calendar';
import type { GoogleEvent } from '@/lib/apis/calendar';

/**
 * POST /api/platform/organisations-catalogue/track/[id]
 * Track an organisation's inductions.
 * - Adds to user's track_deadline_fors relation
 * - Adds to user's orgs_checklist JSON
 * - Creates/updates Google Calendar event
 */
export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await context.params;

  if (!orgId) {
    return NextResponse.json(
      { success: false, error: 'Organisation ID is required' },
      { status: 400 }
    );
  }

  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;
    const userId = await getUserIdByEmail(userEmail);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch the organisation from Strapi
    const orgResponse = await strapiGet(`/organisations/${orgId}`, {
      fields: ['id', 'name', 'induction', 'induction_end', 'calendar_event_id'],
    });

    const orgData = orgResponse?.data?.attributes || orgResponse?.data || orgResponse?.attributes || orgResponse;
    const orgName = orgData?.name || 'Unknown Organisation';
    const inductionEnd = orgData?.induction_end || null;
    let calendarEventId = orgData?.calendar_event_id || null;

    // 1. Update user's track_deadline_fors relation (connect the org)
    // For Strapi v4 users-permissions, we update via PUT /users/:id
    // We need to fetch existing relations first to avoid overwriting
    const currentUserData = await strapiGet(`/users/${userId}`, {
      populate: {
        track_deadline_fors: { fields: ['id'] },
      },
      fields: ['id', 'orgs_checklist'],
    });

    const existingTracked: number[] = (currentUserData?.track_deadline_fors || [])
      .map((org: any) => org.id || org);

    // Add if not already tracking
    const numericOrgId = parseInt(orgId, 10);
    if (!existingTracked.includes(numericOrgId)) {
      existingTracked.push(numericOrgId);
    }

    // 2. Update user's orgs_checklist JSON
    let checklist: any[] = [];
    if (currentUserData?.orgs_checklist) {
      if (Array.isArray(currentUserData.orgs_checklist)) {
        checklist = [...currentUserData.orgs_checklist];
      } else if (typeof currentUserData.orgs_checklist === 'string') {
        try { checklist = JSON.parse(currentUserData.orgs_checklist); } catch { checklist = []; }
      }
    }

    // Avoid duplicate entries
    const alreadyInChecklist = checklist.some(
      (item: any) => item.name === orgName
    );
    if (!alreadyInChecklist) {
      checklist.push({
        name: orgName,
        deadline: inductionEnd || '',
        isDone: false,
      });
    }

    // Save both relation and checklist to Strapi
    await strapiPut(`/users/${userId}`, {
      track_deadline_fors: existingTracked,
      orgs_checklist: checklist,
    });

    // 3. Google Calendar integration
    let calendarResult = null;
    try {
      if (inductionEnd) {
        if (!calendarEventId) {
          // Create a new all-day event on the induction deadline
          const deadlineDate = new Date(inductionEnd);
          const dateStr = deadlineDate.toISOString().split('T')[0]; // YYYY-MM-DD

          const event: GoogleEvent = {
            summary: `${orgName} — Induction Deadline`,
            description: `Induction deadline for ${orgName}. You are tracking this organisation's inductions.`,
            start: {
              date: dateStr,
            },
            end: {
              date: dateStr,
            },
            attendees: [
              { email: userEmail },
            ],
            guestsCanSeeOtherGuests: false,
            reminders: {
              useDefault: false,
              overrides: [
                // { method: 'email', minutes: 2880 }, // 48 hours before (email)
                { method: 'popup', minutes: 2880 }, // 48 hours before (popup)
                // { method: 'email', minutes: 1440 }, // 24 hours before (email)
                { method: 'popup', minutes: 1440 }, // 24 hours before (popup)
              ],
            },
          };

          const createdEvent = await addEvent(process.env.INDUCTIONS_CALENDAR_ID || undefined, event);
          calendarEventId = createdEvent?.id || null;

          // Save calendar_event_id back to the organisation in Strapi
          if (calendarEventId) {
            await strapiPut(`/organisations/${orgId}`, {
              data: {
                calendar_event_id: calendarEventId,
              },
            });
          }

          calendarResult = { action: 'created', eventId: calendarEventId };
        } else {
          // Event already exists — add this user as an attendee
          try {
            const existingEvent = await getEvents(
              process.env.INDUCTIONS_CALENDAR_ID || undefined,
              '', // unused when eventId is provided
              '', // unused when eventId is provided
              calendarEventId
            );

            if (existingEvent) {
              const existingAttendees = (existingEvent as any).attendees || [];
              const alreadyAttendee = existingAttendees.some(
                (a: any) => a.email === userEmail
              );

              if (!alreadyAttendee) {
                existingAttendees.push({ email: userEmail });

                await updateEvent(process.env.INDUCTIONS_CALENDAR_ID || undefined, calendarEventId, {
                  ...(existingEvent as GoogleEvent),
                  attendees: existingAttendees,
                  guestsCanSeeOtherGuests: false,
                });
              }

              calendarResult = { action: 'attendee_added', eventId: calendarEventId };
            }
          } catch (calError) {
            console.error('Error updating calendar event attendees:', calError);
            calendarResult = { action: 'error', error: 'Failed to update calendar event' };
          }
        }
      }
    } catch (calError) {
      console.error('Error with Google Calendar integration:', calError);
      calendarResult = { action: 'error', error: 'Calendar integration failed' };
      // Don't fail the whole request — tracking still succeeded
    }

    return NextResponse.json({
      success: true,
      tracked: true,
      calendar: calendarResult,
    });
  } catch (error) {
    console.error('Error tracking organisation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track organisation',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/platform/organisations-catalogue/track/[id]
 * Untrack an organisation's inductions.
 * - Removes from user's track_deadline_fors relation
 * - Removes from user's orgs_checklist JSON
 * - Removes user from Google Calendar event attendees
 */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await context.params;

  if (!orgId) {
    return NextResponse.json(
      { success: false, error: 'Organisation ID is required' },
      { status: 400 }
    );
  }

  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;
    const userId = await getUserIdByEmail(userEmail);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch the organisation for calendar event ID and name
    const orgResponse = await strapiGet(`/organisations/${orgId}`, {
      fields: ['id', 'name', 'calendar_event_id'],
    });
    const orgData = orgResponse?.data?.attributes || orgResponse?.data || orgResponse?.attributes || orgResponse;
    const orgName = orgData?.name || 'Unknown Organisation';
    const calendarEventId = orgData?.calendar_event_id || null;

    // Fetch current user data
    const currentUserData = await strapiGet(`/users/${userId}`, {
      populate: {
        track_deadline_fors: { fields: ['id'] },
      },
      fields: ['id', 'orgs_checklist'],
    });

    // 1. Remove from track_deadline_fors relation
    const numericOrgId = parseInt(orgId, 10);
    const updatedTracked: number[] = (currentUserData?.track_deadline_fors || [])
      .map((org: any) => org.id || org)
      .filter((id: number) => id !== numericOrgId);

    // 2. Remove from orgs_checklist JSON
    let checklist: any[] = [];
    if (currentUserData?.orgs_checklist) {
      if (Array.isArray(currentUserData.orgs_checklist)) {
        checklist = [...currentUserData.orgs_checklist];
      } else if (typeof currentUserData.orgs_checklist === 'string') {
        try { checklist = JSON.parse(currentUserData.orgs_checklist); } catch { checklist = []; }
      }
    }
    checklist = checklist.filter((item: any) => item.name !== orgName);

    // Save updated data to Strapi
    await strapiPut(`/users/${userId}`, {
      track_deadline_fors: updatedTracked,
      orgs_checklist: checklist,
    });

    // 3. Remove from Google Calendar event attendees
    let calendarResult = null;
    try {
      if (calendarEventId) {
        const existingEvent = await getEvents(
          process.env.INDUCTIONS_CALENDAR_ID || undefined,
          '',
          '',
          calendarEventId
        );

        if (existingEvent) {
          const existingAttendees = ((existingEvent as any).attendees || [])
            .filter((a: any) => a.email !== userEmail);

          await updateEvent(process.env.INDUCTIONS_CALENDAR_ID || undefined, calendarEventId, {
            ...(existingEvent as GoogleEvent),
            attendees: existingAttendees,
            guestsCanSeeOtherGuests: false,
          });

          calendarResult = { action: 'attendee_removed', eventId: calendarEventId };
        }
      }
    } catch (calError) {
      console.error('Error removing from calendar event:', calError);
      calendarResult = { action: 'error', error: 'Failed to update calendar event' };
    }

    return NextResponse.json({
      success: true,
      tracked: false,
      calendar: calendarResult,
    });
  } catch (error) {
    console.error('Error untracking organisation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to untrack organisation',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/platform/organisations-catalogue/track/[id]
 * Check if the current user is tracking a specific organisation.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: orgId } = await context.params;

  if (!orgId) {
    return NextResponse.json(
      { success: false, error: 'Organisation ID is required' },
      { status: 400 }
    );
  }

  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = await getUserIdByEmail(session.user.email);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = await strapiGet(`/users/${userId}`, {
      populate: {
        track_deadline_fors: { fields: ['id'] },
      },
    });

    const numericOrgId = parseInt(orgId, 10);
    const isTracking = (userData?.track_deadline_fors || [])
      .some((org: any) => (org.id || org) === numericOrgId);

    return NextResponse.json({
      success: true,
      isTracking,
    });
  } catch (error) {
    console.error('Error checking tracking status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check tracking status' },
      { status: 500 }
    );
  }
}