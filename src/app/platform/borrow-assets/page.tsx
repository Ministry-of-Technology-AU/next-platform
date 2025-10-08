import { sampleAssets } from './data';
import { BorrowAssetsClient } from './client';
import PageTitle from '@/components/page-title';
import { ShoppingBag } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <PageTitle text='Borrow Assets' subheading='Find the range of assets available for borrowing from the Ministry of Technology and other societies.
        Browse the available items, submit a request, and get quick access to what you need, ensuring you stay
        connected and safe. All requests are handled promptly, with transparent tracking of device availability.' icon={ShoppingBag}/>
        <BorrowAssetsClient initialAssets={sampleAssets}/>
      </div>
    </div>
  );
}
