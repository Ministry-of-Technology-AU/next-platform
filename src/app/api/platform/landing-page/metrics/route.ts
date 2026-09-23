import { NextResponse } from "next/server";
import { getCachedPlatformMetrics } from "@/lib/metrics/platform-metrics";

export const revalidate = 172800; // 48 hours in seconds

export async function GET() {
    try {
        const metrics = await getCachedPlatformMetrics();
        return NextResponse.json(metrics, {
            headers: {
                'Cache-Control': 'public, max-age=172800, s-maxage=172800, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        console.error("Error fetching platform metrics:", error);
        return NextResponse.json({ error: 'Failed to fetch platform metrics' }, { status: 500 });
    }
}