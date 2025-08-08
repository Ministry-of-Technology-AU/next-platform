import { Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import EventCard from "./components/event-card"
import SearchBar from "./components/search-bar"
import {TourProvider, TourStep, TourTrigger } from "@/components/guided-tour"


// Mock data for events
const events = [
  {
    id: 1,
    title: "Inter-University Debate Championship",
    logo: "/placeholder.svg?height=60&width=60",
    dates: "March 15-17, 2024",
    description:
      "A prestigious debate competition bringing together the brightest minds from universities across the nation to engage in intellectual discourse and showcase their oratory skills.",
    deadline: "March 1, 2024",
    tags: [
      { name: "Delhi University", color: "bg-blue-100 text-blue-800" },
      { name: "Debate", color: "bg-green-100 text-green-800" },
      { name: "National", color: "bg-yellow-100 text-yellow-800" },
    ],
    registrationLink: "https://example.com/register",
    websiteLink: "https://example.com/event",
  },
  {
    id: 2,
    title: "National Coding Hackathon",
    logo: "/placeholder.svg?height=60&width=60",
    dates: "April 5-7, 2024",
    description:
      "48-hour intensive coding competition where teams develop innovative solutions to real-world problems using cutting-edge technology and programming skills.",
    deadline: "March 20, 2024",
    tags: [
      { name: "IIT Delhi", color: "bg-blue-100 text-blue-800" },
      { name: "Technology", color: "bg-purple-100 text-purple-800" },
      { name: "Hackathon", color: "bg-green-100 text-green-800" },
    ],
    registrationLink: "https://example.com/register",
    websiteLink: "https://example.com/event",
  },
  {
    id: 3,
    title: "Inter-College Cultural Fest",
    logo: "/placeholder.svg?height=60&width=60",
    dates: "February 20-22, 2024",
    description:
      "A vibrant celebration of arts, culture, and creativity featuring dance, music, drama, and various cultural competitions from colleges nationwide.",
    deadline: "February 10, 2024",
    tags: [
      { name: "Jawaharlal Nehru University", color: "bg-blue-100 text-blue-800" },
      { name: "Cultural", color: "bg-pink-100 text-pink-800" },
      { name: "Arts", color: "bg-yellow-100 text-yellow-800" },
    ],
    registrationLink: "https://example.com/register",
    websiteLink: "https://example.com/event",
  },
  {
    id: 4,
    title: "Business Case Competition",
    logo: "/placeholder.svg?height=60&width=60",
    dates: "May 10-12, 2024",
    description:
      "Strategic business case analysis competition where teams tackle complex business challenges and present innovative solutions to industry experts.",
    deadline: "April 25, 2024",
    tags: [
      { name: "IIM Bangalore", color: "bg-blue-100 text-blue-800" },
      { name: "Business", color: "bg-green-100 text-green-800" },
      { name: "Strategy", color: "bg-orange-100 text-orange-800" },
    ],
    registrationLink: "https://example.com/register",
    websiteLink: "https://example.com/event",
  },
]

export default async function IntercollegiateEventsPage() {

  try {
    const res = await fetch("localhost:3000/platform/intercollegiate");
    if (!res.ok) {
      throw new Error("Failed to fetch intercollegiate events");
    }
    const {events} = await res.json();
    console.log(events);
    // Process data
  } catch (error) {
    console.error("Error fetching intercollegiate events:", error);
  }


  return (
    <div className="min-h-screen bg-extralight">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-semibold text-extradark">Intercollegiate Events</h1>
          </div>
          <p className="text-lg text-primary mb-6">
            Discover and participate in exciting competitions across universities
          </p>
        </div>

        {/* Collaborative Banner */}
        <div className="mb-8">
          <img
            src="/placeholder.svg?height=200&width=1200"
            alt="Collaborative Initiative Banner"
            className="w-full h-48 object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Description Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="text-dark mb-4 leading-relaxed">
              This section serves as a comprehensive resource for all intercollegiate events and competitions available
              for Ashoka University students. Here, you will find interest forms for each competition. Once you fill out
              the form, the designated Point of Contact (POC) for that event will reach out to you with further
              information.
            </p>
            <p className="text-dark mb-6 leading-relaxed">
              Please be sure to review the off-campus policy before applying for any competitions. If you encounter any
              challenges, don't hesitate to reach out via email or phone:
            </p>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-extralight p-4 rounded-lg">
                <p className="font-medium text-extradark">Vibha Rawat</p>
                <p className="text-primary text-sm">vibha.rawat_ug2023@ashoka.edu.in</p>
                <p className="text-primary text-sm">9667764435</p>
              </div>
              <div className="bg-extralight p-4 rounded-lg">
                <p className="font-medium text-extradark">Guntaas Kaur</p>
                <p className="text-primary text-sm">guntaas.kaur_ug2023@ashoka.edu.in</p>
                <p className="text-primary text-sm">+91 98118 06032</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-primary">
                <span className="font-medium">Page Maintained by Jazbaa</span> | Click on a competition to view further
                details
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <SearchBar />

        {/* Events List */}
        <div className="space-y-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  )
}
