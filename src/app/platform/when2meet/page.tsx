"use client";
import { Card, CardHeader } from "@/components/ui/card";
import { Clock } from "lucide-react";
import PageTitle from "@/components/page-title";
import DeveloperCredits from "@/components/developer-credits";
import TimeSlotPage from "./components/TimeSlotPage";

export default function WifiTicketsPage() {

    return (
        <div className="min-h-screen container mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 2xl:px-12 py-4 sm:py-6 lg:py-8 max-w-none lg:max-w-full">
            <PageTitle
                text="When2Meet"
                subheading="Schedule meetings with ease. Create a draft with slots for upto a week and share them for people to add their free times. 
                We have Ashoka-friendly slots!"
                icon={Clock}
            />
            <TimeSlotPage />
            <DeveloperCredits developers={[{ "name": "Vaani Goenka", "role": "Lead Developer" }]} />
        </div >
    );
}