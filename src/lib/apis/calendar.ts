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
 * Using this for type safety in our addEvents function.
 */
export interface GoogleEvent {
  summary: string;
  location?: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  recurrence?: string[];
  attendees?: { email: string }[];
  reminders?: {
    useDefault: boolean;
    overrides?: { method: string; minutes: number }[];
  };
}

/**
 * Retrieves events from a specified calendar within a time range.
 *
 * @param calId The calendar ID. Defaults to the ID from .env.
 * @param startTime The start time for the query (RFC3339 format).
 * @param endTime The end time for the query (RFC3339 format).
 * @param eventId Optional event ID to fetch a single event.
 * @returns A promise that resolves to the list of events.
 */
async function getEvents(
  startTime: string,
  endTime: string,
  calId?: string,
  eventId?: string
) {
  if (!calId) calId = process.env.GOOGLE_CALENDAR_ID!;
  try {
    if (eventId) {
      // Fetch a single event if eventId is provided
      const response = await calendar.events.get({
        calendarId: calId,
        eventId: eventId,
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
      });
      return response.data.items;
    }
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    throw new Error("Failed to fetch calendar events.");
  }
}

/**
 * Adds a new event to a specified calendar.
 *
 * @param calId The calendar ID. Defaults to the ID from .env.
 * @param event The event object to be added.
 * @returns A promise that resolves to the created event.
 */
async function addEvents(
  calId: string = process.env.GOOGLE_CALENDAR_ID!,
  event: GoogleEvent
) {
  try {
    const response = await calendar.events.insert({
      calendarId: calId,
      requestBody: event as calendar_v3.Schema$Event,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding calendar event:", error);
    throw new Error("Failed to add calendar event.");
  }
}

// Next.js API route handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // You can test the functions based on the request method
    if (req.method === "POST") {
      const { calId, event } = req.body;
      const newEvent = await addEvents(calId, event);
      res.status(201).json({ success: true, data: newEvent });
    } else if (req.method === "GET") {
      const { calId, startTime, endTime, eventId } = req.query;
      const events = await getEvents(
        calId as string,
        startTime as string,
        endTime as string,
        eventId as string
      );
      res.status(200).json({ success: true, data: events });
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}


export { getEvents, addEvents };