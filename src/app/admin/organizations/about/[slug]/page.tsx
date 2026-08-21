import PageTitle from "@/components/page-title";
import { LayoutDashboard } from "lucide-react";
import { cookies } from "next/headers";
import DashboardClient from "./dashboard-client";
import { notFound } from "next/navigation";
import { listCyclesByOrg, getCycleById } from "@/lib/inductions/strapi-inductions";
import { strapiGet } from "@/lib/apis/strapi";

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

async function getOrganizationAnalytics(orgId: number, orgAttrs: any) {
  // 1. Get real application volume grouped by batch from database
  const batchCounts: Record<string, number> = {
    'UG 24': 0,
    'UG 25': 0,
    'UG 26': 0,
    'UG 27': 0,
    'Other': 0,
  };

  try {
    const responses = await strapiGet('/form-responses', {
      filters: {
        form: {
          organisation: { id: { $eq: orgId } },
        },
      },
      populate: {
        respondent: { fields: ['batch', 'email'] },
      },
      pagination: { pageSize: 500 },
    });

    const items = responses?.data || [];
    for (const item of items) {
      const a = item.attributes || item;
      const resp = a.respondent?.data?.attributes || a.respondent || {};
      const batch = (resp.batch || '').toUpperCase();
      const email = (a.respondent_email || resp.email || '').toLowerCase();

      if (batch.includes('24') || email.includes('_ug24') || email.includes('_ug2024')) {
        batchCounts['UG 24']++;
      } else if (batch.includes('25') || email.includes('_ug25') || email.includes('_ug2025')) {
        batchCounts['UG 25']++;
      } else if (batch.includes('26') || email.includes('_ug26') || email.includes('_ug2026')) {
        batchCounts['UG 26']++;
      } else if (batch.includes('27') || email.includes('_ug27') || email.includes('_ug2027')) {
        batchCounts['UG 27']++;
      } else {
        batchCounts['Other']++;
      }
    }
  } catch (err) {
    console.error('Error fetching org responses for admin analytics:', err);
  }

  const applicationVolume = [
    { batch: "UG 24", volume: batchCounts['UG 24'] },
    { batch: "UG 25", volume: batchCounts['UG 25'] },
    { batch: "UG 26", volume: batchCounts['UG 26'] },
    { batch: "UG 27", volume: batchCounts['UG 27'] },
  ];
  if (batchCounts['Other'] > 0) {
    applicationVolume.push({ batch: "Other", volume: batchCounts['Other'] });
  }

  // 2. Get real timeline from active induction cycle
  let timeline: any[] = [];
  try {
    const cycles = await listCyclesByOrg(orgId);
    if (cycles.length > 0) {
      const activeCycle = await getCycleById(cycles[0].id);
      if (activeCycle && (activeCycle as any).timeline?.length > 0) {
        timeline = (activeCycle as any).timeline.map((step: any) => ({
          step: step.title || step.step || 'Milestone',
          date: step.date ? new Date(step.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'TBD',
          status: step.status || 'upcoming',
        }));
      } else if (activeCycle?.startDate || activeCycle?.endDate) {
        timeline = [
          {
            step: "Applications Open",
            date: activeCycle.startDate ? new Date(activeCycle.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Started',
            status: "completed",
          },
          {
            step: "Applications Close",
            date: activeCycle.endDate ? new Date(activeCycle.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'TBD',
            status: activeCycle.endDate && new Date(activeCycle.endDate) < new Date() ? 'completed' : 'current',
          },
        ];
      }
    }
  } catch (err) {
    console.error('Error fetching timeline for admin analytics:', err);
  }

  if (timeline.length === 0) {
    if (orgAttrs.induction_end) {
      timeline = [
        { step: "Applications Open", date: "Announced", status: "completed" },
        {
          step: "Applications Close",
          date: new Date(orgAttrs.induction_end).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          status: new Date(orgAttrs.induction_end) < new Date() ? 'completed' : 'current',
        },
      ];
    } else {
      timeline = [
        { step: "Applications Open", date: "TBD", status: "upcoming" },
        { step: "Applications Close", date: "TBD", status: "upcoming" },
      ];
    }
  }

  return { applicationVolume, timeline };
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
  const orgId = Number(organization.id || organization.documentId);

  const { applicationVolume, timeline } = await getOrganizationAnalytics(orgId, attrs);

  // Format real data for the dashboard
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
    applicationVolume,
    inductionTimeline: timeline,
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
