import PageTitle from "@/components/page-title";
import { LayoutDashboard } from "lucide-react";
import { cookies } from "next/headers";
import DashboardClient from "./dashboard-client";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

async function fetchOrganization(slug: string) {
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
    const orgs = data?.success && data.data ? data.data : (data || []);

    // Find the organization by slug (fallback to checking name if slug isn't strictly defined)
    return orgs.find((org: any) => {
      const attrs = org.attributes || org;
      const orgSlug = attrs.slug || (attrs.name ? attrs.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'unknown-org');
      return orgSlug === slug;
    });
  } catch (err) {
    console.error('Error fetching organization for admin:', err);
    return null;
  }
}

export default async function AdminOrganizationDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const organization = await fetchOrganization(slug);

  if (!organization) {
    notFound();
  }

  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://sg.ashoka.edu.in/backend';
  const formatImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('/')) return `${strapiUrl}${url}`;
    return url;
  };

  const attrs = organization.attributes || organization;
  const orgEmail = attrs.profile?.data?.[0]?.attributes?.email || attrs.profile?.data?.attributes?.email || attrs.email;

  // Format and mock data for the dashboard
  const formattedData = {
    id: organization.id || organization.documentId,
    name: attrs.name || 'Unknown Organization',
    type: attrs.type || 'club',
    description: attrs.description || attrs.short_description || 'No description available.',
    logoUrl: formatImageUrl(attrs.profile?.data?.[0]?.attributes?.profile_url || attrs.profile?.data?.attributes?.profile_url || attrs.logoUrl),
    bannerUrl: formatImageUrl(attrs.banner?.data?.[0]?.attributes?.url || attrs.banner?.data?.attributes?.url || attrs.bannerUrl),
    email: orgEmail || null,
    inductionsOpen: !!attrs.induction,
    inductionEnd: attrs.induction_end || 'Not specified',
    teamSize: (attrs.members?.data?.length || 0) + (attrs.circle1_humans?.data?.length || 0) + (attrs.circle2_humans?.data?.length || 0),
    leadershipTier1: (attrs.circle1_humans?.data || []).map((member: any) => ({
      username: member.attributes?.username || 'Unknown User',
      email: member.attributes?.email || 'No email'
    })),
    leadershipTier2: (attrs.circle2_humans?.data || []).map((member: any) => ({
      username: member.attributes?.username || 'Unknown User',
      email: member.attributes?.email || 'No email'
    })),
    // Mock Data for charts
    applicationVolume: [
      { batch: "UG 24", volume: Math.floor(Math.random() * 100) + 20 },
      { batch: "UG 25", volume: Math.floor(Math.random() * 150) + 50 },
      { batch: "UG 26", volume: Math.floor(Math.random() * 200) + 100 },
      { batch: "UG 27", volume: Math.floor(Math.random() * 300) + 150 },
    ],
    inductionTimeline: [
      { step: "Applications Open", date: "Aug 15", status: "completed" },
      { step: "Info Session", date: "Aug 20", status: "completed" },
      { step: "Applications Close", date: "Aug 25", status: "current" },
      { step: "Interviews", date: "Sep 01 - Sep 05", status: "upcoming" },
      { step: "Decisions", date: "Sep 10", status: "upcoming" },
    ]
  };

  return (
    <div className="pt-6 px-6">
      <PageTitle
        icon={LayoutDashboard}
        text={`${formattedData.name} Dashboard`}
        subheading="Admin analytics and insights."
      />
      <DashboardClient organization={formattedData} />
    </div>
  );
}
