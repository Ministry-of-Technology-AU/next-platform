/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Event, Organization } from "../types/calendar";


export const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Tech Talk: AI in Web Development",
    date: "2024-01-15",
    time: "14:00",
    venue: "Auditorium A",
    organizingBody: "Computer Science Club",
    description:
      "Join us for an insightful discussion on how AI is transforming web development practices.",
    category: "clubs",
    organization: "computer-science-club",
  },
  {
    id: "2",
    title: "Cultural Night 2024",
    date: "2024-01-18",
    time: "18:00",
    venue: "Main Hall",
    organizingBody: "Cultural Society",
    description: "Experience diverse cultures through music, dance, and food.",
    category: "societies",
    organization: "cultural-society",
  },
  {
    id: "3",
    title: "Research Symposium",
    date: "2024-01-20",
    time: "09:00",
    venue: "Conference Room",
    organizingBody: "Engineering Department",
    description: "Annual research presentations by faculty and students.",
    category: "departments",
    organization: "engineering-department",
  },
  {
    id: "4",
    title: "Innovation Workshop",
    date: "2024-01-15",
    time: "16:00",
    venue: "Lab 101",
    organizingBody: "Ministry of Technology",
    description: "Hands-on workshop on emerging technologies and innovation.",
    category: "ministries",
    organization: "ministry-of-technology",
  },
  {
    id: "5",
    title: "Hackathon 2025",
    date: "2025-01-25",
    time: "09:00",
    venue: "Tech Hub",
    organizingBody: "Computer Science Club",
    description: "48-hour coding competition with amazing prizes.",
    category: "clubs",
    organization: "computer-science-club",
  },
  {
    id: "6",
    title: "Art Exhibition Opening",
    date: "2025-01-28",
    time: "17:00",
    venue: "Gallery Space",
    organizingBody: "Cultural Society",
    description: "Showcasing student artwork from various disciplines.",
    category: "societies",
    organization: "cultural-society",
  },
  {
    id: "7",
    title: "Career Fair",
    date: "2025-02-05",
    time: "10:00",
    venue: "Main Auditorium",
    organizingBody: "Engineering Department",
    description: "Meet with top employers and explore career opportunities.",
    category: "departments",
    organization: "engineering-department",
  },
  {
    id: "8",
    title: "Startup Pitch Competition",
    date: "2025-02-10",
    time: "14:00",
    venue: "Innovation Center",
    organizingBody: "Ministry of Technology",
    description:
      "Present your startup ideas to industry experts and investors.",
    category: "ministries",
    organization: "ministry-of-technology",
  },
  // July 27th, 2025 events
  {
    id: "9",
    title: "Morning Yoga Session",
    date: "2025-07-27",
    time: "07:00",
    venue: "Campus Garden",
    organizingBody: "Wellness Club",
    description: "Start your day with a refreshing yoga session in nature.",
    category: "clubs",
    organization: "wellness-club",
  },
  {
    id: "10",
    title: "Tech Innovation Summit",
    date: "2025-07-27",
    time: "10:00",
    venue: "Main Auditorium",
    organizingBody: "Ministry of Technology",
    description:
      "Annual summit featuring the latest in technology and innovation.",
    category: "ministries",
    organization: "ministry-of-technology",
  },
  {
    id: "11",
    title: "Summer Music Festival",
    date: "2025-07-27",
    time: "19:00",
    venue: "Outdoor Stage",
    organizingBody: "Cultural Society",
    description: "An evening of live music performances by student bands.",
    category: "societies",
    organization: "cultural-society",
  },
];

export const organizations: Organization[] = [
  {
    id: "computer-science-club",
    name: "Computer Science Club",
    category: "clubs",
  },
  { id: "robotics-club", name: "Robotics Club", category: "clubs" },
  { id: "wellness-club", name: "Wellness Club", category: "clubs" },
  { id: "cultural-society", name: "Cultural Society", category: "societies" },
  { id: "debate-society", name: "Debate Society", category: "societies" },
  {
    id: "engineering-department",
    name: "Engineering Department",
    category: "departments",
  },
  {
    id: "science-department",
    name: "Science Department",
    category: "departments",
  },
  {
    id: "ministry-of-technology",
    name: "Ministry of Technology",
    category: "ministries",
  },
  {
    id: "ministry-of-education",
    name: "Ministry of Education",
    category: "ministries",
  },
];

