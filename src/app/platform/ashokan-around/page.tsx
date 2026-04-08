import { MapPin, Loader } from "lucide-react";
import AshokanAroundForm from "./_components/ashokan-around-form";
import ActiveAccommodationRequest from "./ActiveAccommodationRequest";
import PageTitle from "@/components/page-title";
import { Suspense } from "react";
import DeveloperCredits from "@/components/developer-credits";

import { AccommodationData } from "./types";

// Mock implementation to mimic existPoolRequest
async function existAccommodationRequest(): Promise<{ success: boolean; userAccommodation: AccommodationData } | null> {
  // Return null to show the form for now.
  // When backend is implemented, this should query Strapi or similar API
  // for an existing active accommodation request from this user.

  /*
  return {
    success: true,
    userAccommodation: {
      id: "mock-1",
      attributes: {
        cityDestination: "Sonepat",
        workplaceLocation: "TDI",
        housingTypeWanted: "Flat/Apartment",
        budget: "15000",
        genderPreference: "No preference",
        whatsappNumber: "9876543210",
        emailAddress: "",
        status: "available",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        student: {
          data: {
            id: 1,
            attributes: { username: "Ashokan", email: "ashokan@ashoka.edu.in", phone: null }
          }
        }
      }
    }
  };
  */

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
