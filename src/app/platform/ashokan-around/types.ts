export type HousingPreference = "Single Room" | "Double Room" | "Triple Room" | "Flat/Apartment" | "Other";
export type GenderPreferenceFilter = "No preference" | "Male" | "Female" | "Other";

export interface AccommodationConnectionListing {
    id?: string;
    cityDestination: string;
    workplaceLocation?: string;
    housingTypeWanted: string;
    budget: string;
    genderPreference: string;
    whatsappNumber: string;
    emailAddress?: string;
    consent: boolean;
}

export interface UserData {
    id: number
    attributes: {
      username: string
      email: string
      phone: string | null
    }
  }

export interface AccommodationData {
    id: string
    attributes: {
      cityDestination: string
      workplaceLocation: string | null
      housingTypeWanted: string
      budget: string
      genderPreference: string
      whatsappNumber: string | null
      emailAddress: string | null
      status: string // "available", "completed", "canceled"
      createdAt: string
      updatedAt: string
      student: {
        data: UserData
      }
    }
  }
