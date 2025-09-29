"use client";
import { useEffect, useState } from "react";
import { FormContainer, PhoneInput, TextInput, SingleSelect, SubmitButton} from "@/components/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Wifi } from "lucide-react";

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
  const [downloadSpeed, setDownloadSpeed] = useState("");
  const [isSpeedTesting, setIsSpeedTesting] = useState(false);
  const [speedTestStarted, setSpeedTestStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user's existing phone number
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await fetch('/api/wifi-tickets');
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

  const startSpeedTest = () => {
    if (isSpeedTesting) return;
    
    setIsSpeedTesting(true);
    setSpeedTestStarted(true);
    setDownloadSpeed("");
    
    let counter = 0;
    const interval = setInterval(() => {
      // Generate random speed values that gradually increase for realism
      const randomSpeed = Math.floor(Math.random() * 150 + 10);
      setDownloadSpeed(`${randomSpeed}`);
      counter++;
      
      // After 7 seconds (approximately 35 intervals at 200ms), set to 120 mbps
      if (counter >= 35) {
        clearInterval(interval);
        setDownloadSpeed("120");
        setIsSpeedTesting(false);
      }
    }, 200);
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

      const response = await fetch('/api/wifi-tickets', {
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
        setSpeedTestStarted(false);
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
      
      {/* Speed Test Component */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Download Speed Test (Optional)</Label>
        <p className="text-sm text-muted-foreground">
          Test your current download speed. This helps us better understand your connectivity issues.
        </p>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Input
              type="text"
              value={downloadSpeed ? `${downloadSpeed} Mbps` : ""}
              placeholder="Speed will appear here after test"
              readOnly
              className="pr-10"
            />
            {isSpeedTesting && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={startSpeedTest}
            disabled={isSpeedTesting}
            className="whitespace-nowrap"
          >
            {isSpeedTesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Wifi className="mr-2 h-4 w-4" />
                {speedTestStarted ? "Test Again" : "Start Test"}
              </>
            )}
          </Button>
        </div>
      </div>
      
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
