// A strapi get function which returns the user id of the user with the given email
import { strapiGet } from "@/lib/apis/strapi";
import { createLru } from "@/lib/cache/memory";

// Email → Strapi id never changes for an account. 2,000 entries is about 100 KB.
const userIdCache = createLru<number>(2000, 24 * 60 * 60 * 1000);

/**
 * Prefer `getAuthenticatedUser().uid` for the signed-in user; it is already on the session.
 * This stays for looking up other users and for older call sites.
 */
export async function getUserIdByEmail(email: string): Promise<number | null> {
    const key = email.trim().toLowerCase();
    if (key === '') {
        return null;
    }
    const cached = userIdCache.get(key);
    if (cached !== undefined) {
        return cached;
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
        const id: number | null = users.length > 0 ? users[0].id : null
        // Misses are not cached: the account may be created on the next sign-in.
        if (id !== null) {
            userIdCache.set(key, id);
        }
        return id
    } catch (error) {
        platform.error("Error fetching user by email:", error)
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
