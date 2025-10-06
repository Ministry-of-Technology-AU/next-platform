"use client";
import PageTitle from "@/components/page-title"
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <PageTitle
        text="Please Navigate to the /platform route."
        icon={Link}
      />
      <Button onClick={() => window.location.href = '/platform'} className="mt-4">
        Here's a button to get you there!
      </Button>
    </div>
  );
}
