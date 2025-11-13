import RTIForm from "./RTIForm";
import PageTitle from "@/components/page-title";
import { Newspaper } from "lucide-react";

export default function SGRTIPage() {
  return (
    <div className="pt-6 px-6">
      <PageTitle icon={Newspaper} text="Request for Information (RTI)" subheading="Submit RTI requests to the Student Government. Choose to submit anonymously or with your contact details." />
      <div className="mt-6">
        <RTIForm />
      </div>
    </div>
  );
}
