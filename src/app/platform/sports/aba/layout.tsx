import { ReactNode } from 'react';
import Link from 'next/link';

export default function ABALayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      <main className="flex-1 w-full max-w-7xl mx-auto relative">
        {children}
      </main>
    </div>
  );
}
