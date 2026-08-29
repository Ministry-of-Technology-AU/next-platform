import { FileUser } from "lucide-react";
import PageTitle from "@/components/page-title";
import { InductionClient } from "./client";
import { cookies } from "next/headers";
import { Organization } from "../organisations-catalog/types";
import { PopulatedResponseRecord } from "@/lib/forms/strapi-forms";
import { normalizeEndDateToEndOfDay } from "@/lib/date-utils";

export const dynamic = 'force-dynamic';

async function fetchInductionData(): Promise<{ 
  organizations: Organization[]; 
  applications: PopulatedResponseRecord[];
  error: string | null;
  trackedOrgIds: string[];
  checklistItems: any[];
}> {
  try {
    const cookieStore = await cookies();
    const headers = { 'Cookie': cookieStore.toString() };
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const [orgsRes, appsRes, trackingRes, checklistRes] = await Promise.all([
      fetch(`${baseUrl}/api/platform/organisations-catalogue`, { headers, next: { revalidate: 30 } }),
      fetch(`${baseUrl}/api/platform/inductions/applications`, { headers, cache: 'no-store' }),
      fetch(`${baseUrl}/api/platform/organisations-catalogue/tracking-status`, { headers, cache: 'no-store' }),
      fetch(`${baseUrl}/api/platform/organisations-catalogue/checklist`, { headers, cache: 'no-store' }),
    ]);

    const [orgsData, appsData, trackingData, checklistData] = await Promise.all([
      orgsRes.ok ? orgsRes.json() : null,
      appsRes.ok ? appsRes.json() : null,
      trackingRes.ok ? trackingRes.json() : null,
      checklistRes.ok ? checklistRes.json() : null,
    ]);

    const allOrgs = orgsData?.success && orgsData.data?.organisations ? orgsData.data.organisations : (orgsData?.organisations || []);
    const now = Date.now();

    // An org can run several cycles at once, and each is its own recruitment
    // drive with its own roles and deadline — so each becomes its own card
    // rather than being merged into one entry per organisation.
    const cycleEntries: Organization[] = allOrgs.flatMap((org: Organization) => {
      const cycles = org.inductionCycles ?? [];
      if (cycles.length === 0) {
        return org.inductionsOpen ? [org] : [];
      }
      return cycles.map((cycle) => ({
        ...org,
        cycleId: cycle.id,
        cycleName: cycle.name ?? undefined,
        cycleDescription: cycle.description,
        inductionEnd: cycle.endDate,
        openPositions: cycle.openPositions,
        deadlineExtension: cycle.deadlineExtension,
        inductionsOpen: true,
      }));
    });

    const rawOrganizations = cycleEntries.filter((org: Organization) => {
      if (!org.inductionsOpen) return false;
      if (org.inductionEnd) {
        const endIso = normalizeEndDateToEndOfDay(org.inductionEnd);
        const endTime = endIso ? new Date(endIso).getTime() : new Date(org.inductionEnd).getTime();
        if (!isNaN(endTime) && endTime < now) return false; // Cycle has ended
      }
      return true;
    });
    
    // Sort organizations so closest upcoming deadline comes first
    const organizations = [...rawOrganizations].sort((a, b) => {
      const aIso = a.inductionEnd ? normalizeEndDateToEndOfDay(a.inductionEnd) : null;
      const bIso = b.inductionEnd ? normalizeEndDateToEndOfDay(b.inductionEnd) : null;
      const aTime = aIso ? new Date(aIso).getTime() : NaN;
      const bTime = bIso ? new Date(bIso).getTime() : NaN;

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
      if (!matchedOrg) return app;

      // With several cycles running there is no single org-level deadline to
      // borrow, and guessing would show applicants the wrong date — so the
      // form's own dates stand unless the org has exactly one open cycle. The
      // logo is org-wide either way.
      const borrowCycleDates = (matchedOrg.inductionCycles?.length ?? 0) <= 1;

      return {
        ...app,
        deadlineExtension: borrowCycleDates
          ? app.deadlineExtension || matchedOrg.deadlineExtension || null
          : app.deadlineExtension,
        form: {
          ...app.form,
          endDate: (borrowCycleDates && matchedOrg.inductionEnd) || app.form.endDate,
          organisation: {
            ...app.form.organisation,
            profile_url: matchedOrg.logoUrl || app.form.organisation.profile_url,
            induction_end: borrowCycleDates
              ? matchedOrg.inductionEnd || app.form.organisation.induction_end
              : app.form.organisation.induction_end,
            deadlineExtension: borrowCycleDates ? matchedOrg.deadlineExtension || null : null,
          },
        },
      };
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

    return { organizations, applications, error, trackedOrgIds, checklistItems };
  } catch (err) {
    console.error('Error fetching induction data:', err);
    return { 
      organizations: [], 
      applications: [],
      error: err instanceof Error ? err.message : 'An error occurred',
      trackedOrgIds: [],
      checklistItems: [],
    };
  }
}

export default async function InductionPage() {
  const { organizations, applications, error, trackedOrgIds, checklistItems } = await fetchInductionData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <InductionClient 
        initialOrganizations={organizations} 
        initialApplications={applications}
        initialError={error} 
        initialTrackedOrgIds={trackedOrgIds}
        initialChecklist={checklistItems}
      />
    </div>
  );
}
