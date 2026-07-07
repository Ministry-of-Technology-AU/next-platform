import OrganisationProfileClient from "./OrganisationProfileClient";
import DeveloperCredits from "@/components/developer-credits";
import Image from "next/image";
import PageTitle from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { Hammer } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { getUserIdByEmail } from "@/lib/userid";
import { strapiGet } from "@/lib/apis/strapi";

async function getData() {
  const session = await auth();
  const email = session?.user?.email;

  if (email) {
    const userId = await getUserIdByEmail(email);
    if (!userId) return { organisation: null, users: [] };

    const user = await strapiGet(`users/${userId}`, {
      populate: {
        organisations: {
          populate: {
            circle1_humans: true,
            circle2_humans: true,
            members: true,
          },
        },
      },
    });

    const organisation = user?.organisations?.[0] || null;

    const users = await strapiGet("users", {
      pagination: { pageSize: 500 },
    });

    return { organisation, users };
  }
  return { organisation: null, users: [] };
}

export default async function OrganisationProfilePage() {

  const data = await getData();
  const organisation = data?.organisation;
  const users = data?.users;

  // return (
  //   <>
  //     <OrganisationProfileClient
  //       organisation={organisation}
  //       users={users}
  //     />
  //     <DeveloperCredits developers={[{ name: "Aditya Kanodia", role: "Lead Developer" }, { name: "Soham Tulsyan", role: "Assistant Developer" }]} />
  //   </>
  // );

  return (
    <div className="container pt-12 px-8 flex flex-col items-center">
      <PageTitle text="This page is under construction" icon={Hammer} subheading="We're working hard to get this page ready for you. Stay tuned!" />
      <Image
        src="/mascot-construction.png"
        alt="Mascot Under Construction"
        width={400}
        height={900}
        className="mx-auto"
      />
      <div className="flex flex-col items-center">

        <p className="text-center">You're probably here looking for the platform.</p>
        <Button
          asChild
          className="mt-4 text-sm sm:text-base px-4 sm:px-6"
        >
          <Link href="/platform">
            Here&apos;s a button to get you there!
          </Link>
        </Button>
      </div>
      <p className="text-center pt-10 text-muted-foreground">We're revamping the SG Website too! Stay tuned!</p>

    </div>

  );
}