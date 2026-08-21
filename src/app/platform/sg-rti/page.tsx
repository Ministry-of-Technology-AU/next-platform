import RTIForm from "./RTIForm";
import PageTitle from "@/components/page-title";
import { BadgeInfo } from "lucide-react";

export default function SGRTIPage() {
  return (
    <div className="pt-6 px-6">
      <PageTitle icon={BadgeInfo} text="SG: Request for Information (RTI)" subheading="Excercise your RTI by submitting requests to the Student Government. Choose to submit anonymously or with your contact details." />
      <div className="mt-6">
        <RTIForm />
      </div>
    </div>
  );
}
