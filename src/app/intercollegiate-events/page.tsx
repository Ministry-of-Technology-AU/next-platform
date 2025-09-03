"use client"

import * as React from "react"
import { Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import EventCard from "./components/event-card"
import SearchBar from "./components/search-bar"
import Image from "next/image"

//TODO: Make search bar work, make responsive, fix tags, modularize

interface Event{
  id: number;
  title: string;
  logo: string;
  dates: string;
  description: string;
  deadline: string;
  endDate: string; // For comparison with current date
  tags: Array<{ name: string; color: string }>;
  registrationLink: string;
  websiteLink: string;
}

export default function IntercollegiateEventsPage() {
  const [events, setEvents] = React.useState<Event[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true)
        const response = await fetch('/api/intercollegiate-events')
        const result = await response.json()
        
        if (result.success) {
          setEvents(result.data || [])
        } else {
          setError(result.error || 'Failed to fetch events')
        }
      } catch (err) {
        console.error('Error fetching events:', err)
        setError('Failed to fetch events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return (
    <div className="min-h-screen bg-extralight">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section with Banner Background */}
        <div className="relative mb-8">
          {/* Banner Image */}
          <Image
            src="/placeholder.svg?height=200&width=1200"
            alt="Collaborative Initiative Banner"
            width={1200}
            height={200}
            className="w-full h-48 object-cover rounded-lg shadow-lg"
          />
          {/* Overlay Content */}
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-white px-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Trophy className="h-8 w-8 text-white" />
                <h1 className="text-3xl font-bold">Intercollegiate Events</h1>
              </div>
              <p className="text-lg text-gray-200 max-w-2xl">
                Discover and participate in exciting competitions across universities
              </p>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="about">
                <AccordionTrigger className="text-left bold text-xl">
                  About Intercollegiate Events
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <p className="text-dark leading-relaxed">
                      This section serves as a comprehensive resource for all
                      intercollegiate events and competitions available for Ashoka
                      University students. Here, you will find interest forms for each
                      competition. Once you fill out the form, the designated Point of
                      Contact (POC) for that event will reach out to you with further
                      information.
                    </p>
                    <p className="text-dark leading-relaxed">
                      Please be sure to review the off-campus policy before applying for
                      any competitions. If you encounter any challenges, don&apos;t hesitate
                      to reach out via email or phone:
                    </p>

                    {/* Contact Information */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-extralight p-4 rounded-lg">
                        <p className="font-medium text-extradark">Vibha Rawat</p>
                        <p className="text-primary text-sm">
                          vibha.rawat_ug2023@ashoka.edu.in
                        </p>
                        <p className="text-primary text-sm">9667764435</p>
                      </div>
                      <div className="bg-extralight p-4 rounded-lg">
                        <p className="font-medium text-extradark">Guntaas Kaur</p>
                        <p className="text-primary text-sm">
                          guntaas.kaur_ug2023@ashoka.edu.in
                        </p>
                        <p className="text-primary text-sm">+91 98118 06032</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-primary">
                <span className="font-medium">Page Maintained by Jazbaa</span> |
                Click on a competition to view further details
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <SearchBar />

        {/* Events List */}
        <div className="space-y-4">
          {loading ? (
            <Card className="p-8 text-center">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <Trophy className="h-16 w-16 text-gray-400 animate-pulse" />
                  <h3 className="text-xl font-semibold text-gray-600">Loading Events...</h3>
                  <p className="text-gray-500 max-w-md">
                    Please wait while we fetch the latest intercollegiate events.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="p-8 text-center">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <Trophy className="h-16 w-16 text-red-400" />
                  <h3 className="text-xl font-semibold text-red-600">Error Loading Events</h3>
                  <p className="text-red-500 max-w-md">
                    {error}
                  </p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : events.length === 0 ? (
            <Card className="p-8 text-center">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <Trophy className="h-16 w-16 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-600">No Events Currently</h3>
                  <p className="text-gray-500 max-w-md">
                    There are no intercollegiate events available at the moment. Check back later for new opportunities!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            events.map((event: Event) => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
