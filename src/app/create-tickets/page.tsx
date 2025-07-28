import CreateTickets from "./create-tickets";
import { Card } from "@/components/ui/card";

export default function CreateTicketsPage(){
    return (
      <div className="mx-4">
        <h1>Create a Ticket</h1>
        <p className="text-center">Raise a ticket to contact any set of the minsitries of AUSG!</p>
        <Card className="mt-5">
            <CreateTickets/>
        </Card>
      </div>
    );
}