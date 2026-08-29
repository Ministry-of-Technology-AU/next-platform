import PageTitle from "@/components/page-title";
import { FileStack } from "lucide-react";
import { cookies } from "next/headers";
import OrganizationsClient from "./organizations-client";
import { getDerivedCycleStatus, type CycleStatus } from "@/app/organisations/inductions/types";
import { normalizeEndDateToEndOfDay } from "@/lib/date-utils";

export const dynamic = 'force-dynamic';

async function fetchOrganizations() {
  try {
    const cookieStore = await cookies();
    const headers = { 'Cookie': cookieStore.toString() };
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/organisations`, {
      headers,
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    // Return data from dummy fallback or Strapi
    return data?.success && data.data ? data.data : (data || []);
  } catch (err) {
    console.error('Error fetching organizations for admin:', err);
    return [];
  }
}

export default async function AdminOrganizationsPage() {
  const organizations = await fetchOrganizations();

  // Map to format needed for the table
  const formattedOrganizations = organizations.map((org: any) => {
    const attrs = org.attributes || org;
    const orgEmail = attrs.profile?.data?.[0]?.attributes?.email || attrs.profile?.data?.attributes?.email || attrs.email;
    const cyclesData = attrs.induction_cycles?.data || attrs.induction_cycles || [];
    const hasActiveCycle = cyclesData.some((c: any) => {
      const ca = c.attributes || c || {};
      const rawStatus = (ca.status as CycleStatus) || 'draft';
      return getDerivedCycleStatus(rawStatus, ca.start_date, ca.end_date) === 'active';
    });
    const isLegacyOpen =
      attrs.induction === true &&
      (!attrs.induction_end ||
        new Date(normalizeEndDateToEndOfDay(attrs.induction_end) || attrs.induction_end).getTime() >= Date.now());
    const activeInductions = hasActiveCycle || isLegacyOpen;

    const activeCycleWithEnd = cyclesData.find((c: any) => {
      const ca = c.attributes || c || {};
      return ca.end_date && getDerivedCycleStatus(ca.status || 'draft', ca.start_date, ca.end_date) === 'active';
    });
    const effectiveEnd = activeCycleWithEnd?.attributes?.end_date || activeCycleWithEnd?.end_date || attrs.induction_end;

    return {
      id: org.id || org.documentId || Math.random().toString(),
      name: attrs.name || 'Unknown',
      email: orgEmail || 'Not specified',
      activeInductions,
      teamSize: (attrs.members?.data?.length || 0) + (attrs.circle1_humans?.data?.length || 0) + (attrs.circle2_humans?.data?.length || 0) || Math.floor(Math.random() * 50) + 10,
      lastInducted: (() => {
        if (!effectiveEnd) return 'Unknown';
        const d = new Date(effectiveEnd);
        return isNaN(d.getTime()) ? effectiveEnd : d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      })(),
      slug: attrs.slug || (attrs.name ? attrs.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'unknown-org-' + Math.random().toString(36).substring(7))
    };
  });

  return (
    <div className="pt-6 px-6">
      <PageTitle
        icon={FileStack}
        text="Manage Organizations"
        subheading="Admin overview of all organizations on the platform."
      />
      <OrganizationsClient organizations={formattedOrganizations} />
    </div>
  );
}
