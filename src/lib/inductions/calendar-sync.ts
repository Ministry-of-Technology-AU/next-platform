import { strapiGet, strapiPut } from '@/lib/apis/strapi';
import { addEvent, getEvents, updateEvent, type GoogleEvent } from '@/lib/apis/calendar';
import { getDerivedCycleStatus, type CycleStatus } from '@/app/organisations/inductions/types';
import { normalizeEndDateToEndOfDay } from '@/lib/date-utils';
import { htmlToPlainText } from '@/lib/utils';

/**
 * Synchronizes an organisation's active induction cycle with Google Calendar.
 * - Creates an all-day event on the induction deadline if none exists.
 * - Updates the event summary, description (with open roles & form links), and deadline if existing.
 * - Syncs tracking attendees and saves `calendar_event_id` back to the organisation in Strapi.
 */
export async function syncOrganisationInductionCalendarEvent(organisationId: string | number): Promise<{
  synced: boolean;
  action?: 'created' | 'updated' | 'none';
  eventId?: string | null;
  reason?: string;
}> {
  try {
    const orgId = String(organisationId);

    // Fetch organisation with populated induction_cycles, roles, pipeline_rounds, and form
    const orgResponse = await strapiGet(`/organisations/${orgId}`, {
      populate: {
        induction_cycles: {
          populate: {
            roles: {
              populate: {
                pipeline_rounds: {
                  populate: {
                    form: {
                      fields: ['id', 'form_uid', 'title', 'form_status'],
                    },
                  },
                },
              },
            },
          },
        },
      },
      fields: ['id', 'name', 'induction', 'induction_end', 'induction_description', 'calendar_event_id'],
    });

    const orgData = orgResponse?.data?.attributes || orgResponse?.data || orgResponse?.attributes || orgResponse;
    if (!orgData) {
      return { synced: false, reason: 'Organisation not found' };
    }

    const orgName = orgData.name || 'Unknown Organisation';
    let calendarEventId = orgData.calendar_event_id || null;

    // Determine active/upcoming cycles
    const cyclesData = orgData.induction_cycles?.data || orgData.induction_cycles || [];
    const activeCycles = cyclesData.filter((c: any) => {
      const ca = c.attributes || c || {};
      const rawStatus = (ca.status as CycleStatus) || 'draft';
      const derived = getDerivedCycleStatus(rawStatus, ca.start_date, ca.end_date);
      return derived === 'active';
    });

    // Also check upcoming cycles (draft with future start_date/end_date)
    const upcomingCycles = cyclesData.filter((c: any) => {
      const ca = c.attributes || c || {};
      const rawStatus = (ca.status as CycleStatus) || 'draft';
      const derived = getDerivedCycleStatus(rawStatus, ca.start_date, ca.end_date);
      return (
        derived === 'draft' &&
        ca.end_date &&
        new Date(normalizeEndDateToEndOfDay(ca.end_date) || ca.end_date).getTime() >= Date.now()
      );
    });

    const relevantCycles = activeCycles.length > 0 ? activeCycles : upcomingCycles;

    // Check if legacy induction is open
    const isLegacyOpen =
      orgData.induction === true &&
      (!orgData.induction_end ||
        new Date(normalizeEndDateToEndOfDay(orgData.induction_end) || orgData.induction_end).getTime() >= Date.now());

    if (relevantCycles.length === 0 && !isLegacyOpen) {
      return { synced: false, reason: 'No active or upcoming induction cycles found' };
    }

    // Sort relevant cycles to find the one closing soonest
    const sortedCycles = [...relevantCycles].sort((a: any, b: any) => {
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

    const primaryCycle = sortedCycles[0] ? sortedCycles[0].attributes || sortedCycles[0] : null;
    const stats = primaryCycle?.stats || {};
    const ext = primaryCycle?.deadline_extension ?? stats?.deadlineExtension ?? null;
    const effectiveDeadline = ext?.newDeadline || primaryCycle?.end_date || orgData.induction_end || null;
    const primaryCycleName = primaryCycle?.name || null;
    const primaryCycleDesc = primaryCycle?.description || orgData.induction_description || '';

    if (!effectiveDeadline) {
      return { synced: false, reason: 'No deadline specified for induction' };
    }

    // Extract roles and application links across cycles
    const rolesList: { title: string; department?: string; formUrl?: string }[] = [];
    for (const c of sortedCycles.length > 0 ? sortedCycles : cyclesData) {
      const ca = c.attributes || c || {};
      const rolesData = ca.roles?.data || ca.roles || [];
      for (const r of rolesData) {
        const ra = r.attributes || r || {};
        const rounds = ra.pipeline_rounds?.data || ra.pipeline_rounds || [];
        const formRound = rounds.find((rnd: any) => (rnd.attributes || rnd || {}).type === 'form');
        const formObj = formRound?.attributes?.form?.data || formRound?.form?.data || formRound?.form;
        const formAttrs = formObj?.attributes || formObj || {};
        const formUid = formAttrs?.form_uid || formObj?.form_uid;
        rolesList.push({
          title: ra.name || 'Role Candidate',
          department: ra.department || undefined,
          formUrl: formUid ? `/platform/forms/${formUid}` : undefined,
        });
      }
    }

    // Fetch tracking users to include as attendees
    let trackingAttendees: { email: string }[] = [];
    try {
      const usersResponse = await strapiGet('users', {
        filters: {
          track_deadline_fors: {
            id: {
              $eq: orgId,
            },
          },
        },
        fields: ['id', 'email'],
      });
      const usersList = Array.isArray(usersResponse) ? usersResponse : usersResponse?.data || [];
      trackingAttendees = usersList
        .map((u: any) => (u.attributes ? u.attributes.email : u.email))
        .filter(Boolean)
        .map((email: string) => ({ email }));
    } catch {
      // Fallback if users filter is restricted
    }

    const endIso = normalizeEndDateToEndOfDay(effectiveDeadline);
    const deadlineDate = endIso ? new Date(endIso) : new Date(effectiveDeadline);
    const dateStr = deadlineDate.toISOString().split('T')[0]; // YYYY-MM-DD

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ashoka-sg.com';
    const eventSummary = primaryCycleName
      ? `${orgName} (${primaryCycleName}) — Induction Deadline`
      : `${orgName} — Induction Deadline`;

    let eventDescription = `Induction deadline for ${orgName}${primaryCycleName ? ` (${primaryCycleName})` : ''}.\n`;
    if (primaryCycleDesc) {
      eventDescription += `\nOverview: ${htmlToPlainText(primaryCycleDesc)}\n`;
    }
    if (rolesList.length > 0) {
      eventDescription +=
        `\nOpen Positions (${rolesList.length}):\n` +
        rolesList
          .map(
            (r) =>
              `• ${r.title}${r.department ? ` [${r.department}]` : ''}${r.formUrl ? ` - Apply: ${baseUrl}${r.formUrl}` : ''}`
          )
          .join('\n') +
        '\n';
    }
    eventDescription += `\nTracked via Ashoka Student Government Platform: ${baseUrl}/platform/inductions`;

    const calId = process.env.INDUCTIONS_CALENDAR_ID || undefined;

    if (!calendarEventId) {
      // Create a brand new Google Calendar event
      const createdEvent = await addEvent(calId, {
        summary: eventSummary,
        description: eventDescription,
        start: { date: dateStr },
        end: { date: dateStr },
        attendees: trackingAttendees,
        guestsCanSeeOtherGuests: false,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 2880 }, // 48 hours before
            { method: 'popup', minutes: 1440 }, // 24 hours before
          ],
        },
      });

      calendarEventId = createdEvent?.id || null;
      if (calendarEventId) {
        await strapiPut(`/organisations/${orgId}`, {
          data: { calendar_event_id: calendarEventId },
        });
      }
      return { synced: true, action: 'created', eventId: calendarEventId };
    } else {
      // Update existing Google Calendar event
      try {
        const existingEvent = await getEvents(calId, '', '', calendarEventId);
        if (existingEvent) {
          const existingAttendees: { email: string }[] = (existingEvent as any).attendees || [];
          const attendeeEmails = new Set(existingAttendees.map((a: any) => a.email));
          for (const ta of trackingAttendees) {
            if (!attendeeEmails.has(ta.email)) {
              existingAttendees.push(ta);
              attendeeEmails.add(ta.email);
            }
          }

          await updateEvent(calId, calendarEventId, {
            ...(existingEvent as GoogleEvent),
            summary: eventSummary,
            description: eventDescription,
            start: { date: dateStr },
            end: { date: dateStr },
            attendees: existingAttendees,
            guestsCanSeeOtherGuests: false,
          });
          return { synced: true, action: 'updated', eventId: calendarEventId };
        } else {
          // Event not found in Google Calendar, recreate it
          const createdEvent = await addEvent(calId, {
            summary: eventSummary,
            description: eventDescription,
            start: { date: dateStr },
            end: { date: dateStr },
            attendees: trackingAttendees,
            guestsCanSeeOtherGuests: false,
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'popup', minutes: 2880 },
                { method: 'popup', minutes: 1440 },
              ],
            },
          });
          calendarEventId = createdEvent?.id || null;
          if (calendarEventId) {
            await strapiPut(`/organisations/${orgId}`, {
              data: { calendar_event_id: calendarEventId },
            });
          }
          return { synced: true, action: 'created', eventId: calendarEventId };
        }
      } catch (err) {
        console.error(`Error updating event ${calendarEventId}:`, err);
        return { synced: false, reason: 'Failed to update Google Calendar event' };
      }
    }
  } catch (error) {
    console.error(`Error syncing calendar event for organisation ${organisationId}:`, error);
    return { synced: false, reason: error instanceof Error ? error.message : 'Unknown error' };
  }
}
