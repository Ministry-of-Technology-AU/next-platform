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
  DialogFooter,
} from "@/components/ui/dialog"
import { Eye, ArrowUpDown } from "lucide-react"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"

export type DashboardEmail = {
  id: string
  recipient: string
  subject: string
  status: "pending" | "approved" | "rejected" | "failed" | "draft"
  createdAt: string
  sentAt?: string
  category?: "Inductions" | "Lost and Found" | "Surveys" | "Jobs and Internships" | "Campaigns" | "Fundraisers" | "Events and Invitations" | "Promotions"
  mailBody?: string
  sender?: {
    id: string
    email: string
    username: string
  }
}

// Email Details Modal Component with Approve/Reject functionality
function EmailDetailsModal({ email, onApprove, onReject }: { 
  email: DashboardEmail, 
  onApprove: (emailId: string) => void,
  onReject: (emailId: string, rejectReason?: string) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  
  const handleApprove = async () => {
    setIsProcessing(true);
    await onApprove(email.id);
    setIsProcessing(false);
    setIsOpen(false);
  };
  
  const handleReject = async () => {
    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    
    setIsProcessing(true);
    await onReject(email.id, rejectReason);
    setIsProcessing(false);
    setIsOpen(false);
    setShowRejectInput(false);
    setRejectReason('');
  };
  
  const handleCancelReject = () => {
    setShowRejectInput(false);
    setRejectReason('');
  };
  
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
          <DialogTitle className="text-2xl font-semibold text-extradark">Email Approval Request</DialogTitle>
        </DialogHeader>
        
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-dark min-w-[80px]">Sender:</label>
            <p className="text-sm text-extradark">
              {email.sender?.username || 'Unknown User'} ({email.sender?.email || 'No email'})
            </p>
          </div>
          
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
          
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-dark min-w-[80px]">Submitted:</label>
            <p className="text-sm text-extradark">
              {new Date(email.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        {/* Fixed footer with buttons */}
        <DialogFooter className="flex-shrink-0 pt-4 border-t space-y-3">
          {showRejectInput && (
            <div className="w-full space-y-2">
              <label className="text-sm font-medium text-dark">Reason for rejection:</label>
              <Textarea
                placeholder="Please provide a reason for rejecting this email request..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full"
                rows={3}
              />
            </div>
          )}
          
          <div className="flex gap-3 w-full">
            {showRejectInput ? (
              <>
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancelReject}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 border-red-500 text-red-600 hover:bg-red-50 bg-transparent"
                  onClick={handleReject}
                  disabled={isProcessing || !rejectReason.trim()}
                >
                  {isProcessing ? 'Processing...' : 'Confirm Rejection'}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline"
                  className="flex-1 border-red-500 text-red-600 hover:bg-red-50 bg-transparent"
                  onClick={handleReject}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Reject Email'}
                </Button>
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  onClick={handleApprove}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Approve Email'}
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const dashboardColumns: (onApprove: (emailId: string) => void, onReject: (emailId: string, rejectReason?: string) => void) => ColumnDef<DashboardEmail>[] = (onApprove, onReject) => [
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
        Submitted
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: "sender",
    header: "Sender",
    cell: ({ row }) => {
      const sender = row.getValue("sender") as DashboardEmail["sender"];
      return (
        <div>
          <div className="font-medium text-sm">{sender?.username || 'Unknown'}</div>
          <div className="text-xs text-gray-500">{sender?.email || 'No email'}</div>
        </div>
      );
    },
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
    accessorKey: "recipient",
    header: "Recipients",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-sm">{row.getValue("recipient")}</div>
    ),
  },
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">{row.getValue("subject")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const email = row.original;
      return <EmailDetailsModal email={email} onApprove={onApprove} onReject={onReject} />;
    },
  },
];
