import PageTitle from "@/components/page-title"
import { PenBoxIcon } from "lucide-react";
import { MultiSelectDropdown, FormContainer } from "@/components/form";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <PageTitle
        text="Try Page"
        icon={PenBoxIcon}
        subheading="Placeholder"
      ></PageTitle>
    </div>
  );
}
