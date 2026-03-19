import AdsManagementClient from './ads-client';
import { Advertisement } from '@/components/landing-page/data/types';
import { cookies } from 'next/headers';

/**
 * Server component that fetches ads via API route
 * All user → organisation lookups happen in the API route (backend only)
 */
export default async function AdsManagementPage() {
    let existingAds: Advertisement[] = [];

    try {
        // Get cookies to pass to API route for authentication
        const cookieStore = await cookies();
        const cookieHeader = cookieStore.toString();

        // Call the API route server-side with cookies
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/organisations/ads`, {
            cache: 'no-store', // Always get fresh data
            headers: {
                'Cookie': cookieHeader,
            }
        });

        if (!response.ok) {
            console.error('API returned error:', response.status, response.statusText);
            return <AdsManagementClient initialAds={[]} />;
        }

        const result = await response.json();

        if (result.success && result.data) {
            existingAds = result.data;
        }
    } catch (error) {
        console.error('Failed to fetch ads:', error);
        // Continue with empty array - client will show mock template
    }

    return <AdsManagementClient initialAds={existingAds} />;
}