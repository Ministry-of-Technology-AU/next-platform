import PageTitle from "@/components/page-title";
import { CataloguePage } from "./client";
import { FileStack } from "lucide-react";
import { Organization } from "./types";
import { cookies } from "next/headers";

async function fetchOrganizations(): Promise<{ organizations: Organization[]; error: string | null }> {
  try {
    const cookieStore = await cookies();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/platform/organisations-catalogue`,
      {
        // Revalidate every hour
        next: { revalidate: 3600 },
        headers: {
          'Cookie': cookieStore.toString()
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch organizations');
    }

    const data = await response.json();

    if (data.success && data.data?.organisations) {
      return { organizations: data.data.organisations, error: null };
    } else {
      throw new Error('Invalid response format');
    }
  } catch (err) {
    console.error('Error fetching organizations:', err);
    return { 
      organizations: [], 
      error: err instanceof Error ? err.message : 'An error occurred' 
    };
  }
}

export default async function OrganisationsCatalogPage() {
  const { organizations, error } = await fetchOrganizations();

  return (
    <div className="pt-6 px-6">
      <PageTitle 
        icon={FileStack} 
        text="Organizations Catalogue" 
        subheading="Discover and join various clubs, societies, and departments on campus." 
      />
      <CataloguePage initialOrganizations={organizations} initialError={error} />
    </div>
  );
}