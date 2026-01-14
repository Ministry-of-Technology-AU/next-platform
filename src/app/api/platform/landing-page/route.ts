import { NextResponse } from "next/server";
import { strapiGet } from "@/lib/apis/strapi";

export async function GET() {
    try {
        // Fetch users data
        const adverts = await strapiGet('/advertisements', {
            sort: 'order:asc',
            filters: {
                isActive: true
            },
            populate: 'banner_image'
        });

        // We don't need to fetch recently visited from server as it's client side now
        // But we keep the structure for backwards compatibility if needed or just return null
        const recentlyVisited = null;

        const data = {
            adverts: adverts,
            recentlyVisited: recentlyVisited,
        };

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Error fetching platform data:", error);
        return NextResponse.json({
            error: 'Failed to fetch platform data'
        }, { status: 500 });
    }
}