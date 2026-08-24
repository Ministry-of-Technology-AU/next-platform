import { FileUser } from "lucide-react";
import PageTitle from "@/components/page-title";
import { InductionClient } from "./client";
import { cookies } from "next/headers";
import { Organization } from "../organisations-catalog/types";
import { PopulatedResponseRecord } from "@/lib/forms/strapi-forms";

export const dynamic = 'force-dynamic';

async function fetchInductionData(): Promise<{ 
  organizations: Organization[]; 
  applications: PopulatedResponseRecord[];
  error: string | null;
  trackedOrgIds: string[];
  checklistItems: any[];
  preferences: any | null;
}> {
  try {
    const cookieStore = await cookies();
    const headers = { 'Cookie': cookieStore.toString() };
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const [orgsRes, appsRes, trackingRes, checklistRes, prefsRes] = await Promise.all([
      fetch(`${baseUrl}/api/platform/organisations-catalogue`, { headers, next: { revalidate: 30 } }),
      fetch(`${baseUrl}/api/platform/inductions/applications`, { headers, cache: 'no-store' }),
      fetch(`${baseUrl}/api/platform/organisations-catalogue/tracking-status`, { headers, cache: 'no-store' }),
      fetch(`${baseUrl}/api/platform/organisations-catalogue/checklist`, { headers, cache: 'no-store' }),
      fetch(`${baseUrl}/api/platform/organisations-catalogue/preferences`, { headers, cache: 'no-store' })
    ]);

    const [orgsData, appsData, trackingData, checklistData, prefsData] = await Promise.all([
      orgsRes.ok ? orgsRes.json() : null,
      appsRes.ok ? appsRes.json() : null,
      trackingRes.ok ? trackingRes.json() : null,
      checklistRes.ok ? checklistRes.json() : null,
      prefsRes.ok ? prefsRes.json() : null,
    ]);

    const allOrgs = orgsData?.success && orgsData.data?.organisations ? orgsData.data.organisations : (orgsData?.organisations || []);
    const now = Date.now();
    const rawOrganizations = allOrgs.filter((org: Organization) => {
      if (!org.inductionsOpen) return false;
      if (org.inductionEnd) {
        const endTime = new Date(org.inductionEnd).getTime();
        if (!isNaN(endTime) && endTime < now) return false; // Cycle has ended
      }
      return true;
    });
    
    // Sort organizations so closest upcoming deadline comes first
    const organizations = [...rawOrganizations].sort((a, b) => {
      const aTime = a.inductionEnd ? new Date(a.inductionEnd).getTime() : NaN;
      const bTime = b.inductionEnd ? new Date(b.inductionEnd).getTime() : NaN;

      const aValid = !isNaN(aTime);
      const bValid = !isNaN(bTime);
      const aUpcoming = aValid && aTime >= now;
      const bUpcoming = bValid && bTime >= now;

      if (aUpcoming && bUpcoming) return aTime - bTime;
      if (aUpcoming && !bUpcoming) return -1;
      if (!aUpcoming && bUpcoming) return 1;
      if (aValid && !bValid) return -1;
      if (!aValid && bValid) return 1;
      return a.name.localeCompare(b.name);
    });
    
    let rawApplications = appsData?.success && appsData.data?.applications ? appsData.data.applications : [];
    
    // Map the organization's Google photo (logoUrl) directly to applications so it matches the catalogue page exactly
    const orgMap = new Map<string, Organization>();
    for (const org of allOrgs) {
      if (org.id) orgMap.set(org.id.toString(), org);
      if (org.name) orgMap.set(org.name.toLowerCase().trim(), org);
    }

    const applications = rawApplications.map((app: PopulatedResponseRecord) => {
      if (!app.form?.organisation) return app;
      const orgId = app.form.organisation.id?.toString();
      const orgName = app.form.organisation.name?.toLowerCase().trim();
      const matchedOrg = (orgId ? orgMap.get(orgId) : null) || (orgName ? orgMap.get(orgName) : null);
      if (matchedOrg) {
        return {
          ...app,
          deadlineExtension: app.deadlineExtension || matchedOrg.deadlineExtension || null,
          form: {
            ...app.form,
            endDate: matchedOrg.inductionEnd || app.form.endDate,
            organisation: {
              ...app.form.organisation,
              profile_url: matchedOrg.logoUrl || app.form.organisation.profile_url,
              induction_end: matchedOrg.inductionEnd || app.form.organisation.induction_end,
              deadlineExtension: matchedOrg.deadlineExtension || null,
            },
          },
        };
      }
      return app;
    });
    
    const error = (!orgsData?.success || !appsData?.success) ? 'Failed to fetch some induction data' : null;
    
    const trackedOrgIds = trackingData?.success && Array.isArray(trackingData.trackedOrgIds) 
      ? trackingData.trackedOrgIds : [];
      
    let checklistItems = [];
    if (checklistData?.success && Array.isArray(checklistData.checklist)) {
      checklistItems = checklistData.checklist.map((item: any) => ({
        id: item.name.toLowerCase().replace(/\s+/g, '-'),
        label: item.name,
        deadline: item.deadline,
        completed: item.isDone,
      }));
    }

    const preferences = prefsData?.success && prefsData.preferences ? prefsData.preferences : null;

    return { organizations, applications, error, trackedOrgIds, checklistItems, preferences };
  } catch (err) {
    console.error('Error fetching induction data:', err);
    return { 
      organizations: [], 
      applications: [],
      error: err instanceof Error ? err.message : 'An error occurred',
      trackedOrgIds: [],
      checklistItems: [],
      preferences: null
    };
  }
}

export default async function InductionPage() {
  const { organizations, applications, error, trackedOrgIds, checklistItems, preferences } = await fetchInductionData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <InductionClient 
        initialOrganizations={organizations} 
        initialApplications={applications}
        initialError={error} 
        initialTrackedOrgIds={trackedOrgIds}
        initialChecklist={checklistItems}
        initialPreferences={preferences}
      />
    </div>
  );
}
