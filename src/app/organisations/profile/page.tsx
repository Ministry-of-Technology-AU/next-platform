import { cookies } from "next/headers";
import OrganisationProfileClient from "./OrganisationProfileClient";
import DeveloperCredits from "@/components/developer-credits";

async function getData() {
  const cookieStore = await cookies();

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/organisations/profile`, {
    cache: 'no-store',
    headers: { 'Cookie': cookieStore.toString() },
  });
  const data = await response?.json();

  return data;
}

export default async function OrganisationProfilePage() {

  const data = await getData();
  const organisation = data?.organisation;
  const users = data?.users;

  return (
    <>
      <OrganisationProfileClient
        organisation={organisation}
        users={users}
      />
      <DeveloperCredits developers={[{ name: "Aditya Kanodia", role: "Lead Developer" }, { name: "Soham Tulsyan", role: "Assistant Developer" }]} />
    </>
  );
}
