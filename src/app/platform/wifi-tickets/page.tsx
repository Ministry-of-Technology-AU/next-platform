"use client";
import { Card, CardHeader } from "@/components/ui/card";
import { WifiPen } from "lucide-react";
import PageTitle from "@/components/page-title";
import WifiTickets1 from "./wifi-tickets";
import { InstructionsField } from "@/components/form";
import DeveloperCredits from "@/components/developer-credits";

export default function WifiTicketsPage() {

  return (
    <div className="min-h-screen container mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-12 py-4 sm:py-6 lg:py-8 max-w-none lg:max-w-full">
      <PageTitle
      text="Wifi Tickets"
      subheading="Your complaint will be sent to IT and used for WiFi analytics to
      identify recurring issues in specific areas or types of problems,
      helping improve service for everyone. IT will communicate to you about
      your complaint over the email."
      icon={WifiPen}
      />
      <Card className="w-full max-w-6xl lg:max-w-full mx-auto p-3 sm:p-4 lg:p-6 mt-4 sm:mt-6">
      <CardHeader className="p-0 pb-3 sm:pb-4">
        <InstructionsField
        heading="Instructions and Information"
        subheading="Steps to follow for this application:"
        body={[
          "1. Fill out all required fields marked with an asterisk (*)",
          "2. Upload relevant documents in PDF or DOC format",
          "3. Add profile photos (optional but recommended)",
          "4. Review your information before submitting",
        ]}
        />
      </CardHeader>
      <WifiTickets1 />
      </Card>
      <DeveloperCredits developers={[{"name": "Soham Tulsyan", "role": "Lead Developer", profileUrl: "https://www.linkedin.com/in/soham-tulsyan-0902482a7/"}, {"name": "Previous Teams"}]}/>
    </div>
  );
}