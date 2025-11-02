"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Eye, ArrowUpDown } from "lucide-react"
import { useState } from "react"
import { TourStep } from "@/components/guided-tour"

// Email Details Modal Component
function EmailDetailsModal({ email }: { email: OutboxEmail }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">View details</span>
            <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-semibold text-extradark">Email Details</DialogTitle>
        </DialogHeader>
        
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-dark min-w-[80px]">Category:</label>
            <Badge
              variant="default"
              className={
                email.category === "Inductions"
                  ? "bg-blue-100 text-blue-800 border-0"
                  : email.category === "Lost and Found"
                  ? "bg-yellow-100 text-yellow-800 border-0"
                  : email.category === "Surveys"
                  ? "bg-green-100 text-green-800 border-0"
                  : email.category === "Jobs and Internships"
                  ? "bg-purple-100 text-purple-800 border-0"
                  : email.category === "Campaigns"
                  ? "bg-pink-100 text-pink-800 border-0"
                  : email.category === "Fundraisers"
                  ? "bg-red-100 text-red-800 border-0"
                  : email.category === "Events and Invitations"
                  ? "bg-indigo-100 text-indigo-800 border-0"
                  : email.category === "Promotions"
                  ? "bg-teal-100 text-teal-800 border-0"
                  : "bg-gray-100 text-gray-800 border-0"
              }
            >
              {email.category || 'Unknown'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-dark min-w-[80px]">Recipients:</label>
            <p className="text-sm text-extradark">{email.recipient}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-dark min-w-[80px]">Subject:</label>
            <p className="text-sm text-extradark font-medium">{email.subject}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-dark min-w-[80px]">Status:</label>
            <Badge
              variant="default"
              className={
                email.status === "pending"
                  ? "bg-yellow-100 text-yellow-800 border-0"
                  : email.status === "approved"
                  ? "bg-green-200 text-green-900 border-0"
                  : email.status === "rejected" 
                  ? "bg-red-700 text-white border-0"
                  : email.status === "failed"
                  ? "bg-red-100 text-red-800 border-0"
                  : email.status === "draft"
                  ? "bg-gray-100 text-gray-800 border-0"
                  : "bg-gray-100 text-gray-800 border-0"
              }
            >
              {email.status}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <label className="text-lg font-semibold text-extradark">Email Content</label>
            <div 
              className="p-4 border rounded-md bg-background text-sm h-64 overflow-y-auto prose prose-sm max-w-none text-dark"
              style={{
                lineHeight: '1.6',
                fontFamily: 'inherit'
              }}
              dangerouslySetInnerHTML={{ __html: email.mailBody || '<p class="text-gray-500 italic">No content available</p>' }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type OutboxEmail = {
  id: string
  recipient: string
  subject: string
  status: "pending" | "approved" | "rejected" | "failed" | "draft"
  createdAt: string
  sentAt?: string
  category?: "Inductions" | "Lost and Found" | "Surveys" | "Jobs and Internships" | "Campaigns" | "Fundraisers" | "Events and Invitations" | "Promotions"
  mailBody?: string // Add email body field
}

export const columns: ColumnDef<OutboxEmail>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 hover:bg-transparent"
      >
        ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">{Number(row.getValue("id"))}</div>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 hover:bg-transparent"
      >
        Date of Request
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      // Use a manual format to ensure consistency across server/client
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${day}/${month}/${year}`;
      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: "recipient",
    header: "To",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("recipient")}</div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as string;
      return (
        <Badge
          variant="default"
          className={
            category === "Inductions"
              ? "bg-blue-100 text-blue-800 border-0"
              : category === "Lost and Found"
              ? "bg-yellow-100 text-yellow-800 border-0"
              : category === "Surveys"
              ? "bg-green-100 text-green-800 border-0"
              : category === "Jobs and Internships"
              ? "bg-purple-100 text-purple-800 border-0"
              : category === "Campaigns"
              ? "bg-pink-100 text-pink-800 border-0"
              : category === "Fundraisers"
              ? "bg-red-100 text-red-800 border-0"
              : category === "Events and Invitations"
              ? "bg-indigo-100 text-indigo-800 border-0"
              : category === "Promotions"
              ? "bg-teal-100 text-teal-800 border-0"
              : "bg-gray-100 text-gray-800 border-0"
          }
        >
          {category}
        </Badge>
      );
    },
  },
  {
    accessorKey: "subject",
    header: "Mail Request",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate">{row.getValue("subject")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant="default"
          className={
            status === "pending"
              ? "bg-yellow-100 text-yellow-800 border-0"
              : status === "approved"
              ? "bg-green-200 text-green-900 border-0"
              : status === "rejected" ? "bg-red-700 border-0"
              : status === "failed"
              ? "bg-red-100 text-red-800 border-0"
              : status === "draft"
              ? "bg-gray-100 text-gray-800 border-0"
              : "bg-gray-100 text-gray-800 border-0"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const email = row.original;
      return <EmailDetailsModal email={email} />;
    },
  },
];
