"use client"

import { useState } from "react"
import Image from "next/image"
import { Calendar, Clock, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button
 } from "@/components/ui/button"
import EventDialog from "./event-dialog"

interface Event {
  id: number
  title: string
  logo: string
  dates: string
  description: string
  deadline: string
  endDate: string
  tags: Array<{ name: string; color: string }>
  registrationLink: string
  websiteLink: string
}

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const truncatedDescription =
    event.description.length > 50 ? event.description.substring(0, 50) + "..." : event.description

  // Check if event has passed
  const isEventPassed = () => {
    const today = new Date()
    const eventEndDate = new Date(event.endDate)
    return eventEndDate < today
  }

  const eventPassed = isEventPassed()

  return (
    <>
      <Card
        className={`w-full transition-all duration-300 relative overflow-hidden ${
          eventPassed 
            ? 'opacity-60 grayscale cursor-not-allowed' 
            : 'cursor-pointer hover:shadow-lg hover:border-primary/30'
        }`}
        onMouseEnter={() => !eventPassed && setIsHovered(true)}
        onMouseLeave={() => !eventPassed && setIsHovered(false)}
        onClick={() => !eventPassed && setIsDialogOpen(true)}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-8">
            {/* Event Logo */}
            <div className="flex-shrink-0">
              <Image
                src={event.logo || "/placeholder.svg"}
                alt={`${event.title} logo`}
                width={120}
                height={120}
                className="rounded-lg object-cover"
              />
            </div>

            {/* Event Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-extradark line-clamp-2">{event.title}</h3>
                <div className="flex items-center gap-2 text-sm px-3 py-1 rounded-full ml-4">
                  <Clock className="h-4 w-4" />
                  <span className={`font-medium ${eventPassed ? 'text-gray-500 bg-gray-100' : 'text-primary bg-primary/10'}`}>
                    {eventPassed ? 'Event Ended' : `Deadline: ${event.deadline}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-3 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className={eventPassed ? 'text-gray-500' : 'text-primary'}>{event.dates}</span>
                </div>
              </div>

              <p className={`mb-4 leading-relaxed ${eventPassed ? 'text-gray-500' : 'text-dark'}`}>{truncatedDescription}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <Badge key={index} className={`${eventPassed ? 'bg-gray-200 text-gray-600' : tag.color} border-0 text-xs font-medium`}>
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Hover Overlay - Only show for active events */}
          {!eventPassed && (
            <div
              className={`
                absolute inset-0 flex items-center justify-center
                bg-black/60
                transition-opacity duration-400
                ${isHovered ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
              `}
            >
              <Button
                type="button"
                variant="animatedGhost"
                className="text-white text-lg"
                tabIndex={-1}
                style={{ pointerEvents: 'auto' }}
              >
                <FileText className="h-5 w-5" />
                Click to read more
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <EventDialog event={event} isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </>
  )
}
