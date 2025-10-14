"use client";
import PageTitle from "@/components/page-title"
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <PageTitle
        text="Please Navigate to the /platform route."
        icon={Link}
      />
      <Button onClick={() => window.location.href = '/platform'} className="mt-4 text-sm sm:text-base px-4 sm:px-6">
        Here&apos;s a button to get you there!
      </Button>
    </div>
  );
}
