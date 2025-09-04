"use client";

import { useState, useMemo, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatedSearch } from "./components/animated-search";
import { EventDialog } from "./components/event-dialog";
import { TourStep, useTour } from "@/components/guided-tour"; // Import useTour hook
import { PreferencesSidebar } from "./components/preference-sidebar";
import {
  MonthView,
  ListView,
  WeekView,
  TodayView,
} from "./components/calendar-views";
import {
  sampleEvents,
  organizations,
  defaultColors,
} from "./data/calendar-data";
import type { Event, CalendarView, Preferences } from "./types/calendar";

type EventsCalendarProps = {
  events: Event[];
};

export default function EventsCalendar({ events }: EventsCalendarProps) {
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>(
    isMobile ? "list" : "month"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);

  // State for the preferences sidebar is now managed locally
  const [showPreferences, setShowPreferences] = useState(false);

  // Use the tour hook to get the current tour state
  const { isActive, currentStepId } = useTour();

  // Use a useEffect to listen for changes in the tour's current step.
  // This is the core logic that connects the tour to your component's state.
  useEffect(() => {
    // When the tour is active and we are on the 'event-filters' step, show the sidebar.
    // Otherwise, ensure the sidebar is closed.
    if (isActive && currentStepId === "event-filters") {
      setShowPreferences(true);
    } else {
      setShowPreferences(false);
    }
    // The dependency array ensures this effect runs only when these values change.
  }, [isActive, currentStepId]);

  const [preferences, setPreferences] = useState<Preferences>({
    selectedOrganizations: organizations.map((org) => org.id),
    selectedCategories: ["all"],
    categoryColors: {
      clubs: defaultColors[0],
      societies: defaultColors[3],
      departments: defaultColors[6],
      ministries: defaultColors[9],
      others: defaultColors[12],
    },
  });

  const filteredEvents = useMemo(() => {
    let filtered = events;
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.organizingBody
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          event.venue.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Filter by selected categories
    if (!preferences.selectedCategories.includes("all")) {
      filtered = filtered.filter((event) =>
        preferences.selectedCategories.includes(event.category)
      );
    }
    // Filter by selected organizations
    filtered = filtered.filter((event) =>
      preferences.selectedOrganizations.includes(event.organization)
    );
    return filtered;
  }, [searchQuery, preferences, events]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getNavigationLabel = () => {
    if (currentView === "month") {
      return selectedDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } else if (currentView === "week") {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${endOfWeek.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }
    return selectedDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const handleNavigation = (direction: "prev" | "next") => {
    if (currentView === "month" || currentView === "list") {
      navigateMonth(direction);
    } else if (currentView === "week") {
      navigateWeek(direction);
    }
  };

  const renderCalendarView = () => {
    const viewProps = {
      events: filteredEvents,
      selectedDate,
      onEventClick: handleEventClick,
      categoryColors: preferences.categoryColors,
    };
    switch (currentView) {
      case "month":
        return <MonthView {...viewProps} />;
      case "week":
        return <WeekView {...viewProps} />;
      case "list":
        return <ListView {...viewProps} />;
      case "today":
        return <TodayView {...viewProps} />;
      default:
        return <MonthView {...viewProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Calendar className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Events Calendar</h1>
            <p className="text-muted-foreground">
              Discover and manage campus events
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TourStep
              id="event-search"
              order={1}
              title="Search for Events!"
              content="Find events by name, category, or description."
              position="right"
            >
              <AnimatedSearch onSearch={setSearchQuery} />
            </TourStep>

            <TourStep
              id="event-filters"
              order={2}
              title="Filter Events!"
              content="Filter events by category, organization, or date."
              position="right"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreferences(true)} // Now uses local state
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </TourStep>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigation("prev")}
                disabled={currentView === "today"}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant={
                  selectedDate.toDateString() === new Date().toDateString()
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={goToToday}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigation("next")}
                disabled={currentView === "today"}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="font-semibold text-2xl text-center">
              {getNavigationLabel()}
            </h2>
          </div>

          <div className="flex items-center gap-1">
            {(["month", "week", "list", "today"] as CalendarView[]).map(
              (view) => (
                <Button
                  key={view}
                  variant={currentView === view ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView(view)}
                  className="capitalize"
                >
                  {view}
                </Button>
              )
            )}
          </div>
        </div>

        {/* Calendar Content */}
        <div className="bg-card rounded-lg border p-4">
          {renderCalendarView()}
        </div>

        {/* Event Dialog */}
          <EventDialog
            event={selectedEvent}
            open={showEventDialog}
            onOpenChange={setShowEventDialog}
          />
        {/* Preferences Sidebar */}
          <PreferencesSidebar
            open={showPreferences}
            onOpenChange={setShowPreferences} // Use local state setter
            preferences={preferences}
            onPreferencesChange={setPreferences}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
      </div>
    </div>
  );
}
