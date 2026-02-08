// app/api/platform/when2meet/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { strapiGet, strapiPost, strapiPut } from "@/lib/apis/strapi";
import { getUserIdByEmail } from "@/lib/userid";
import { TimeTableDraft } from "@/app/platform/when2meet/types";

export async function GET(request: NextRequest) {
    try {
        const uid = request.headers.get('uid');

        if (!uid) {
            return NextResponse.json(
                { success: false, error: "UID is required" },
                { status: 400 }
            );
        }

        // Fetch timetable by UID from Strapi
        const response = await strapiGet('/time-table-drafts', {
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

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 }
            );
        }

        const userId = await getUserIdByEmail(session.user.email);
        if (!userId) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const timetableData: TimeTableDraft = body.timetable;

        // Generate UID if not provided
        if (!timetableData.grid.uid) {
            const { v4: uuidv4 } = await import('uuid');
            timetableData.grid.uid = uuidv4();
        }

        // Set owner to current user
        timetableData.grid.owner = userId.toString();

        // Create timetable in Strapi
        const response = await strapiPost('/when2meet-drafts', {
            data: {
                title: timetableData.title,
                grid: timetableData.grid,
                uid: timetableData.grid.uid
            }
        });

        return NextResponse.json({
            success: true,
            data: response,
            uid: timetableData.grid.uid
        });

    } catch (error) {
        console.error('Error creating timetable:', error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to create timetable",
                details: (error as Error).message
            },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 }
            );
        }

        const userId = await getUserIdByEmail(session.user.email);
        if (!userId) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { uid, timetable } = body;

        if (!uid) {
            return NextResponse.json(
                { success: false, error: "UID is required" },
                { status: 400 }
            );
        }

        // Fetch existing timetable to verify ownership
        const existing = await strapiGet('/time-table-drafts', {
            filters: {
                uid: {
                    $eq: uid
                }
            }
        });

        const timetables = Array.isArray(existing) ? existing : (existing?.data || []);

        if (timetables.length === 0) {
            return NextResponse.json(
                { success: false, error: "Timetable not found" },
                { status: 404 }
            );
        }

        const existingTimetable = timetables[0];

        // Verify ownership
        if (existingTimetable.attributes?.grid?.owner !== userId.toString()) {
            return NextResponse.json(
                { success: false, error: "Not authorized to update this timetable" },
                { status: 403 }
            );
        }

        // Update timetable
        const response = await strapiPut(`/time-table-drafts/${existingTimetable.id}`, {
            data: {
                title: timetable.title,
                grid: timetable.grid
            }
        });

        return NextResponse.json({
            success: true,
            data: response
        });

    } catch (error) {
        console.error('Error updating timetable:', error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to update timetable",
                details: (error as Error).message
            },
            { status: 500 }
        );
    }
}