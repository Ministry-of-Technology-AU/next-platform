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

  return (
    <>
      <Card
        className="w-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/30 relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsDialogOpen(true)}
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
                <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-1 rounded-full ml-4">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Deadline: {event.deadline}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-3 text-sm text-primary">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{event.dates}</span>
                </div>
              </div>

              <p className="text-dark mb-4 leading-relaxed">{truncatedDescription}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <Badge key={index} className={`${tag.color} border-0 text-xs font-medium`}>
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Hover Overlay */}
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
        </CardContent>
      </Card>

      <EventDialog event={event} isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </>
  )
}
