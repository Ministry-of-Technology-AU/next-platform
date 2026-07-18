import { cookies } from "next/headers";
import OrganisationProfileClient from "./OrganisationProfileClient";
import DeveloperCredits from "@/components/developer-credits";
import Image from "next/image";
import PageTitle from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { Hammer } from "lucide-react";
import Link from "next/link";

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
  return (
    <>
      <OrganisationProfileClient
        organisation={organisation}
      />
      <DeveloperCredits developers={[{ name: "Aditya Kanodia", role: "Lead Developer" }, { name: "Soham Tulsyan", role: "Assistant Developer" }]} />
    </>
  );
}