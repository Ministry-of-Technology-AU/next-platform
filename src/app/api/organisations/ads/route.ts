import { NextResponse } from 'next/server';
import { strapiGet } from '@/lib/apis/strapi';
import { auth } from '@/auth';
import { getUserIdByEmail, getOrganisationIdByUserId } from '@/lib/userid';

/**
 * GET /api/organisations/ads
 * Fetch all ads belonging to the current user's organisation
 * This is a secure backend route - user ID cannot be spoofed
 */
export async function GET() {
    try {
        // Get current user session
        const session = await auth();
        const email = session?.user?.email;

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'User not authenticated', data: [] },
                { status: 401 }
            );
        }
        console.log("Email: ", email);

        // Get Strapi user ID from email (backend only - secure)
        const userId = await getUserIdByEmail(email);

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User not found in system', data: [] },
                { status: 404 }
            );
        }
        else console.log("User ID: ", userId)

        // Get organisation ID from user ID
        const organisationId = await getOrganisationIdByUserId(userId);

        if (!organisationId) {
            // User not in an organisation - return empty array
            return NextResponse.json({
                success: true,
                data: []
            });
        }
        else console.log("Organisation ID: ", organisationId)

        // Fetch ads belonging to this organisation
        const response = await strapiGet('/advertisements', {
            filters: {
                organisation: {
                    id: {
                        $eq: organisationId
                    }
                }
            },
            sort: 'order:asc',
            publicationState: 'preview' // Get both draft and published
        });

        console.log('[GET ADS] Raw Strapi response:', JSON.stringify(response, null, 2));

        const ads = response?.data || [];

        console.log(`[GET ADS] Found ${ads.length} ad(s) for organisation ${organisationId}`);

        return NextResponse.json({
            success: true,
            data: ads
        });

    } catch (error) {
        console.error('Failed to fetch organisation ads:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch ads',
                data: []
            },
            { status: 500 }
        );
    }
}
