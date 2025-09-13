"use client";
import { useEffect, useState } from "react";
import { FormContainer, PhoneInput, TextInput, SingleSelect, SubmitButton} from "@/components/form";

interface WifiTickets1Props {
  onWifiStateChange: (state: string) => void;
}

export default function WifiTickets1({ onWifiStateChange }: WifiTickets1Props){
  const [phoneNumber, setPhoneNumber] = useState("");
  const [onAshokaWifi, setOnAshokaWifi] = useState("");
  const wifiOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },]
  const [complaintType, setComplaintType] = useState("");
  const complaintTypes = [
    { value: "speed", label: "Speed" },
    { value: "smart_device_configuration", label: "Smart Device Configuration" },
    { value: "forgot_password", label: "Forgot Password" },
    { value: "unblock_service", label: "Unblock Service" },
    { value: "damaged_hardware", label: "Damaged Hardware" },
  ]
  const locationOptions = [
    { value: "hostel_a", label: "Hostel A" },
    { value: "hostel_b", label: "Hostel B" },
    { value: "academic_block", label: "Academic Block" },
    { value: "mess", label: "Mess" },
    { value: "other", label: "Other" },
  ];
  const [location, setLocation] = useState("");
  const [roomFloor, setRoomFloor] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    alert("Form submitted successfully!");
    setIsSubmitting(false);
  };
  useEffect(() => {
    onWifiStateChange(onAshokaWifi);
  }, [onAshokaWifi, onWifiStateChange]);
  return (
    <FormContainer onSubmit={handleSubmit}>
      <SingleSelect
        title="Are you currently on Ashoka Wifi?"
        description="Select the type of complaint you are filing."
        placeholder="Select an option"
        isRequired
        items={wifiOptions}
        value={onAshokaWifi}
        onChange={setOnAshokaWifi}
      />
      <PhoneInput
        title="Contact Number"
        description="Provide a valid 10-digit mobile number for communication regarding your request."
        isRequired
        value={phoneNumber}
        onChange={setPhoneNumber}
        errorMessage="Invalid phone number"
      />
      <SingleSelect
        title="Complaint Type"
        description="Select the type of complaint you are filing."
        placeholder="Select an option"
        isRequired
        items={complaintTypes}
        value={complaintType}
        onChange={setComplaintType}
      />
      <SingleSelect
        title="Location"
        description="Select the location of the complaint."
        placeholder="Select an option"
        isRequired
        items={locationOptions}
        value={location}
        onChange={setLocation}
      />
      <TextInput
        title="Room/Floor"
        description="Enter the room or floor of the complaint."
        placeholder="Enter your room or floor"
        isRequired
        value={roomFloor}
        onChange={setRoomFloor}
      />
      <TextInput
        title="Additional Details"
        description="Enter any additional details about the complaint."
        placeholder="Enter any additional details about the complaint."
        isRequired
        isParagraph
        value={additionalDetails}
        onChange={setAdditionalDetails}
      />
      <SubmitButton text="Submit Ticket" isLoading={isSubmitting} onClick={() => handleSubmit({} as React.FormEvent)}/>
    </FormContainer>
  );
}
