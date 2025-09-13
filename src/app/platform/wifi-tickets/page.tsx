"use client";
import { Card, CardHeader } from "@/components/ui/card";
import { WifiPen } from "lucide-react";
import PageTitle from "@/components/page-title";
import WifiTickets1 from "./wifi-tickets";
import { InstructionsField } from "@/components/form";
import { Drawer } from "@/components/ui/drawer";
import SpeedTest from "./_components/speedtest";
import { useState } from "react";

export default function WifiTicketsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hasTriggeredSpeedTest, setHasTriggeredSpeedTest] = useState(false);

  const handleWifiStateChange = (state: string) => {
    if (state === "yes" && !hasTriggeredSpeedTest) {
      setIsDrawerOpen(true);
      setHasTriggeredSpeedTest(true);
    } else if (state === "no") {
      setHasTriggeredSpeedTest(false); // Reset when user selects "no"
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="mx-8">
      <PageTitle
        text="Wifi Tickets"
        subheading="Your complaint will be sent to IT and used for WiFi analytics to
        identify recurring issues in specific areas or types of problems,
        helping improve service for everyone. IT will communicate to you about
        your complaint over the email."
        icon={WifiPen}
      />
      <Card className="p-4 mt-4">
        <CardHeader>
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
        <WifiTickets1 onWifiStateChange={handleWifiStateChange} />
      </Card>
      
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SpeedTest onClose={handleCloseDrawer} />
      </Drawer>
    </div>
  );
}