import type { IntercolEvent } from './types';

interface EventsApiResponse {
  success: boolean;
  data?: {
    events: IntercolEvent[];
  };
  error?: string;
}

export async function getEvents(): Promise<IntercolEvent[]> {
  const response = await fetch('/api/platform/intercol-events');

  if (!response.ok) {
    throw new Error('Failed to fetch intercollegiate events');
  }

  const result: EventsApiResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Unable to load events');
  }

  return result.data.events;
}