"use client";

import type { Event } from "../types/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CalendarViewsProps {
  events: Event[];
  selectedDate: Date;
  onEventClick: (event: Event) => void;
  categoryColors: Record<string, string>;
}

export function MonthView({
  events,
  selectedDate,
  onEventClick,
  categoryColors,
}: CalendarViewsProps) {
  const startOfMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0
  );
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startOfMonth.getDay());

  const days = [];
  const currentDate = new Date(startDate);

  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-7 bg-muted/50">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="p-3 text-center font-medium text-sm text-muted-foreground border-r border-border last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              className={cn(
                "min-h-24 p-2 border-r border-b border-border last:border-r-0",
                !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                isToday && "bg-primary/5",
                index >= 35 && "border-b-0" // Remove bottom border for last row
              )}
            >
              <div
                className={cn(
                  "text-sm font-medium mb-1",
                  isToday && "text-primary font-bold"
                )}
              >
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <Button
                    key={event.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onEventClick(event)}
                    className="w-full h-auto p-0.5 text-xs justify-start hover:shadow-sm"
                    style={{
                      backgroundColor: categoryColors[event.category] + "30",
                    }}
                  >
                    <div className="truncate text-left">
                      <div className="font-medium">{event.time}</div>
                      <div>{event.title}</div>
                    </div>
                  </Button>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground px-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ListView({
  events,
  onEventClick,
  categoryColors,
}: CalendarViewsProps) {
  const groupedEvents = events.reduce((acc, event) => {
    const date = new Date(event.date).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedEvents).map(([date, dayEvents]) => (
        <div key={date}>
          <h3 className="font-semibold mb-2 text-lg">
            {new Date(date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h3>
          <div className="space-y-2">
            {dayEvents.map((event) => (
              <Card
                key={event.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent
                  className="p-4"
                  onClick={() => onEventClick(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {event.time} • {event.venue}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {event.organizingBody}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: categoryColors[event.category] + "40",
                      }}
                    >
                      {event.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function WeekView({
  events,
  selectedDate,
  onEventClick,
  categoryColors,
}: CalendarViewsProps) {
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    weekDays.push(day);
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-7 bg-muted/50">
        {weekDays.map((day) => {
          const isToday = day.toDateString() === new Date().toDateString();
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "p-3 text-center font-medium border-r border-border last:border-r-0",
                isToday && "bg-primary/10 text-primary"
              )}
            >
              <div className="text-sm">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="text-lg font-bold">{day.getDate()}</div>
            </div>
          );
        })}
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7">
        {weekDays.map((day) => {
          const dayEvents = getEventsForDate(day);
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-96 p-2 border-r border-border last:border-r-0",
                isToday && "bg-primary/5"
              )}
            >
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <Button
                    key={event.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onEventClick(event)}
                    className="w-full h-auto p-2 text-xs justify-start flex-col items-start hover:shadow-sm"
                    style={{
                      backgroundColor: categoryColors[event.category] + "30",
                    }}
                  >
                    <div className="font-medium text-left w-full">
                      {event.time}
                    </div>
                    <div className="text-left w-full">{event.title}</div>
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TodayView({
  events,
  onEventClick,
  categoryColors,
}: CalendarViewsProps) {
  const today = new Date();
  const todayEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate.toDateString() === today.toDateString();
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">
        Today -{" "}
        {today.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </h2>
      {todayEvents.length === 0 ? (
        <p className="text-muted-foreground">No events scheduled for today.</p>
      ) : (
        <div className="space-y-2">
          {todayEvents.map((event) => (
            <Card
              key={event.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4" onClick={() => onEventClick(event)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.time} • {event.venue}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.organizingBody}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: categoryColors[event.category] + "40",
                    }}
                  >
                    {event.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
