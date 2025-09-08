import { google, calendar_v3 } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";

// Initialize Google Calendar API with OAuth2
const calendarOAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set the refresh token if you have one
if (process.env.GOOGLE_REFRESH_TOKEN) {
  calendarOAuth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
}

const calendar = google.calendar({
  version: "v3",
  auth: calendarOAuth2Client,
});

/**
 * Interface representing a Google Calendar event.
 * This includes all possible fields to ensure no data is lost.
 */
export interface GoogleEvent {
  summary: string;
  location?: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
    date?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
    date?: string;
  };
  recurrence?: string[];
  attendees?: { email: string; responseStatus?: string; comment?: string; optional?: boolean }[];
  reminders?: {
    useDefault: boolean;
    overrides?: { method: string; minutes: number }[];
  };
  colorId?: string;
  creator?: {
    id?: string;
    email?: string;
    displayName?: string;
    self?: boolean;
  };
  organizer?: {
    id?: string;
    email?: string;
    displayName?: string;
    self?: boolean;
  };
  transparency?: string;
  visibility?: string;
  iCalUID?: string;
  sequence?: number;
  extendedProperties?: {
    private?: Record<string, string>;
    shared?: Record<string, string>;
  };
  attachments?: Array<{
    fileUrl?: string;
    title?: string;
    mimeType?: string;
    iconLink?: string;
    fileId?: string;
  }>;
  conferenceData?: any;
  gadget?: any;
  anyoneCanAddSelf?: boolean;
  guestsCanInviteOthers?: boolean;
  guestsCanModify?: boolean;
  guestsCanSeeOtherGuests?: boolean;
  privateCopy?: boolean;
  locked?: boolean;
  source?: {
    url?: string;
    title?: string;
  };
  status?: string;
  [key: string]: any; // Allow for additional properties
}

/**
 * Retrieves events from a specified calendar within a time range.
 *
 * @param calId The calendar ID. Defaults to the ID from .env.
 * @param startTime The start time for the query (RFC3339 format).
 * @param endTime The end time for the query (RFC3339 format).
 * @param eventId Optional event ID to fetch a single event.
 * @returns A promise that resolves to the list of events or a single event if eventId is provided.
 */
async function getEvents(
  calId: string = process.env.GOOGLE_CALENDAR_ID!,
  startTime: string,
  endTime: string,
  eventId?: string
) {
  try {
    if (eventId) {
      // Fetch a single event if eventId is provided
      const response = await calendar.events.get({
        calendarId: calId,
        eventId: eventId,
        // Ensure we get all fields
        fields: "*"
      });
      return response.data;
    } else {
      // List events within the specified time range
      const response = await calendar.events.list({
        calendarId: calId,
        timeMin: startTime,
        timeMax: endTime,
        singleEvents: true,
        orderBy: "startTime",
        // Ensure we get all fields for each event
        fields: "items(*),nextPageToken,nextSyncToken"
      });
      return response.data.items;
    }
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    throw new Error(`Failed to fetch calendar events: ${(error as Error).message}`);
  }
}

/**
 * Adds a new event to a specified calendar.
 *
 * @param calId The calendar ID. Defaults to the ID from .env.
 * @param event The event object to be added.
 * @returns A promise that resolves to the created event.
 */
async function addEvent(
  calId: string = process.env.GOOGLE_CALENDAR_ID!,
  event: GoogleEvent
) {
  try {
    const response = await calendar.events.insert({
      calendarId: calId,
      requestBody: event as calendar_v3.Schema$Event,
      // Ensure we get all fields
      fields: "*"
    });
    return response.data;
  } catch (error) {
    console.error("Error adding calendar event:", error);
    throw new Error(`Failed to add calendar event: ${(error as Error).message}`);
  }
}

/**
 * Updates an existing calendar event.
 *
 * @param calId The calendar ID. Defaults to the ID from .env.
 * @param eventId The ID of the event to update.
 * @param event The updated event data.
 * @returns A promise that resolves to the updated event.
 */
async function updateEvent(
  calId: string = process.env.GOOGLE_CALENDAR_ID!,
  eventId: string,
  event: GoogleEvent
) {
  try {
    const response = await calendar.events.update({
      calendarId: calId,
      eventId: eventId,
      requestBody: event as calendar_v3.Schema$Event,
      // Ensure we get all fields
      fields: "*"
    });
    return response.data;
  } catch (error) {
    console.error("Error updating calendar event:", error);
    throw new Error(`Failed to update calendar event: ${(error as Error).message}`);
  }
}

/**
 * Deletes a calendar event.
 *
 * @param calId The calendar ID. Defaults to the ID from .env.
 * @param eventId The ID of the event to delete.
 * @returns A promise that resolves when the event is deleted.
 */
async function deleteEvent(
  calId: string = process.env.GOOGLE_CALENDAR_ID!,
  eventId: string
) {
  try {
    await calendar.events.delete({
      calendarId: calId,
      eventId: eventId,
    });
    return { success: true, message: `Event ${eventId} deleted successfully` };
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    throw new Error(`Failed to delete calendar event: ${(error as Error).message}`);
  }
}

// Export all calendar functions
export { getEvents, addEvent, updateEvent, deleteEvent };