import EventsCalendar from "./events-calendar";
import { Suspense } from "react";
import { Event, Organization } from "./types/calendar";
import { cookies } from "next/headers";
import DeveloperCredits from "@/components/developer-credits";

export default async function Page() {
  const cookieStore = await cookies();

  async function fetchEvents() {
    try {
      // Calculate date range for current month and next month
      const now = new Date();

      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const startTime = now.toISOString();
      const endTime = nextMonth.toISOString();
      const base_url = process.env.BASE_URL || 'http://localhost:3000';

      // Construct the API URL
      const apiUrl = `${base_url}/api/platform/events?startTime=${startTime}&endTime=${endTime}`;

      // Make the fetch request
      const response = await fetch(apiUrl, {
        cache: 'no-store',
        next: { revalidate: 0 }, // Ensure fresh data on each request
        headers: { 'Cookie': cookieStore.toString() },
      });

      if (!response.ok) {
        console.error('Failed to fetch events:', response.status, response.statusText);
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const data = await response.json();

      // Map Google Calendar events to our application's Event format
      const mappedEvents = mapGoogleEventsToAppEvents(data.data || []);

      return mappedEvents;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      // For debugging - fall back to sample data
      console.log('Falling back to sample data');
      // Import sample data for fallback
      const { sampleEvents } = await import('./data/calendar-data');
      return sampleEvents;
    }
  }

  /**
   * Fetches the user's event preferences from the API
   */
  async function fetchPreferences() {
    try {
      const base_url = process.env.BASE_URL || 'http://localhost:3000';
      const apiUrl = `${base_url}/api/platform/events/preferences`;

      const response = await fetch(apiUrl, {
        cache: 'no-store',
        next: { revalidate: 0 },
        headers: { 'Cookie': cookieStore.toString() },
      });

      if (!response.ok) {
        console.error('Failed to fetch preferences:', response.status, response.statusText);
        throw new Error(`Failed to fetch preferences: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      // Return default preferences on error
      return null;
    }
  }

  /**
   * Fetches organizations from the API
   */
  async function fetchOrganizations(): Promise<Organization[]> {
    try {
      const base_url = process.env.BASE_URL || 'http://localhost:3000';
      const apiUrl = `${base_url}/api/organisations`;

      const response = await fetch(apiUrl, {
        cache: 'no-store',
        next: { revalidate: 0 },
        headers: { 'Cookie': cookieStore.toString() },
      });

      if (!response.ok) {
        console.error('Failed to fetch organizations:', response.status, response.statusText);
        throw new Error(`Failed to fetch organizations: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        // Map the Strapi data to our application's Organization format
        return data.data.map((org: any) => ({
          id: org.id.toString(),
          name: org.attributes.name,
          // Map type to category (type is "club", "society", etc.)
          category: mapCategoryFromStrapi(org.attributes.type),
        }));
      }

      throw new Error('Invalid organization data format');
    } catch (error) {
      console.error('Error fetching organizations:', error);
      // Fallback to default organizations
      const { organizations } = await import('./data/calendar-data');
      return organizations;
    }
  }

  // Helper function to map Strapi category values to our application's categories
  function mapCategoryFromStrapi(type: string): "clubs" | "societies" | "departments" | "ministries" | "others" {
    const categoryMap: Record<string, "clubs" | "societies" | "departments" | "ministries" | "others"> = {
      'club': 'clubs',
      'society': 'societies',
      'department': 'departments',
      'ministry': 'ministries'
    };

    return categoryMap[type?.toLowerCase()] || 'others';
  }

  /**
   * Maps Google Calendar events to the application's Event format
   * This function doesn't rely on the organizations data yet
   */
  function mapGoogleEventsToAppEvents(googleEvents: any[]): Event[] {
    if (!Array.isArray(googleEvents) || googleEvents.length === 0) {
      console.log('No Google events to map or invalid format');
      return [];
    }

    return googleEvents.map(event => {
      // Format date and time from start.dateTime
      const startDate = event.start?.dateTime
        ? new Date(event.start.dateTime)
        : event.start?.date
          ? new Date(event.start.date)
          : new Date();

      const formattedDate = startDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
      });

      const formattedTime = startDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
      });

      // Extract organizing body and category using the extendedProperties
      let organizingBody = 'Unknown';
      let category = 'others';

      // Check for the organizing body in extendedProperties first (this comes from your custom upload format)
      if (event.extendedProperties) {
        const orgBody = event.extendedProperties.shared?.orgBody || event.extendedProperties.private?.orgBody;

        if (orgBody) {
          organizingBody = orgBody;

          // Determine category based on the organizing body name
          if (orgBody.toLowerCase().includes('club')) {
            category = 'clubs';
          } else if (orgBody.toLowerCase().includes('society')) {
            category = 'societies';
          } else if (orgBody.toLowerCase().includes('department')) {
            category = 'departments';
          } else if (orgBody.toLowerCase().includes('ministry')) {
            category = 'ministries';
          }
        }
      }
      // Fallback to description parsing if extendedProperties don't have the info
      else if (event.description) {
        if (event.description.includes('Club:')) {
          category = 'clubs';
          const match = event.description.match(/Club:\s*([^\n]+)/);
          if (match) organizingBody = match[1].trim();
        } else if (event.description.includes('Society:')) {
          category = 'societies';
          const match = event.description.match(/Society:\s*([^\n]+)/);
          if (match) organizingBody = match[1].trim();
        } else if (event.description.includes('Department:')) {
          category = 'departments';
          const match = event.description.match(/Department:\s*([^\n]+)/);
          if (match) organizingBody = match[1].trim();
        } else if (event.description.includes('Ministry:')) {
          category = 'ministries';
          const match = event.description.match(/Ministry:\s*([^\n]+)/);
          if (match) organizingBody = match[1].trim();
        }
      }

      // Try to get venue from location
      const venue = event.location || 'TBD';

      // Create a normalized organization ID from the organizing body
      const organizationId = organizingBody.toLowerCase().replace(/\s+/g, '-');

      return {
        id: event.id || `event-${Math.random().toString(36).substr(2, 9)}`,
        title: event.summary || 'Untitled Event',
        date: formattedDate,
        time: formattedTime,
        venue: venue,
        organizingBody: organizingBody,
        description: event.description || 'No description available',
        category: category as any,
        organization: organizationId, // Use a normalized version of the organizing body as the organization ID
        // Include any other fields your calendar component might need
        threadId: event.extendedProperties?.shared?.threadId || event.extendedProperties?.private?.threadId || '',
        emailSource: event.extendedProperties?.shared?.emailSource || event.extendedProperties?.private?.emailSource || ''
      };
    });
  }

  // Fetch data in parallel for better performance
  const [events, userPreferences, organizations] = await Promise.all([
    fetchEvents(),
    fetchPreferences(),
    fetchOrganizations()
  ]);

  // Now that we have organizations, we can match events with them
  const mappedEvents = events.map(event => {
    // Check if event can be linked to an organization
    const matchedOrg = organizations.find(org =>
      org.id === event.organization ||
      org.name.toLowerCase() === event.organizingBody.toLowerCase() ||
      // Try matching the normalized organization name
      event.organizingBody.toLowerCase().replace(/\s+/g, '-') === org.id
    );

    if (matchedOrg) {
      console.log(`Matched event "${event.title}" with organization "${matchedOrg.name}" (${matchedOrg.id})`);
      // Update the event with the matched organization ID
      return {
        ...event,
        organization: matchedOrg.id,
        // We can also update the category based on the organization if needed
        category: matchedOrg.category || event.category
      };
    }

    return event;
  });

  return (
    <div>
      <Suspense>
        <EventsCalendar
          events={mappedEvents}
          initialPreferences={userPreferences}
          apiEndpoint="/api/platform/events/preferences"
          organizations={organizations}
        />
        <DeveloperCredits developers={[{ "name": "Soham Tulsyan", "profileUrl": "https://www.linkedin.com/in/soham-tulsyan-0902482a7/" }, { "name": "Vaani Goenka" }, { "name": "Ibrahim Khalil" }]} />
      </Suspense>
    </div>
  );
}
