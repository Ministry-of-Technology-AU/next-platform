import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { strapiPut } from "@/lib/apis/strapi";
import { getUserIdByEmail } from "@/lib/userid";
import { parseGradeDataText, sanitizeCGPAData } from "@/lib/cgpa-utils";

export async function POST(request: NextRequest) {
    try {
        const { text, saveToStrapi = true } = await request.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { success: false, error: "Missing or invalid text input" },
                { status: 400 }
            );
        }

        const parsedData = parseGradeDataText(text);
        const sanitizedData = sanitizeCGPAData(parsedData);

        let userId = null;
        let strapiResponse = null;

        if (saveToStrapi) {
            const session = await auth();
            if (!session?.user?.email) {
                return NextResponse.json(
                    { success: false, error: "Authentication required to save to Strapi" },
                    { status: 401 }
                );
            }

            userId = await getUserIdByEmail(session.user.email);
            if (!userId) {
                return NextResponse.json(
                    { success: false, error: "User not found" },
                    { status: 404 }
                );
            }

            strapiResponse = await strapiPut(`/users/${userId}`, {
                cgpa_data: sanitizedData
            });
        }

        return NextResponse.json({
            success: true,
            data: sanitizedData,
            message: saveToStrapi ? "CGPA data parsed and saved successfully" : "CGPA data parsed successfully",
            savedToStrapi: saveToStrapi,
            userId,
        });

    } catch (error) {
        console.error("Error parsing CGPA data:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to parse CGPA data",
                details: (error as Error).message
            },
            { status: 500 }
        );
    }
}
