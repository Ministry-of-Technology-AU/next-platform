import { CalendarDays } from 'lucide-react';
import PageTitle from '@/components/page-title';
import { EventsClient } from './client';

export default function IntercolEventsPage() {
  return (
    <div className="pt-6 px-6">
      <PageTitle
        icon={CalendarDays}
        text="Intercollegiate Events"
        subheading="Discover events hosted by other colleges and register to attend."
      />

      <div className="mt-6">
        <EventsClient />
      </div>
    </div>
  );
}