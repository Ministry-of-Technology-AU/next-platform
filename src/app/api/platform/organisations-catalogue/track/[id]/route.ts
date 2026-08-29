import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { strapiGet, strapiPut } from '@/lib/apis/strapi';
import { getUserIdByEmail } from '@/lib/userid';
import { addEvent, getEvents, updateEvent } from '@/lib/apis/calendar';
import type { GoogleEvent } from '@/lib/apis/calendar';
import { getDerivedCycleStatus, type CycleStatus } from '@/app/organisations/inductions/types';
import { normalizeEndDateToEndOfDay } from '@/lib/date-utils';
import { htmlToPlainText } from '@/lib/utils';

/**
 * POST /api/platform/organisations-catalogue/track/[id]
 * Track an organisation's inductions.
 * - Adds to user's track_deadline_fors relation
 * - Adds to user's orgs_checklist JSON with accurate active cycle deadline
 * - Creates/updates Google Calendar event with role details and application links
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

    // Fetch the organisation from Strapi with its induction_cycles, roles, and forms
    const orgResponse = await strapiGet(`/organisations/${orgId}`, {
      populate: {
        induction_cycles: {
          populate: {
            roles: {
              populate: {
                pipeline_rounds: {
                  populate: {
                    form: {
                      fields: ['id', 'form_uid', 'title', 'form_status']
                    }
                  }
                }
              }
            }
          }
        }
      },
      fields: ['id', 'name', 'induction', 'induction_end', 'induction_description', 'calendar_event_id'],
    });

    const orgData = orgResponse?.data?.attributes || orgResponse?.data || orgResponse?.attributes || orgResponse;
    const orgName = orgData?.name || 'Unknown Organisation';
    let calendarEventId = orgData?.calendar_event_id || null;

    // Determine active cycles and effective deadline
    const cyclesData = orgData?.induction_cycles?.data || orgData?.induction_cycles || [];
    const activeCycles = cyclesData.filter((c: any) => {
      const ca = c.attributes || c || {};
      const rawStatus = (ca.status as CycleStatus) || 'draft';
      return getDerivedCycleStatus(rawStatus, ca.start_date, ca.end_date) === 'active';
    });

    // Sort active cycles to find the one closing soonest
    const sortedCycles = [...activeCycles].sort((a: any, b: any) => {
      const ca = a.attributes || a || {};
      const cb = b.attributes || b || {};
      const aIso = ca.end_date ? normalizeEndDateToEndOfDay(ca.end_date) : null;
      const bIso = cb.end_date ? normalizeEndDateToEndOfDay(cb.end_date) : null;
      const at = aIso ? new Date(aIso).getTime() : NaN;
      const bt = bIso ? new Date(bIso).getTime() : NaN;
      if (isNaN(at) && isNaN(bt)) return 0;
      if (isNaN(at)) return 1;
      if (isNaN(bt)) return -1;
      return at - bt;
    });

    const primaryCycle = sortedCycles[0] ? (sortedCycles[0].attributes || sortedCycles[0]) : null;
    const stats = primaryCycle?.stats || {};
    const ext = primaryCycle?.deadline_extension ?? stats?.deadlineExtension ?? null;
    const effectiveDeadline = ext?.newDeadline || primaryCycle?.end_date || orgData?.induction_end || null;
    const primaryCycleName = primaryCycle?.name || null;
    const primaryCycleDesc = primaryCycle?.description || orgData?.induction_description || '';

    const hasActiveCycle = activeCycles.length > 0;
    const isLegacyOpen =
      orgData?.induction === true &&
      (!orgData?.induction_end ||
        new Date(normalizeEndDateToEndOfDay(orgData?.induction_end) || orgData?.induction_end).getTime() >= Date.now());

    // Extract roles and application links ONLY from active cycles
    const rolesList: { title: string; department?: string; formUrl?: string }[] = [];
    for (const c of sortedCycles) {
      const ca = c.attributes || c || {};
      const rolesData = ca.roles?.data || ca.roles || [];
      for (const r of rolesData) {
        const ra = r.attributes || r || {};
        const rounds = ra.pipeline_rounds?.data || ra.pipeline_rounds || [];
        const formRound = rounds.find((rnd: any) => (rnd.attributes || rnd || {}).type === 'form');
        const formObj = formRound?.attributes?.form?.data || formRound?.form?.data || formRound?.form;
        const formAttrs = formObj?.attributes || formObj || {};
        const isFormUsable = formAttrs?.form_status !== 'inactive';
        const formUid = formAttrs?.form_uid || formObj?.form_uid;
        rolesList.push({
          title: ra.name || 'Role Candidate',
          department: ra.department || undefined,
          formUrl: isFormUsable && formUid ? `/platform/forms/${formUid}` : undefined,
        });
      }
    }

    // 1. Update user's track_deadline_fors relation (connect the org)
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

    // Avoid duplicate entries / update existing entry with latest deadline
    const checklistItem = {
      name: orgName,
      deadline: effectiveDeadline || '',
      isDone: false,
    };
    const existingChecklistIdx = checklist.findIndex(
      (item: any) => item.name === orgName
    );
    if (existingChecklistIdx >= 0) {
      checklist[existingChecklistIdx] = checklistItem;
    } else {
      checklist.push(checklistItem);
    }

    // Save both relation and checklist to Strapi
    await strapiPut(`/users/${userId}`, {
      track_deadline_fors: existingTracked,
      orgs_checklist: checklist,
    });

    // 3. Google Calendar integration: ONLY publish if the induction cycle is genuinely active
    if (!hasActiveCycle && !isLegacyOpen) {
      return NextResponse.json({
        success: true,
        tracked: true,
        calendar: {
          action: 'skipped',
          reason: 'Induction cycle is not active yet; event will be published when cycle becomes active',
        },
      });
    }

    let calendarResult = null;
    try {
      if (effectiveDeadline) {
        const endIso = normalizeEndDateToEndOfDay(effectiveDeadline);
        const deadlineDate = endIso ? new Date(endIso) : new Date(effectiveDeadline);
        const dateStr = deadlineDate.toISOString().split('T')[0]; // YYYY-MM-DD

        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          (process.env.NEXT_PUBLIC_BASE_URL && !process.env.NEXT_PUBLIC_BASE_URL.includes('localhost')
            ? process.env.NEXT_PUBLIC_BASE_URL
            : 'https://sg.ashoka.edu.in');
        const eventSummary = primaryCycleName
          ? `${orgName} (${primaryCycleName}) — Induction Deadline`
          : `${orgName} — Induction Deadline`;

        let eventDescription = `Induction deadline for ${orgName}${primaryCycleName ? ` (${primaryCycleName})` : ''}.\nYou are tracking this organisation's inductions.\n`;
        if (primaryCycleDesc) {
          eventDescription += `\nOverview: ${htmlToPlainText(primaryCycleDesc)}\n`;
        }
        if (rolesList.length > 0) {
          eventDescription += `\nOpen Positions (${rolesList.length}):\n` +
            rolesList.map(r => `• ${r.title}${r.department ? ` [${r.department}]` : ''}${r.formUrl ? ` - Apply: ${baseUrl}${r.formUrl}` : ''}`).join('\n') + '\n';
        }
        eventDescription += `\nTracked via Ashoka Student Government Platform: ${baseUrl}/platform/inductions`;

        const eventPayload: GoogleEvent = {
          summary: eventSummary,
          description: eventDescription,
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
              { method: 'popup', minutes: 2880 }, // 48 hours before (popup)
              { method: 'popup', minutes: 1440 }, // 24 hours before (popup)
            ],
          },
        };

        if (!calendarEventId) {
          const createdEvent = await addEvent(process.env.INDUCTIONS_CALENDAR_ID || undefined, eventPayload, 'none');
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
          // Event already exists — add this user as an attendee and update details
          try {
            const existingEvent = await getEvents(
              process.env.INDUCTIONS_CALENDAR_ID || undefined,
              '',
              '',
              calendarEventId
            );

            if (existingEvent) {
              const existingAttendees = (existingEvent as any).attendees || [];
              const alreadyAttendee = existingAttendees.some(
                (a: any) => a.email === userEmail
              );

              if (!alreadyAttendee) {
                existingAttendees.push({ email: userEmail });
              }

              await updateEvent(
                process.env.INDUCTIONS_CALENDAR_ID || undefined,
                calendarEventId,
                {
                  ...(existingEvent as GoogleEvent),
                  summary: eventSummary,
                  description: eventDescription,
                  start: { date: dateStr },
                  end: { date: dateStr },
                  attendees: existingAttendees,
                  guestsCanSeeOtherGuests: false,
                },
                'none'
              );

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