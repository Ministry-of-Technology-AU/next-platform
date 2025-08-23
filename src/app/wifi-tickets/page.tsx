import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Disclosure, DisclosureContent, DisclosureTrigger } from "@/components/ui/disclosure";
import {Button } from "@/components/ui/button";
import { ChevronDown, WifiPen } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import PageTitle from "@/components/page-title";
import WifiTickets1 from "./wifi-tickets";
import { FormContainer, PhoneInput, TextInput, SingleSelect, FileUpload, ImageUpload, SubmitButton, InstructionsField } from "@/components/form";

export default function WifiTicketsPage() {
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
        <WifiTickets1 />
      </Card>
    </div>
  );
}