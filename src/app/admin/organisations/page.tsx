import PageTitle from "@/components/page-title";
import { FileStack } from "lucide-react";
import OrganisationsClient from "./organisations-client";
import { getAdminOrganizations } from "@/lib/admin/strapi-admin";

export const dynamic = 'force-dynamic';

export default async function AdminOrganisationsPage() {
  const { organizations, summary } = await getAdminOrganizations();

  return (
    <div className="pt-2 px-1 sm:px-2 md:px-4 flex flex-col gap-6">
      <PageTitle
        icon={FileStack}
        text="Manage Organisations"
        subheading="Admin overview of all campus organisations, live recruitment pipelines, and platform-wide induction stats."
      />
      <OrganisationsClient
        organisations={organizations}
        summaryMetrics={summary}
      />
    </div>
  );
}
