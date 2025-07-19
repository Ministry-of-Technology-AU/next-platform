"use client"

import * as React from "react"
import Link from "next/link"
import { MailPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { columns, type OutboxEmail } from "./columns"

// Sample data
const sampleData: OutboxEmail[] = [
  {
    id: "1",
    recipient: "john.doe@ashoka.edu.in",
    subject: "Welcome to the new semester",
    status: "sent",
    createdAt: "2024-01-15T10:30:00Z",
    sentAt: "2024-01-15T10:35:00Z",
    priority: "normal",
  },
  {
    id: "2",
    recipient: "jane.smith@ashoka.edu.in",
    subject: "Important: Course registration deadline",
    status: "pending",
    createdAt: "2024-01-16T14:20:00Z",
    priority: "high",
  },
  {
    id: "3",
    recipient: "student.affairs@ashoka.edu.in",
    subject: "Event announcement - Cultural fest",
    status: "failed",
    createdAt: "2024-01-14T09:15:00Z",
    priority: "normal",
  },
  {
    id: "4",
    recipient: "faculty@ashoka.edu.in",
    subject: "Faculty meeting agenda",
    status: "draft",
    createdAt: "2024-01-17T16:45:00Z",
    priority: "low",
  },
  {
    id: "5",
    recipient: "admissions@ashoka.edu.in",
    subject: "Application review process update",
    status: "sent",
    createdAt: "2024-01-13T11:00:00Z",
    sentAt: "2024-01-13T11:05:00Z",
    priority: "high",
  },
]

export default function ComposeOutbox() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">SG Compose</h1>
        <p className="text-muted-foreground">
          Manage and track your outgoing emails and communications
        </p>
      </div>

      {/* New Mail Button */}
      <div className="flex justify-start">
        <Button asChild className="gap-2">
          <Link href="/sg-compose/new">
            <MailPlus className="h-4 w-4" />
            Compose New Mail
          </Link>
        </Button>
      </div>

      {/* Data Table Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Outbox Status</h2>
        <DataTable
          columns={columns}
          data={sampleData}
          searchKey="subject"
          filterColumns={["status", "priority", "recipient"]}
        />
      </div>
    </div>
  )
}