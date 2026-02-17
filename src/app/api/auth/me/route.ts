import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: "Not authenticated" },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            email: session.user.email,
            user: session.user
        });
    } catch (error) {
        console.error('Error fetching current user:', error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch user",
                details: (error as Error).message
            },
            { status: 500 }
        );
    }
}