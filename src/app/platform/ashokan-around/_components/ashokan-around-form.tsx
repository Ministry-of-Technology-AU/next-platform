"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  FormContainer,
  TextInput,
  SingleSelect,
  PhoneInput,
  CheckboxComponent,
} from "@/components/form";
import { AccommodationConnectionListing, HousingPreference, GenderPreferenceFilter } from "../types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Home } from "lucide-react";

export default function AshokanAroundForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<AccommodationConnectionListing>>({
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.cityDestination) newErrors.cityDestination = "City destination is required";
    if (!formData.housingTypeWanted) newErrors.housingTypeWanted = "Type of housing wanted is required";
    if (!formData.budget) newErrors.budget = "Budget is required";
    if (!formData.genderPreference) newErrors.genderPreference = "Gender preference is required";
    if (!formData.whatsappNumber || formData.whatsappNumber.length < 10) newErrors.whatsappNumber = "A valid WhatsApp number is required";
    if (!formData.consent) newErrors.consent = "You must consent to proceed";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await fetch('/api/platform/ashokan-around', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      toast.success("Accommodation connect request submitted successfully!");
      router.push("/platform/ashokan-around/results");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof AccommodationConnectionListing, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const isFormValid = !!(
    formData.cityDestination &&
    formData.housingTypeWanted &&
    formData.budget &&
    formData.genderPreference &&
    formData.whatsappNumber &&
    formData.whatsappNumber.length >= 10 &&
    formData.consent
  );

  return (
    <Card className="max-w-7xl ml-auto mr-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          <Home className="h-5 w-5" />
          Accommodation Details
        </CardTitle>
      </CardHeader>
      <FormContainer onSubmit={handleSubmit}>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            title="City Destination"
            placeholder="Enter city name"
            description="Where will you be staying for your program/internship?"
            value={formData.cityDestination || ""}
            onChange={(val) => updateField("cityDestination", val)}
            errorMessage={errors.cityDestination}
            isRequired
          />

          <TextInput
            title="Workplace Location (optional)"
            placeholder="Enter workplace location"
            description="Where will you be working or interning? (Optional)"
            value={formData.workplaceLocation || ""}
            onChange={(val) => updateField("workplaceLocation", val)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SingleSelect
            title="Type of Housing Wanted"
            placeholder="Select type"
            description="Choose the type of accommodation you prefer."
            items={[
              { label: "Single Room", value: "Single Room" },
              { label: "Double Room", value: "Double Room" },
              { label: "Triple Room", value: "Triple Room" },
              { label: "Flat/Apartment", value: "Flat/Apartment" },
              { label: "Other", value: "Other" },
            ]}
            value={formData.housingTypeWanted}
            onChange={(val) => updateField("housingTypeWanted", val as HousingPreference)}
            errorMessage={errors.housingTypeWanted}
            isRequired
          />

          <TextInput
            title="Budget (per month in ₹)"
            placeholder="Enter budget"
            description="How much can you spend per month?"
            value={formData.budget || ""}
            onChange={(val) => updateField("budget", val)}
            errorMessage={errors.budget}
            isRequired
          />
        </div>

        <div className="space-y-4">
          <SingleSelect
            title="Gender Preference"
            placeholder="Select preference"
            description="Select if you have a gender preference for roommates."
            items={[
              { label: "No preference", value: "No preference" },
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
              { label: "Other", value: "Other" },
            ]}
            value={formData.genderPreference}
            onChange={(val) => updateField("genderPreference", val as GenderPreferenceFilter)}
            errorMessage={errors.genderPreference}
            isRequired
          />

          <PhoneInput
            title="WhatsApp Phone Number"
            placeholder="Enter your WhatsApp number"
            description="Please provide a WhatsApp-enabled phone number for communication"
            value={formData.whatsappNumber || ""}
            onChange={(val) => updateField("whatsappNumber", val)}
            errorMessage={errors.whatsappNumber}
            isRequired
          />

          <TextInput
            title="Email Address (optional)"
            placeholder="Enter your email address"
            description="Alternative way to contact you (Optional)"
            type="email"
            value={formData.emailAddress || ""}
            onChange={(val) => updateField("emailAddress", val)}
          />
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center space-x-2">
            <CheckboxComponent
              title="I consent to my information being shared with others seeking accommodation connections."
              value={formData.consent || false}
              onChange={(checked) => updateField("consent", checked)}
              errorMessage={errors.consent}
            />
          </div>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full gap-2 text-lg py-6"
            disabled={loading || !isFormValid}
          >
            <Home className="h-5 w-5" />
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </div>

      </FormContainer>
    </Card>
  );
}
