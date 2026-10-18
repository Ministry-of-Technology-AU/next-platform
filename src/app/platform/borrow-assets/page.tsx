import { ShoppingBag } from 'lucide-react';
import DeveloperCredits from '@/components/developer-credits';
import { TourStep } from '@/components/guided-tour';
import PageTitle from '@/components/page-title';
import { getAuthenticatedUser } from '@/lib/auth';
import { getBorrowAssets } from '@/lib/borrow-assets/data';
import { BorrowAssetsClient } from './client';
import type { BorrowAssetsData } from './types';

// Per-user data (bookmarks, open requests) read with the session; never statically cached.
export const dynamic = 'force-dynamic';

const EMPTY: BorrowAssetsData = { assets: [], phone: '' };

async function loadAssets(): Promise<{ data: BorrowAssetsData; error: string | null }> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return { data: EMPTY, error: 'Sign in to see what you can borrow.' };
    return { data: await getBorrowAssets(user), error: null };
  } catch (err) {
    platform.error('Borrow assets: loading the catalogue failed:', err);
    return { data: EMPTY, error: "We couldn't reach the inventory. Try again in a minute." };
  }
}

export default async function BorrowAssetsPage() {
  const { data, error } = await loadAssets();

  return (
    <div className="mx-auto w-full max-w-7xl">
      <TourStep
        id="page-title"
        title="Borrow Assets"
        content="Borrow phones, cables, adapters and more from Techmin and Jazbaa. Send a request here, and the team replies by email to approve it and set a pickup time."
        order={0}
      >
        <PageTitle
          icon={ShoppingBag}
          text="Borrow Assets"
          subheading="Borrow phones, cables, adapters and more from Techmin and Jazbaa. Send a request and the team replies by email to sort out pickup."
        />
      </TourStep>

      <div className="mt-6 sm:mt-8">
        <BorrowAssetsClient initialData={data} initialError={error} />
      </div>

      <DeveloperCredits
        developers={[{ name: 'Soham Tulsyan', profileUrl: 'https://www.linkedin.com/in/soham-tulsyan-0902482a7/' }]}
      />
    </div>
  );
}
