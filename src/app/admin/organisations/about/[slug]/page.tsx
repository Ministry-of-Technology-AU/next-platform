import PageTitle from "@/components/page-title";
import { LayoutDashboard } from "lucide-react";
import DashboardClient from "./dashboard-client";
import { notFound } from "next/navigation";
import { getAdminOrganizationDetails } from "@/lib/admin/strapi-admin";

export const dynamic = 'force-dynamic';

export default async function AdminOrganisationDashboard({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams.slug;
  const decodedSlug = decodeURIComponent(rawSlug);

  const organisation = await getAdminOrganizationDetails(decodedSlug);

  if (!organisation) {
    notFound();
  }

  return (
    <div className="pt-2 px-1 sm:px-2 md:px-4 flex flex-col gap-6">
      <PageTitle
        icon={LayoutDashboard}
        text={`${organisation.name} Dashboard`}
        subheading="Admin analytics, live induction pipeline stats, conversion metrics, and leadership roster."
      />
      <DashboardClient organisation={organisation} />
    </div>
  );
}
