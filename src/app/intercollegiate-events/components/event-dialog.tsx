"use client"

import Image from "next/image"
import { Calendar, Clock, ExternalLink, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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

interface EventDialogProps {
  event: Event
  isOpen: boolean
  onClose: () => void
}

export default function EventDialog({ event, isOpen, onClose }: EventDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4 mb-4">
            <Image
              src={event.logo || "/placeholder.svg"}
              alt={`${event.title} logo`}
              width={120}
              height={120}
              className="rounded-lg object-cover"
            />
            <div className="flex-1">
              <DialogTitle className="text-2xl font-semibold text-extradark mb-2">{event.title}</DialogTitle>
              <div className="flex items-center gap-4 text-sm text-primary mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{event.dates}</span>
                </div>
                <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Deadline: {event.deadline}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag, index) => (
              <Badge key={index} className={`${tag.color} border-0 text-sm font-medium`}>
                {tag.name}
              </Badge>
            ))}
          </div>

          {/* Full Description */}
          <div>
            <h4 className="text-lg font-semibold text-extradark mb-3">About the Event</h4>
            <p className="text-dark leading-relaxed">{event.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
              onClick={() => window.open(event.registrationLink, "_blank")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Registration Form
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-primary text-primary hover:bg-primary/5 bg-transparent"
              onClick={() => window.open(event.websiteLink, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Event Website
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
