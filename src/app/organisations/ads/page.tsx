import AdsManagementClient from './ads-client';
import { Advertisement } from '@/components/landing-page/data/types';
import { auth } from '@/auth';
import { getUserIdByEmail, getOrganisationIdByUserId } from '@/lib/userid';
import { strapiGet } from '@/lib/apis/strapi';

/**
 * Server component that fetches ads directly from Strapi
 * All user → organisation lookups happen server-side
 */
export default async function AdsManagementPage() {
    let existingAds: Advertisement[] = [];

    try {
        const session = await auth();
        const email = session?.user?.email;

        if (email) {
            const userId = await getUserIdByEmail(email);
            if (userId) {
                const organisationId = await getOrganisationIdByUserId(userId);
                if (organisationId) {
                    // Fetch ads belonging to this organisation directly
                    const response = await strapiGet('/advertisements', {
                        filters: {
                            organisation: {
                                id: {
                                    $eq: organisationId
                                }
                            }
                        },
                        sort: 'createdAt:desc',
                        publicationState: 'preview' // Get both draft and published
                    });

                    if (response?.data) {
                        existingAds = response.data;
                    }
                }
            }
        }
    } catch (error) {
        console.error('Failed to fetch ads:', error);
    }

    return <AdsManagementClient initialAds={existingAds} />;
}