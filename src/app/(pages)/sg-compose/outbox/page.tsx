"use server";
import { Inbox } from "lucide-react";
import PageTitle from "@/components/page-title";
import OutboxTable from "./OutboxTable";
import { OutboxEmail } from "./columns";

async function getData(){
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/sg-compose/outbox`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure we get fresh data
    });
    
    if (!response.ok) {
      console.error('Failed to fetch emails:', response.statusText);
      return null;
    }
    
    const result = await response.json();
    
    if (!result.data || !Array.isArray(result.data)) {
      return null;
    }
    
    return result.data.map((mail: any) => mapToOutboxEmail(mail));
  } catch (error) {
    console.error('Error fetching emails:', error);
    return null;
  }
}

function mapToOutboxEmail(data:any):OutboxEmail{
  return {
    id: data.id,
    category: data.attributes.alias.toString(),
    recipient: data.attributes.recipients,
    subject: data.attributes.subject,
    status: data.attributes.status,
    createdAt: data.attributes.createdAt,
    sentAt: data.attributes.sentAt,
    mailBody: data.attributes.mail_body,
  }
}

export default async function ComposeOutboxPage() {
  const data = await getData(); //TODO: User ID will be handled securely on the backend via JWT session
  if(!data) return <div className="container mx-auto p-6">No emails found</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageTitle
        text="SG Compose - My Outbox"
        icon={Inbox}
        subheading="View the status of all your email requests here. If your outbox contains a pending request, do not raise new requests till an approval or a rejection from the SG. Repeated spam requests will be blocked from the service or from the platform. In case of any queries, write directly to sg@ashoka.edu.in"
      />
      <OutboxTable data={data} />
    </div>
  );
}
