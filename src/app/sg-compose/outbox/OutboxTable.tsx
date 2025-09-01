"use client";

import { MailPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { columns, type OutboxEmail } from "./columns";

export default function OutboxTable({ data }: { data: OutboxEmail[] }) {
  //TODO: Make the search bar and filter functional
  return (
    <div className="space-y-6">
      {/* New Mail Button */}
      <div className="flex justify-start">
        <Button asChild className="gap-2" variant="animated">
          <Link href="/sg-compose/new">
            <MailPlus className="h-4 w-4" />
            Compose New Mail
          </Link>
        </Button>
      </div>

      {/* Data Table Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-black">Outbox Status</h2>
        <DataTable
          columns={columns}
          data={data}
          searchKey="subject"
          filterColumns={["All Mails", "Pending", "Approved", "Rejected"]}
        />
      </div>
    </div>
  );
}
