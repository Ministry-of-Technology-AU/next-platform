import EventsCalendar from "./events-calendar";
import { getCalendarEvents, sampleEvents } from "./data/calendar-data";

export default async function Page() {
  const { events, error } = await getCalendarEvents();

  if (error) {
    console.error(error);
  }

  console.log(events);

  return <EventsCalendar events={sampleEvents} />;
}
