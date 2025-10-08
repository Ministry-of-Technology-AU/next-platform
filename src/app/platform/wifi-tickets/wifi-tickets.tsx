"use client";
import { useEffect, useState } from "react";
import { FormContainer, PhoneInput, TextInput, SingleSelect, SubmitButton} from "@/components/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wifi } from "lucide-react";
import SpeedTest from "./_components/speedtest";
import { Drawer } from "@/components/ui/drawer";

export default function WifiTickets1(){
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
    { value: "low_router_density", label: "Low Router Density" },
    { value: "other", label: "Other (Write in additional notes)" },
  ]
  const locationOptions = [
    { value: "rh1", label: "RH-01" },
    { value: "rh2", label: "RH-02" },
    { value: "rh3", label: "RH-03" },
    { value: "rh4", label: "RH-04" },
    { value: "rh5", label: "RH-05" },
    { value: "rh6", label: "RH-06" },
    { value: "rh7", label: "RH-07" },
    { value: "admin_block", label: "Admin Block" },
    { value: "ac1", label: "AC-01" },
    { value: "ac2", label: "AC-02" },
    { value: "ac3", label: "AC-03" },
    { value: "ac4", label: "AC-04" },
    { value: "ac5", label: "AC-05" },
    { value: "mess", label: "Mess" },
    { value: "fuel_zone", label: "Fuel Zone" },
    { value: "sanghvi", label: "Sanghvi Library" },
    { value: "libcaf", label: "Library Cafe" },
    { value: "library", label: "Library" },
    { value: "sports_complex", label: "Sports Complex" },
    { value: "other", label: "Other" },

  ];
  const [location, setLocation] = useState("");
  const [roomFloor, setRoomFloor] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [downloadSpeed, setDownloadSpeed] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Load user's existing phone number
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await fetch('/api/platform/wifi-tickets');
        if (response.ok) {
          const data = await response.json();
          if (data.phone) {
            setPhoneNumber(data.phone);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, []);

  // Auto-launch speedtest when user selects "Yes" for Ashoka WiFi
  useEffect(() => {
    if (onAshokaWifi === "yes") {
      setDrawerOpen(true);
    }
  }, [onAshokaWifi]);

  const handleSpeedTestComplete = () => {
    setDrawerOpen(false);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!phoneNumber || phoneNumber.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }
    
    if (!onAshokaWifi || !complaintType || !location || !roomFloor || !additionalDetails) {
      alert("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = {
        phone: phoneNumber,
        wifiStatus: onAshokaWifi === "yes" ? "onWifi" : "notOnWifi",
        downloadSpeed: downloadSpeed || "",
        complaintType: complaintType,
        location: location,
        specificLocation: roomFloor,
        message: additionalDetails,
        submissionTimestamp: new Date().toISOString(),
      };
      
      console.log('Submitting form data:', formData);

      const response = await fetch('/api/platform/wifi-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        alert(`WiFi ticket submitted successfully! Ticket ID: ${result.ticketId}`);
        // Reset form fields after successful submission
        setPhoneNumber("");
        setOnAshokaWifi("");
        setComplaintType("");
        setLocation("");
        setRoomFloor("");
        setAdditionalDetails("");
        setDownloadSpeed("");
      } else {
        throw new Error(result.error || 'Failed to submit ticket');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting WiFi ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      {/* Conditional Speed Test Section - Only show when user is on Ashoka WiFi */}
      {onAshokaWifi === "yes" && (
        <div className="space-y-3 sm:space-y-4">
          <Label className="text-base font-medium">Download Speed Test (Optional)</Label>
          <p className="text-sm text-muted-foreground">
            Test your current download speed. This helps us better understand your connectivity issues.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="relative flex-1 w-full">
              <Input
                type="text"
                value={downloadSpeed}
                onChange={(e) => setDownloadSpeed(e.target.value)}
                placeholder="Enter your download speed (Mbps)"
                className="w-full"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDrawerOpen(true)}
              className="w-full sm:w-auto whitespace-nowrap"
            >
              <Wifi className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
              Re-test Speed
            </Button>
          </div>
        </div>
      )}

      {/* Speed Test Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SpeedTest onClose={handleSpeedTestComplete} />
      </Drawer>
      
      <PhoneInput
        title="Contact Number"
        description="Provide a valid 10-digit mobile number for communication regarding your request."
        isRequired
        value={phoneNumber}
        onChange={setPhoneNumber}
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
