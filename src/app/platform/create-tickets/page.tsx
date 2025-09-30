import CreateTickets from "./create-tickets";
import { Card } from "@/components/ui/card";
import PageTitle from "@/components/page-title";
import { Ticket } from "lucide-react";

export default function CreateTicketsPage(){
    return (
      <div className="mx-4">
        <PageTitle text="Create a Ticket" subheading="Raise a ticket to contact any set of the ministries of AUSG!" icon={Ticket}/>
        <Card className="mt-5">
            <CreateTickets/>
        </Card>
      </div>
    );
}