"use client";
import { useEffect, useState } from "react";
import { FormContainer, PhoneInput, TextInput, SingleSelect, SubmitButton} from "@/components/form";

// export function WifiTickets(){
//     const [onAshokaWifi, setOnAshokaWifi] = useState("");
//     const wifiOptions = [
//         { value: "yes", label: "Yes" },
//         { value: "no", label: "No" },]

//     const [complaintType, setComplaintType] = useState("");
//     const complaintTypes = [
//         { value: "speed", label: "Speed" },
//         { value: "smart_device_configuration", label: "Smart Device Configuration" },
//         { value: "forgot_password", label: "Forgot Password" },
//         { value: "unblock_service", label: "Unblock Service" },
//         { value: "damaged_hardware", label: "Damaged Hardware" },
//         { value: "low_router_density", label: "Low Router Density" },
//         { value: "other", label: "Other" },]

//     const [location, setLocation] = useState("");
//     const [roomFloor, setRoomFloor] = useState("");
//     const [additionalDetails, setAdditionalDetails] = useState("");

//     const locationOptions = [
//       { value: "hostel_a", label: "Hostel A" },
//       { value: "hostel_b", label: "Hostel B" },
//       { value: "academic_block", label: "Academic Block" },
//       { value: "mess", label: "Mess" },
//       { value: "other", label: "Other" },
//     ];

//     const errors = {
//       onAshokaWifi: onAshokaWifi === "",
//       phoneNumber: false, // Placeholder, actual validation needed
//       location: location === "",
//       roomFloor: roomFloor === "",
//       additionalDetails: false,
//     };

//     const handleSubmit = (e: React.FormEvent) => {
//       e.preventDefault();
//       // Basic validation
//       if (onAshokaWifi === "") {
//         alert("Please select if you are on Ashoka Wifi.");
//         return;
//       }
//       if (phoneNumber.length !== 10) {
//         alert("Phone number must be 10 digits.");
//         return;
//       }
//       if (location === "") {
//         alert("Please select a location.");
//         return;
//       }
//       if (roomFloor === "") {
//         alert("Please enter your room or floor.");
//         return;
//       }

//       alert("Form submitted successfully!");
//       // In a real app, you would send data to an API here
//     };

// return (
//   <CardContent>
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="space-y-2">
//         <Label
//           htmlFor="wifi"
//           className="text-sm font-medium flex items-center gap-2"
//         >
//           Are you currently on Ashoka Wifi?{" "}
//           <span className="text-destructive">*</span>
//         </Label>
//         <Select value={onAshokaWifi} onValueChange={setOnAshokaWifi}>
//           <SelectTrigger id="wifi">
//             <SelectValue placeholder="Select an option" />
//           </SelectTrigger>
//           <SelectContent>
//             {wifiOptions.map((option) => (
//               <SelectItem key={option.value} value={option.value}>
//                 {option.label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         {errors.onAshokaWifi && (
//           <p className="text-sm text-destructive">
//             This field is required.
//           </p>
//         )}
//       </div>

//       {/* Phone Number */}
//       <div className="space-y-2">
//         <Label htmlFor="phoneNumber" className="text-base font-medium">
//           Contact Number *
//         </Label>
//         <p className="text-sm text-muted-foreground">
//           Provide a valid 10-digit mobile number for communication regarding your
//           request.
//         </p>
//         <div className="flex">
//           <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md">
//             <Phone className="w-4 h-4 mr-2" />
//             <span className="text-sm font-medium">+91</span>
//           </div>
//           <Input
//             id="phoneNumber"
//             type="tel"
//             placeholder="9876543210"
//             className={`rounded-l-none ${
//               errors.phoneNumber ? "border-destructive" : ""
//             }`}
//           />
//         </div>
//         {errors.phoneNumber && (
//           <p className="text-sm text-destructive">{errors.phoneNumber}</p>
//         )}
//       </div>

//       {/* Complaint Type Selection */}
//       <div className="space-y-2">
//         <Label
//           htmlFor="complaint_type"
//           className="text-sm font-medium flex items-center gap-2"
//         >
//           Complaint Type <span className="text-destructive">*</span>
//         </Label>
//         <Select value={complaintType} onValueChange={setComplaintType}>
//           <SelectTrigger id="complaint_type">
//             <SelectValue placeholder="Select an option" />
//           </SelectTrigger>
//           <SelectContent>
//             {complaintTypes.map((option) => (
//               <SelectItem key={option.value} value={option.value}>
//                 {option.label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         {errors.complaintType && (
//           <p className="text-sm text-destructive">
//             This field is required.
//           </p>
//         )}
//       </div>

//       {/* Location Selection */}
//       <div className="space-y-2">
//         <Label
//           htmlFor="location"
//           className="text-sm font-medium flex items-center gap-2"
//         >
//           Location <span className="text-destructive">*</span>
//         </Label>
//         <Select value={location} onValueChange={setLocation}>
//           <SelectTrigger id="location">
//             <SelectValue placeholder="Select a location" />
//           </SelectTrigger>
//           <SelectContent>
//             {locationOptions.map((option) => (
//               <SelectItem key={option.value} value={option.value}>
//                 {option.label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         {errors.location && (
//           <p className="text-sm text-destructive">{errors.location}</p>
//         )}
//       </div>

//       {/* Room/Floor Input */}
//       <div className="space-y-2">
//         <Label htmlFor="roomFloor" className="text-base font-medium">
//           Room/Floor <span className="text-destructive">*</span>
//         </Label>
//         <Input
//           id="roomFloor"
//           type="text"
//           placeholder="Enter your room or floor"
//           value={roomFloor}
//           onChange={(e) => setRoomFloor(e.target.value)}
//           className={errors.roomFloor ? "border-destructive" : ""}
//         />
//         {errors.roomFloor && (
//           <p className="text-sm text-destructive">{errors.roomFloor}</p>
//         )}
//       </div>

//       {/* Additional Details */}
//       <div className="space-y-2">
//         <Label htmlFor="additionalDetails" className="text-base font-medium">
//           Additional Details
//         </Label>
//         <Textarea
//           id="additionalDetails"
//           placeholder="Describe your issue in detail (optional)"
//           value={additionalDetails}
//           onChange={(e) => setAdditionalDetails(e.target.value)}
//           className="min-h-[100px]"
//         />
//       </div>

//       <Button
//         type="submit"
//         variant="animated"
//         className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
//       >
//         Submit Ticket
//       </Button>
//     </form>
//   </CardContent>
// );
// }

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    alert("Form submitted successfully!");
    setIsSubmitting(false);
  };
  useEffect(() => {
    if(onAshokaWifi === "yes"){
      console.log("On ashoka wifi"); //TODO: Change this later to implement speedtest
    }
  }, [onAshokaWifi]);
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
