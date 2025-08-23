"use client";
import PageTitle from "@/components/page-title"
import { PenBoxIcon } from "lucide-react";
import { FormContainer, PhoneInput, TextInput, SingleSelect, MultiSelectCheckbox, MultiSelectDropdown, FileUpload, ImageUpload, SubmitButton } from "@/components/form";
import { useState } from "react";

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState("");
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <PageTitle text="Try Page" icon={PenBoxIcon} subheading="Placeholder"></PageTitle>
    </div>
  );
}
