import { NextRequest, NextResponse } from "next/server";
import { strapiPut, strapiGet } from "@/lib/apis/strapi";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser();

        if (!user || !user.email) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { state } = body;

        if (!state) {
            return NextResponse.json(
                { success: false, error: "Missing state data" },
                { status: 400 }
            );
        }

        // 1. Get user ID from Strapi using email
        // We filter by email to find the correct user.
        const userResponse = await strapiGet("users", {
            filters: {
                email: user.email
            }
        });

        const users = Array.isArray(userResponse) ? userResponse : (userResponse as any)?.results || [];
        const strapiUser = users[0];

        if (!strapiUser) {
            return NextResponse.json(
                { success: false, error: "User not found in backend" },
                { status: 404 }
            );
        }

        // 2. Update the user's course_trajectory
        // Schema says 'course_trajectory' is type 'json'.
        // We update /users/:id

        const updateResponse = await strapiPut(`users/${strapiUser.id}`, {
            course_trajectory: state
        });

        return NextResponse.json({
            success: true,
            message: "Trajectory saved successfully",
            data: updateResponse
        });

    } catch (error) {
        console.error("Error saving trajectory:", error);
        return NextResponse.json(
            { success: false, error: "Failed to save trajectory" },
            { status: 500 }
        );
    }
}
