"use server";
import { CodeXml, Inbox } from "lucide-react";
import PageTitle from "@/components/page-title";
import OutboxTable from "./OutboxTable";
import { OutboxEmail } from "./columns";
import {strapiGet} from "@/apis/strapi";

async function getData(userEmail:string){
  if(!userEmail) return null;
  const data = await strapiGet(
    `/users?filters[email][$eqi]=${userEmail}&populate=sg_mails`
  );
  const mails = data[0]?.sg_mails;
  if(!mails) return null;
  return mails.map((mail:any)=>mapToOutboxEmail(mail));
}

function mapToOutboxEmail(data:any):OutboxEmail{
  console.log(data.alias);
  return {
    id: data.id,
    category: data.alias.toString(),
    recipient: data.recipients,
    subject: data.subject,
    status: data.status,
    createdAt: data.createdAt,
    sentAt: data.sentAt,
  }
}

export default async function ComposeOutboxPage() {
  const data = await getData("ibrahim.khalil_ug25@ashoka.edu.in"); //TODO: Replace with actual user email from session
  if(!data) return <div className="container mx-auto p-6">No data found</div>;

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
