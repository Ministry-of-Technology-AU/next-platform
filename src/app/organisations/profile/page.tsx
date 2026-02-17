import { strapiGet } from "@/lib/apis/strapi";
import { cookies } from "next/headers";
import OrganisationProfileClient from "./OrganisationProfileClient";

async function getData() {
  const cookieStore = await cookies();

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/organisations/profile`, {
    cache: 'no-store',
    headers: { 'Cookie': cookieStore.toString() },
  });

  console.log(response);
  const data = await response?.json();

  return data;
}

export default async function OrganisationProfilePage() {

  const data = await getData();
  const organisation = data?.organisation;
  const users = data?.users;

  return (
    <OrganisationProfileClient
      organisation={organisation}
      users={users}
    />
  );
}
