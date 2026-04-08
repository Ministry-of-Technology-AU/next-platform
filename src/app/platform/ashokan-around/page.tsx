import { Loader } from "lucide-react";
import AshokanAroundForm from "./_components/ashokan-around-form";
import ActiveAccommodationRequest from "./ActiveAccommodationRequest";
import { Suspense } from "react";

import { AccommodationData } from "./types";

import { headers } from "next/headers";

async function existAccommodationRequest(): Promise<{ success: boolean; userAccommodation: AccommodationData } | null> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${appUrl}/api/platform/ashokan-around?limit=1`, {
      method: "GET",
      headers: await headers(),
      cache: "no-store"
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.userAccommodation) {
        return { success: true, userAccommodation: data.userAccommodation };
      }
    }
  } catch (error) {
    console.error("Error fetching user accommodation:", error);
  }

  return null;
}

export default async function AshokanAroundPage() {
  const existingRequest = await existAccommodationRequest();

  // Check if user has an active accommodation request
  const hasActiveRequest = existingRequest?.success && existingRequest?.userAccommodation;

  return (
    <div className="flex justify-center px-4 sm:px-6 lg:px-8 pb-10">
      <div className="w-full space-y-6">
        <Suspense fallback={<Loader />}>
          {hasActiveRequest ? (
            <ActiveAccommodationRequest userAccommodation={existingRequest.userAccommodation} />
          ) : (
            <AshokanAroundForm />
          )}
        </Suspense>
      </div>
    </div>
  );
}
