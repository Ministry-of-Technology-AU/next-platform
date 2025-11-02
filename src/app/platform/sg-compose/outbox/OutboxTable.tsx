"use server";

import { MailPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { columns, type OutboxEmail } from "./columns";
import { TourStep } from "@/components/guided-tour";


export default async function OutboxTable({ data }: { data: OutboxEmail[] }) {
  //TODO: Make the search bar and filter functional
  return (
    <div className="space-y-6">
      {/* New Mail Button */}
      <div className="flex justify-start">
      <TourStep id="compose-new-mail" order={1} position="bottom" content="Click here to compose and send a new mail using SG-Compose." title="Compose New Mail">
        <Button asChild className="gap-2" variant="animated">

          <Link href="/platform/sg-compose/new">
            <MailPlus className="h-4 w-4" />
            Compose New Mail
          </Link>
        </Button>
      </TourStep>

      </div>

      {/* Data Table Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Outbox Status</h2>
        <TourStep id="outbox-table" order={2} position="top" content="This table displays all the mails in your outbox along with their statuses. You can search and filter the mails as needed. Click the eye to view your draft." title="Outbox Table">
        <DataTable
          columns={columns}
          data={data}
          searchKey="subject"
          filterColumns={["All Mails", "Pending", "Approved", "Rejected"]}
          initialSorting={[{ id: "id", desc: true }]}
        />
        </TourStep>
      </div>
    </div>
  );
}
