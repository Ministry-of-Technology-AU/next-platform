import RTIForm from "./RTIForm";
import PageTitle from "@/components/page-title";
import { CollaborationBanner, type CollaborationPartner } from "@/components/collaboration-banner";
import { BadgeInfo } from "lucide-react";

const PARTNERS: CollaborationPartner[] = [
  {
    name: "Student Government",
    role: "SG of Ashoka University",
    logo: "https://lh3.googleusercontent.com/a/ACg8ocKmE0NwuHcrCX-o3X3AF9Yhxu-dh8idAf_loNITDxVlRG6HfLmv=s96-c",
  },
];

export default function SGRTIPage() {
  return (
    <div className="pt-6 px-6">
      <CollaborationBanner
        partners={PARTNERS}
        message="Submit your RTI requests directly to the Student Government."
        className="mb-4 sm:mb-6"
      />
      <PageTitle icon={BadgeInfo} text="SG: Request for Information (RTI)" subheading="Excercise your RTI by submitting requests to the Student Government. Choose to submit anonymously or with your contact details." />
      <div className="mt-6">
        <RTIForm />
      </div>
    </div>
  );
}
