"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"

export type OutboxEmail = {
  id: string
  recipient: string
  subject: string
  status: "pending" | "approved" | "failed" | "draft"
  createdAt: string
  sentAt?: string
  category?: "Inductions" | "Lost and Found" | "Surveys" | "Jobs and Internships" | "Campaigns" | "Fundraisers" | "Events and Invitations" | "Promotions"
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
      return <div>{date.toLocaleDateString()}</div>;
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
              ? "bg-blue-100 text-blue-800"
              : category === "Lost and Found"
              ? "bg-yellow-100 text-yellow-800"
              : category === "Surveys"
              ? "bg-green-100 text-green-800"
              : category === "Jobs and Internships"
              ? "bg-purple-100 text-purple-800"
              : category === "Campaigns"
              ? "bg-pink-100 text-pink-800"
              : category === "Fundraisers"
              ? "bg-red-100 text-red-800"
              : category === "Events and Invitations"
              ? "bg-indigo-100 text-indigo-800"
              : category === "Promotions"
              ? "bg-teal-100 text-teal-800"
              : "bg-gray-100 text-gray-800"
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
              ? "bg-yellow-100 text-yellow-800"
              : status === "approved"
              ? "bg-green-200 text-green-900"
              : status === "rejected" ? "bg-red-700"
              : status === "failed"
              ? "bg-red-100 text-red-800"
              : status === "draft"
              ? "bg-gray-100 text-gray-800"
              : "bg-gray-100 text-gray-800"
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
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(email.id)}
            >
              Copy email ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Resend email</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
