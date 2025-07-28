import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Disclosure, DisclosureContent, DisclosureTrigger } from "@/components/ui/disclosure";
import {Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import WifiTickets from "./wifi-tickets";

export default function WifiTicketsPage() {
  return (
    <div className="mx-8">
      <h1>Wifi Tickets</h1>
      <h4>
        Your complaint will be sent to IT and used for WiFi analytics to
        identify recurring issues in specific areas or types of problems,
        helping improve service for everyone. IT will communicate to you about
        your complaint over the email.
      </h4>
      <Card className="p-4 mt-4">
        <CardHeader>
          <Disclosure className="flex-1 rounded-md border bg-primary-extralight/20 border-gray-200 dark:border-gray-700 p-3 min-w-0">
            <DisclosureTrigger>
              <Button
                variant="ghost"
                className="w-full justify-between text-sm sm:text-base font-medium min-w-0 hover:bg-primary-extralight/0"
              >
                <span className="truncate text-lg">
                  Instructions and Information
                </span>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </Button>
            </DisclosureTrigger>
            <DisclosureContent className="mt-2 space-y-2 px-2 sm:px-4">
              <h5 className="font-bold !text-left">
                Steps to follow if you are on Ashoka Wifi:
              </h5>
              <p>1. Run the speed test below by waiting for it to complete</p>
              <p>2. Enter the Download Speed from the test results</p>
              <p>3. Fill out the remaining details in the form</p>
            </DisclosureContent>
          </Disclosure>
        </CardHeader>
        <WifiTickets />
      </Card>
    </div>
  );
}