"use client";

import type { Event } from "../types/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EventDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDialog({ event, open, onOpenChange }: EventDialogProps) {
  if (!event) return null;

  const handleAddToCalendar = () => {
    alert(`Adding "${event.title}" to your calendar!`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {event.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Date</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(event.date)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Time</p>
                <p className="text-sm text-muted-foreground">{event.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Venue</p>
                <p className="text-sm text-muted-foreground">{event.venue}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Organizing Body</p>
                <p className="text-sm text-muted-foreground">
                  {event.organizingBody}
                </p>
              </div>
            </div>
          </div>

          <div>
            <Badge variant="secondary" className="mb-3">
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </Badge>
            <div>
              <p className="font-medium mb-2">Description</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleAddToCalendar}>Add to My Calendar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
