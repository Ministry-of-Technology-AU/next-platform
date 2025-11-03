"use client";
import PageTitle from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/platform/metrics");
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        console.log("Metrics:", data);
      } catch (err) {
        console.error("Error fetching metrics:", err);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <PageTitle text="Please Navigate to the /platform route." icon={Link} />
      <Button
        onClick={() => (window.location.href = "/platform")}
        className="mt-4 text-sm sm:text-base px-4 sm:px-6"
      >
        Here&apos;s a button to get you there!
      </Button>
    </div>
  );
}
