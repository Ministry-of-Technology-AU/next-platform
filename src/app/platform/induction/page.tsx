import { FileStack } from "lucide-react";
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
    const organizations = allOrgs.filter((org: Organization) => org.inductionsOpen === true);
    
    const applications = appsData?.success && appsData.data?.applications ? appsData.data.applications : [];
    
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
    <div className="pt-6 px-6">
      <PageTitle 
        icon={FileStack} 
        text="Student Inductions" 
        subheading="Track your ongoing applications and discover organizations currently recruiting." 
      />
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
