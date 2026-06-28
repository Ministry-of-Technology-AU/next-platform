import { NextRequest, NextResponse } from "next/server";
import { strapiGet } from "@/lib/apis/strapi";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ uid: string }> }
) {
    try {
        const { uid } = await params;

        if (!uid) {
            return NextResponse.json(
                { success: false, error: "UID is required" },
                { status: 400 }
            );
        }

        // Fetch timetable by UID from Strapi
        const response = await strapiGet('/when2meet-drafts', {
            filters: {
                uid: {
                    $eq: uid
                }
            },
            populate: '*'
        });

        const timetables = Array.isArray(response) ? response : (response?.data || []);

        if (timetables.length === 0) {
            return NextResponse.json(
                { success: false, error: "Timetable not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: timetables[0]
        });

    } catch (error) {
        console.error('Error fetching timetable:', error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch timetable",
                details: (error as Error).message
            },
            { status: 500 }
        );
    }
}