import { start } from "repl";
import EventsCalendar from "./events-calendar";
import { sampleEvents } from "./data/calendar-data";
import {getEvents} from "@/apis/calendar";

export default async function Page() {
  const startTime = new Date().toISOString();
  const endTime = new Date().getDate() + 30;
  const endTime1 = new Date(new Date().setDate(endTime)).toISOString();

  // const events = await getEvents("", startTime, endTime1);

  return <EventsCalendar events={sampleEvents} />;
}
