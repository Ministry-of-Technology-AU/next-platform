import EventsCalendar from "./events-calendar";
import { getCalendarEvents, sampleEvents } from "./data/calendar-data";

export default async function Page() {

  return <EventsCalendar events={sampleEvents} />;
}
