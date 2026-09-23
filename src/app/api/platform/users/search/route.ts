import { strapiGet } from "@/lib/apis/strapi";
import { auth } from "@/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
        return new Response(JSON.stringify({ users: [] }), { status: 200 });
    }

    try {
        const users = await strapiGet("users", {
            filters: {
                $or: [
                    { username: { $containsi: query } },
                    { email: { $containsi: query } }
                ]
            },
            pagination: { pageSize: 20 },
        });

        return new Response(JSON.stringify({ users }), { status: 200 });
    } catch (error) {
        console.error("Error searching users:", error);
        return new Response(JSON.stringify({ error: "Failed to search users" }), { status: 500 });
    }
}