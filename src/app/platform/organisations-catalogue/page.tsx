import { GalleryHorizontalEnd } from "lucide-react";
import PageTitle from "@/components/page-title";
import OrganisationsCatalogueClient from "./client";
import { cookies } from "next/headers";

export default async function OrganisationsCataloguePage() {
  let organisations: any[] = [];
  let error: string | null = null;

  try {
    const cookieStore = await cookies();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/platform/organisation-catalogue`, {
      cache: 'no-store',
      headers: { 'Cookie': cookieStore.toString() },
    });
    
    if (response.ok) {
      const json = await response.json();
      organisations = json.organisations || [];
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="container px-4 py-8 space-y-8">
      {/* ✅ Static server-rendered section */}
      <PageTitle
        text="Organisations Catalogue"
        icon={GalleryHorizontalEnd}
        subheading="Find and connect with all 73 student organizations through our catalogue—featuring clubs, societies, fests, collectives, ISOs, leagues, and more!"
      />

      {/* ✅ Client-side interactive section */}
      <OrganisationsCatalogueClient
        organisations={organisations}
        error={error}
      />

      {/* ✅ Static footer/dev credits */}
      <footer className="pt-12 text-center text-sm text-muted-foreground">
        Built with ❤️ by Ashoka Devs
      </footer>
    </div>
  );
}