export const defaultColors = [
    "#c89188",
    "#9b4e43",
    "#87281b",
    "#60150a",
    "#3b0800",

    /* Secondaries */
    "#eef5db",
    "#ffe7a9",
    "#ffcd74",
    "#f4b448",
    "#d68e3a",

    /* Greens */
    "#8fd8ca",
    "#70c49c",
    "#519872",
    "#2b6948",
    "#1b3022",

    /* Blues */
    "#a1cdf1",
    "#5197d6",
    "#0267c1",
    "#154a7b",
    "#1c3144",

    /* Neutrals */
    "#bfbcba",
    "#767371",
    "#57504c",
];



// This function is a backend utility to fetch events from a specific Google Calendar.

// It is designed to be called from a Next.js Server Component or API Route.

export async function getCalendarEvents() {

// 1. Retrieve API key and calendar ID from environment variables.

const { apiKey, calendarId } = getCredentials();



// 2. Define the Google Calendar API endpoint and parameters.

const now = new Date();

const thirtyDaysLater = new Date();

thirtyDaysLater.setDate(now.getDate() + 30);



const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${now.toISOString()}&timeMax=${thirtyDaysLater.toISOString()}&singleEvents=true&orderBy=startTime`;



try {

// 3. Make the API request to Google Calendar.

const response = await fetch(url, {

method: 'GET',

headers: {

'Content-Type': 'application/json',

},

cache: 'no-store'

});



// 4. Handle non-successful responses.

if (!response.ok) {

console.error(`Error fetching calendar events: ${response.status} ${response.statusText}`);

return { events: [], error: 'Failed to fetch calendar events from Google API.' };

}



// 5. Parse the JSON response and map it to your custom Event type.

const data = await response.json();

const mappedEvents: Event[] = data.items.map(mapToCustomEvent);



return { events: mappedEvents, error: null };



} catch (error) {

// 6. Handle network or other unexpected errors.

console.error('An unexpected error occurred while fetching calendar events:', error);

return { events: [], error: 'An unexpected error occurred.' };

}

}



/**

* Maps a raw Google Calendar API event object to your custom Event interface.

* Note: This assumes a few mappings. You might need to adjust based on your specific data.

* The `category` field is not available from the API and is set to a default value.

*/

function mapToCustomEvent(googleEvent: any): Event {

const startDate = new Date(googleEvent.start?.dateTime || googleEvent.start?.date);

const endDate = new Date(googleEvent.end?.dateTime || googleEvent.end?.date);



// Assuming that the organizingBody and organization can be derived from the organizer.

const organizerName = googleEvent.organizer?.displayName || googleEvent.organizer?.email || "Unknown";



// For the `category` field, since it's not a standard Google Calendar field,

// we'll use a placeholder. You'd likely implement logic here to

// determine the category based on other event properties (e.g., event title, tags, etc.)

// or by cross-referencing a separate data source.

const category: Event['category'] = 'others';



return {

id: googleEvent.id,

title: googleEvent.summary || 'No Title',

date: startDate.toISOString().split('T')[0], // YYYY-MM-DD

time: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

venue: googleEvent.location || 'Online / TBD',

organizingBody: organizerName,

description: googleEvent.description || 'No description provided.',

category: category,

organization: organizerName,

};

}





/**

* Helper function to retrieve and validate environment variables.

* Throws an error if any required variable is missing to fail early.

*/

function getCredentials() {

const apiKey = process.env.GOOGLE_API_TOKEN_READONLY;

const calendarId = process.env.GOOGLE_CALENDAR_ID;



if (!apiKey || !calendarId) {

throw new Error(

"Missing GOOGLE_CALENDAR_API_KEY or GOOGLE_CALENDAR_ID in environment variables."

);

}



return { apiKey, calendarId };

}