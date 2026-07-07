import { strapiGet } from "@/lib/apis/strapi";
import { auth } from "@/auth"; // ← this is the new v5 way
import { getUserIdByEmail } from "@/lib/userid";
import { strapiPut } from "@/lib/apis/strapi";
import { NextRequest } from "next/server";
import { uploadImageToCloudinary } from "@/lib/apis/cloudinary";

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

        return new Response(JSON.stringify({ organisation, users }), { status: 200 });
    }
    else return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
}

export async function PUT(request: NextRequest) {
    try {
        const formData = await request.formData();

        const organisationId = formData.get('organisationId') as string;
        const name = formData.get('name') as string;
        const type = formData.get('type') as string;
        const short_description = formData.get('short_description') as string;
        const description = formData.get('description') as string;
        const induction = formData.get('induction') === 'true';
        const induction_end = formData.get('induction_end') as string;
        const induction_description = formData.get('induction_description') as string;
        const instagram = formData.get('instagram') as string;
        const linkedin = formData.get('linkedin') as string;
        const twitter = formData.get('twitter') as string;
        const website_blog = formData.get('website_blog') as string;

        let circle1_humans = [];
        let circle2_humans = [];
        let members = [];
        
        try {
            circle1_humans = JSON.parse(formData.get('circle1_humans') as string || '[]');
            circle2_humans = JSON.parse(formData.get('circle2_humans') as string || '[]');
            members = JSON.parse(formData.get('members') as string || '[]');
        } catch(e) {
            console.error("Failed to parse array fields", e);
        }

        const imageFile = formData.get('image') as File | null;
        let bannerUrl = null;

        if (imageFile && imageFile.size > 0) {
            try {
                const { url } = await uploadImageToCloudinary(
                    imageFile,
                    `org-banner-${Date.now()}-${imageFile.name}`,
                    'organisations'
                );
                bannerUrl = url;
            } catch (error: any) {
                console.error('Cloudinary upload failed:', error);
                const errorMessage = error?.error?.message || "Image upload failed (Cloudinary error)";
                return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
            }
        }

        const updateData: any = {
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
        };

        if (bannerUrl) {
            updateData.banner_url = bannerUrl;
        }

        await strapiPut(`organisations/${organisationId}`, {
            data: updateData,
        });

        return new Response(JSON.stringify({ message: "Organisation updated successfully" }), { status: 200 });
    } catch (error) {
        console.error("Error updating organisation:", error);
        return new Response(JSON.stringify({ error: "Failed to update organisation" }), { status: 500 });
    }
}