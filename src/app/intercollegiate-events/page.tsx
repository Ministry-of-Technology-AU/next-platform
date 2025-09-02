import { Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import EventCard from "./components/event-card"
import SearchBar from "./components/search-bar"
import { strapiGet } from "@/apis/strapi"
import PageTitle from "@/components/page-title"
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

async function getEvents(){
  try{
    const data = await strapiGet('/intercollegiate-events', {
      populate: 'tags',
      pagination: {
        pageSize: 200
      }
    });
    console.log("Fetched data from Strapi:", data);
    return data;
  }
  catch(error){
    console.error("Error fetching data from Strapi:", error);
    return [];
  }
}

async function mapEvents(){
  const data = await getEvents();
  if(!data || !data.data){
    return [];
  }
  const mappedEvents: Event[] = data.data.map((item: any) => {
    const attributes = item.attributes;
    return {
      id: item.id,
      title: attributes.event_title,
      logo: attributes.image_url || "/placeholder.svg?height=60&width=60",
      dates: `${attributes.from} - ${attributes.to}`,
      description: attributes.short_description || attributes.description || "",
      deadline: attributes.deadline,
      endDate: attributes.to, // Store the end date for comparison
      tags: attributes.tags ? attributes.tags.map((tag: any) => ({
        name: tag.name,
        color: tag.color
      })) : [],
      registrationLink: attributes.form_link,
      websiteLink: attributes.website_link
    };
  });
  console.log("Mapped Events:", mappedEvents);
  return mappedEvents;
}

export default async function IntercollegiateEventsPage() {
  const events = await mapEvents();

  return (
    <div className="min-h-screen bg-extralight">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <PageTitle
          text="Intercollegiate Events"
          icon={Trophy}
          subheading="Discover and participate in exciting competitions across universities"
        />

        {/* Collaborative Banner */}
        <div className="mb-8">
          <Image
            src="/placeholder.svg?height=200&width=1200"
            alt="Collaborative Initiative Banner"
            width={1200}
            height={200}
            className="w-full h-48 object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Description Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="text-dark mb-4 leading-relaxed">
              This section serves as a comprehensive resource for all
              intercollegiate events and competitions available for Ashoka
              University students. Here, you will find interest forms for each
              competition. Once you fill out the form, the designated Point of
              Contact (POC) for that event will reach out to you with further
              information.
            </p>
            <p className="text-dark mb-6 leading-relaxed">
              Please be sure to review the off-campus policy before applying for
              any competitions. If you encounter any challenges, don&apos;t hesitate
              to reach out via email or phone:
            </p>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
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

            <div className="border-t pt-4">
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
          {events.length === 0 ? (
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
