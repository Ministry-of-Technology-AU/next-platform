"use client";
import { useState, useEffect } from "react";
import { Shield, AlertCircle, CheckCircle } from "lucide-react";
import PageTitle from "@/components/page-title";
import { DataTable } from "@/components/data-table/data-table";
import { dashboardColumns, type DashboardEmail } from "./columns";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const [emails, setEmails] = useState<DashboardEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/platform/sg-compose/dashboard', {        
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      
      if (result.success) {
        const mappedEmails = result.data.map((mail: any) => mapToDashboardEmail(mail));
        setEmails(mappedEmails);
      } else {
        setError(result.error || 'Failed to fetch pending emails');
      }
    } catch (err) {
      console.error('Error fetching emails:', err);
      setError('Failed to fetch pending emails');
    } finally {
      setLoading(false);
    }
  };

  const mapToDashboardEmail = (data: any): DashboardEmail => {
    return {
      id: data.id,
      category: data.attributes.alias?.toString(),
      recipient: data.attributes.recipients,
      subject: data.attributes.subject,
      status: data.attributes.status,
      createdAt: data.attributes.createdAt,
      sentAt: data.attributes.sentAt,
      mailBody: data.attributes.mail_body,
      sender: data.attributes.sender?.data ? {
        id: data.attributes.sender.data.id,
        email: data.attributes.sender.data.attributes?.email || '',
        username: data.attributes.sender.data.attributes?.username || ''
      } : undefined
    };
  };

  useEffect(() => {
    fetchEmails();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = async (emailId: string) => {
    try {
      const response = await fetch('/api/platform/sg-compose/dashboard', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailId,
          action: 'approve',          
        })
      });

      const result = await response.json();

      if (result.success) {
        // Remove the approved email from the list
        setEmails(prev => prev.filter(email => email.id !== emailId));
        // You could also show a success toast here
        console.log('Email approved successfully');
      } else {
        alert(`Error approving email: ${result.error}`);
      }
    } catch (error) {
      console.error('Error approving email:', error);
      alert('Failed to approve email. Please try again.');
    }
  };

  const handleReject = async (emailId: string, rejectReason?: string) => {
    try {
      const response = await fetch('/api/platform/sg-compose/dashboard', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailId,
          action: 'reject',          
          rejectReason: rejectReason || 'No reason provided'
        })
      });

      const result = await response.json();

      if (result.success) {
        // Remove the rejected email from the list
        setEmails(prev => prev.filter(email => email.id !== emailId));
        // You could also show a success toast here
        console.log('Email rejected successfully');
      } else {
        alert(`Error rejecting email: ${result.error}`);
      }
    } catch (error) {
      console.error('Error rejecting email:', error);
      alert('Failed to reject email. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <PageTitle
          text="SG Compose - Admin Dashboard"
          icon={Shield}
          subheading="Review and approve pending email requests from students."
        />
        <Card className="p-8 text-center">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <Shield className="h-16 w-16 text-gray-400 animate-pulse" />
              <h3 className="text-xl font-semibold text-gray-600">Loading Pending Emails...</h3>
              <p className="text-gray-500 max-w-md">
                Please wait while we fetch the latest email approval requests.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <PageTitle
          text="SG Compose - Admin Dashboard"
          icon={Shield}
          subheading="Review and approve pending email requests from students."
        />
        <Card className="p-8 text-center">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-16 w-16 text-red-400" />
              <h3 className="text-xl font-semibold text-red-600">Error Loading Emails</h3>
              <p className="text-red-500 max-w-md">{error}</p>
              <button 
                onClick={() => {
                  setError(null);
                  fetchEmails();
                }} 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageTitle
        text="SG Compose - Admin Dashboard"
        icon={Shield}
        subheading="Review and approve pending email requests from students. Click on the eye icon to view full email details and approve or reject the request."
      />

      {/* Data Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Pending Email Requests</h2>
        {emails.length === 0 ? (
          <Card className="p-8 text-center">
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <CheckCircle className="h-16 w-16 text-green-400" />
                <h3 className="text-xl font-semibold text-green-600">All Caught Up!</h3>
                <p className="text-green-500 max-w-md">
                  There are no pending email requests at the moment. All submitted emails have been reviewed.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <DataTable
            columns={dashboardColumns(handleApprove, handleReject)}
            data={emails}
            searchKey="subject"
            filterColumns={["category", "sender"]}
            initialSorting={[{ id: "id", desc: false }]}
          />
        )}
      </div>
    </div>
  );
}
