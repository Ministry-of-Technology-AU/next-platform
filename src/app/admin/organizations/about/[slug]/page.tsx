import { redirect } from "next/navigation";

export default async function AdminOrganizationAboutRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  redirect(`/admin/organisations/about/${resolvedParams.slug}`);
}
