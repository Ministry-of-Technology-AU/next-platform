import { strapiGet } from "@/lib/apis/strapi";
import { auth } from "@/auth"; // ← this is the new v5 way
import { getUserIdByEmail } from "@/lib/userid";
import { strapiPut } from "@/lib/apis/strapi";
import { NextRequest } from "next/server";

export async function GET() {
    // 🔐 Get session (v5 style)
    const session = await auth();

    const email = session?.user?.email;



    // 🆔 Get user ID from email
    if (email) {
        const userId = await getUserIdByEmail(email);
        if (!userId) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const user = await strapiGet(`users/${userId}`, {
            populate: {
                organisations: {
                    populate: {
                        banner: true,
                        circle1_humans: true,
                        circle2_humans: true,
                        members: true,
                    },
                },
            },
        });

        const organisation = user?.organisations?.[0] || null;

        // 3️⃣ Fetch all students
        const users = await strapiGet("users", {
            pagination: { pageSize: 500 },
        });
        console.log(users);

        return new Response(JSON.stringify({ organisation, users }), { status: 200 });
    }
    else return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            organisationId,
            name,
            type,
            short_description,
            description,
            induction,
            induction_end,
            induction_description,
            instagram,
            linkedin,
            twitter,
            website_blog,
            circle1_humans,
            circle2_humans,
            members,
          } = body;
          

        console.log(organisationId)
        console.log("BODY RECEIVED:", body);
        console.log("circle1:", circle1_humans);
        console.log("circle2:", circle2_humans);
        console.log("members:", members);

        await strapiPut(`organisations/${organisationId}`, {
            data: {
                name,
                type,
                short_description,
                description,
                induction,
                induction_end: induction_end || null,
                induction_description,
                instagram,
                linkedin,
                twitter,
                website_blog,
                circle1_humans: {
                    set: circle1_humans?.map(Number) || [],
                },
                circle2_humans: {
                    set: circle2_humans?.map(Number) || [],
                },
                members: {
                    set: members?.map(Number) || [],
                },

            },
        });

        return new Response(JSON.stringify({ message: "Organisation updated successfully" }), { status: 200 });
    } catch (error) {
        console.error("Error updating organisation:", error);
        return new Response(JSON.stringify({ error: "Failed to update organisation" }), { status: 500 });
    }
}