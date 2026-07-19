// A strapi get function which returns the user id of the user with the given email
import { strapiGet } from "@/lib/apis/strapi";

export async function getUserIdByEmail(email: string): Promise<number | null> {
    if (email.trim() === '') {
        return null;
    }
    try {
        const response = await strapiGet('/users', {
            filters: {
                email: {
                    $eq: email
                }
            }
        })
        const users = response || []
        return users.length > 0 ? users[0].id : null
    } catch (error) {
        console.error("Error fetching user by email:", error)
        return null
    }
}

/**
 * Get the organisation ID for a user
 * Looks for organisations where the user is in profile, circle1_humans, or circle2_humans
 */
export async function getOrganisationIdByUserId(userId: number): Promise<number | null> {
    if (!userId) {
        return null;
    }
    try {
        console.log('[getOrganisationIdByUserId] Looking for org with userId:', userId);

        // First try to find organisation where user is the profile
        const response = await strapiGet('/organisations', {
            filters: {
                $or: {
                    '0': { profile: { id: userId } },
                    '1': { circle1_humans: { id: userId } },
                    '2': { circle2_humans: { id: userId } }
                }
            },
        });

        console.log('[getOrganisationIdByUserId] Response:', JSON.stringify(response, null, 2));

        const organisations = response?.data || [];
        console.log('[getOrganisationIdByUserId] Found organisations count:', organisations.length);

        return organisations.length > 0 ? organisations[0].id : null;
    } catch (error) {
        console.error("Error fetching organisation by user ID:", error);
        return null;
    }
}
