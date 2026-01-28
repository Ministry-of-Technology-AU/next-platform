import { NextResponse } from "next/server";
import { strapiGet } from "@/lib/apis/strapi";
// The Advertisement type from types.ts is the Strapi response structure,
// so we ensure the data returned from strapiGet conforms to it.
// import { Advertisement } from "@/components/landing-page/data/types"; // Not strictly needed for runtime, but good for type checking if we were to process further.

export async function GET() {
    try {
        // Fetch advertisements with explicit sorting
        // Only published ads will be returned by default in Strapi
        const response = await strapiGet('/advertisements', {
            sort: 'order:asc'
        });

        // Check if we have any active advertisements in the response.
        // Strapi responses typically have a 'data' array.
        const hasAdverts = response?.data && response.data.length > 0;

        // If we have adverts, they are already sorted and filtered by the Strapi query.
        // We pass the full Strapi response object (e.g., { data: [...], meta: {...} }) as 'adverts'.
        // If no adverts are found, we send null. This signals the client to fall back to static entries.
        const adverts = hasAdverts ? response : null;

        const data = {
            adverts: adverts,
            // Recently visited data is now handled client-side, so we return null from the server.
            recentlyVisited: null,
        };

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Error fetching platform data:", error);
        // In case of an error during fetching, return null for adverts.
        // This allows the client to gracefully fall back to static banners
        // instead of the entire page failing.
        return NextResponse.json({
            adverts: null, // Return null for adverts on error to allow client fallback
            recentlyVisited: null,
            error: 'Failed to fetch platform data'
        }, { status: 200 }); // Return 200 OK even on soft error to allow client to process partial data
    }
}