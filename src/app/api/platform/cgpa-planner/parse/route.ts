import { NextRequest, NextResponse } from "next/server";
import { parseGradeDataText, sanitizeCGPAData } from "@/lib/cgpa-utils";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function withCors(response: NextResponse) {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => response.headers.set(key, value));
    return response;
}

function jsonResponse(body: unknown, status = 200) {
    return withCors(NextResponse.json(body, { status }));
}

export async function OPTIONS() {
    return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const text = typeof body?.text === "string" ? body.text : "";

        if (!text.trim()) {
            return jsonResponse({ success: false, error: "Missing or invalid text input" }, 400);
        }

        const parsedData = parseGradeDataText(text);
        const sanitizedData = sanitizeCGPAData(parsedData);

        return jsonResponse({
            success: true,
            data: sanitizedData,
            message: "CGPA data parsed successfully",
        });

    } catch (error) {
        console.error("Error parsing CGPA data:", error);
        return jsonResponse(
            {
                success: false,
                error: "Failed to parse CGPA data",
                details: (error as Error).message
            },
            500
        );
    }
}
