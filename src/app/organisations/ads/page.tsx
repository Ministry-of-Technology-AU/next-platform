import AdsManagementClient from './ads-client';
import { Advertisement } from '@/components/landing-page/data/types';
import { cookies } from 'next/headers';

/**
 * Server component that fetches ads via API route
 */
export default async function AdsManagementPage() {
    let existingAds: Advertisement[] = [];

    try {
        // Get cookies to pass to API route for authentication
        const cookieStore = await cookies();
        const cookieHeader = cookieStore.toString();

        // Call the API route server-side with cookies
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/organisations/ads`, {
            cache: 'no-store', // Always get fresh data
            headers: {
                'Cookie': cookieHeader,
            }
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                existingAds = result.data;
            }
        } else {
            console.error('API returned error:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Failed to fetch ads:', error);
    }

    return <AdsManagementClient initialAds={existingAds} />;
}