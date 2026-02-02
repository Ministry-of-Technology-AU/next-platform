import { BorrowAssetsClient } from './client';
import PageTitle from '@/components/page-title';
import { ShoppingBag } from 'lucide-react';
import { cookies } from 'next/headers';
import { Asset } from './types';

export const dynamic = 'force-dynamic';

async function getAssets(): Promise<Asset[]> {
  try {
      const cookieStore = await cookies();
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/platform/borrow-assets`, {
      cache: 'no-store', // Ensure fresh data on each request
      headers: { 'Cookie': cookieStore.toString() }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch assets:', response.statusText);
      return []; // Return empty array if request fails
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    }
    
    return []; // Return empty array if no data
  } catch (error) {
    console.error('Error fetching assets:', error);
    return []; // Return empty array on error
  }
}

export default async function Home() {
  const assets = await getAssets();
  
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <PageTitle text='Borrow Assets' subheading='Find the range of assets available for borrowing from the Ministry of Technology and other societies.
        Browse the available items, submit a request, and get quick access to what you need, ensuring you stay
        connected and safe. All requests are handled promptly, with transparent tracking of device availability.' icon={ShoppingBag}/>
        <BorrowAssetsClient initialAssets={assets}/>
      </div>
    </div>
  );
}
