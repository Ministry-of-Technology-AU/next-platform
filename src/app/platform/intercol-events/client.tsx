
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '../organisations-catalog/_components/search-bar';
import { EventCard } from './_components/event-card';
import type { EventCategory, IntercolEvent } from './types';
import { CATEGORY_LABELS } from './utils';
import { getEvents } from './data';

type CategoryFilter = EventCategory | 'all';

const FILTER_OPTIONS: CategoryFilter[] = [
  'all',
  'sports',
  'cultural',
  'academic',
  'tech',
  'other',
];

export function EventsClient() {
  const [events, setEvents] = React.useState<IntercolEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState<CategoryFilter>('all');

  // Fetch events from the Next.js API
  React.useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      try {
        const fetchedEvents = await getEvents();

        if (!cancelled) {
          setEvents(fetchedEvents);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Unable to load events. Please try again later.');
          console.error(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  // Filter and sort events
  const visibleEvents = React.useMemo(() => {
    const needle = query.trim().toLowerCase();

    return events
      .filter((event) => category === 'all' || event.category === category)
      .filter(
        (event) =>
          needle === '' ||
          [event.name, event.hostCollege, event.location].some((field) =>
            field.toLowerCase().includes(needle)
          )
      )
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [events, query, category]);

  return (
    <div className="space-y-6">
      {/* Search and category filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search by event, college or city..."
        />

        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <Button
              key={option}
              variant={category === option ? 'default' : 'outline'}
              size="sm"
              className="rounded-full"
              onClick={() => setCategory(option)}
            >
              {option === 'all' ? 'All' : CATEGORY_LABELS[option]}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading, error, events or empty state */}
      {loading ? (
        <p className="py-12 text-center text-muted-foreground">
          Loading events...
        </p>
      ) : error ? (
        <p className="py-12 text-center text-destructive">
          {error}
        </p>
      ) : visibleEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-muted-foreground">
          No events match your search.
        </p>
      )}
    </div>
  );
}
