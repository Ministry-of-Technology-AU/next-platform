import PageTitle from "@/components/page-title";
import { CataloguePage } from "./client";
import { FileStack } from "lucide-react";
import { Organization } from "./types";
import { cookies } from "next/headers";

// Force dynamic rendering since we're using cookies
export const dynamic = 'force-dynamic';

async function fetchCatalogData(): Promise<{ 
  organizations: Organization[]; 
  error: string | null;
  trackedOrgIds: string[];
  checklistItems: any[];
  preferences: any | null;
}> {
  try {
    const cookieStore = await cookies();
    const headers = { 'Cookie': cookieStore.toString() };
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const [orgsRes, trackingRes, checklistRes, prefsRes] = await Promise.all([
      fetch(`${baseUrl}/api/platform/organisations-catalogue`, { headers, next: { revalidate: 30 } }),
      fetch(`${baseUrl}/api/platform/organisations-catalogue/tracking-status`, { headers }),
      fetch(`${baseUrl}/api/platform/organisations-catalogue/checklist`, { headers }),
      fetch(`${baseUrl}/api/platform/organisations-catalogue/preferences`, { headers })
    ]);

    const [orgsData, trackingData, checklistData, prefsData] = await Promise.all([
      orgsRes.ok ? orgsRes.json() : null,
      trackingRes.ok ? trackingRes.json() : null,
      checklistRes.ok ? checklistRes.json() : null,
      prefsRes.ok ? prefsRes.json() : null,
    ]);

    const organizations = orgsData?.success && orgsData.data?.organisations ? orgsData.data.organisations : (orgsData?.organisations || []);
    const error = orgsData && !orgsData.success ? 'Failed to fetch organizations' : null;
    
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

    return { organizations, error, trackedOrgIds, checklistItems, preferences };
  } catch (err) {
    console.error('Error fetching catalog data:', err);
    return { 
      organizations: [], 
      error: err instanceof Error ? err.message : 'An error occurred',
      trackedOrgIds: [],
      checklistItems: [],
      preferences: null
    };
  }
}

export default async function OrganisationsCatalogPage() {
  const { organizations, error, trackedOrgIds, checklistItems, preferences } = await fetchCatalogData();

  return (
    <div className="pt-6 px-6">
      <PageTitle 
        icon={FileStack} 
        text="Organizations Catalogue" 
        subheading="Discover and join various clubs, societies, and departments on campus." 
      />
      <CataloguePage 
        initialOrganizations={organizations} 
        initialError={error} 
        initialTrackedOrgIds={trackedOrgIds}
        initialChecklist={checklistItems}
        initialPreferences={preferences}
      />
    </div>
  );
}