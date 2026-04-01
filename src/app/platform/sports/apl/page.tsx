"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function APLLandingPage() {
  return (
    <section className="relative min-h-[82vh] overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-b from-black/65 via-black/55 to-black/70">
      <div className="absolute inset-0 bg-[url('/mascot-happy.png')] bg-cover bg-center opacity-45" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/55" />

      <div className="relative z-10 flex min-h-[82vh] flex-col items-center justify-center px-6 text-center sm:px-10">
        <p className="mb-4 rounded-full border border-secondary/40 bg-secondary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
          Ashoka Premier League
        </p>
        <h1 className="mb-4 text-4xl font-extrabold tracking-wide text-white sm:text-6xl">
          Coming Soon
        </h1>
        <p className="mb-8 max-w-xl text-sm text-white/80 sm:text-base">
          APL is almost here. Auction operations, roster tracking, and live updates will go live shortly.
        </p>

        <Link href="/platform/sports/apl/auction">
          <Button size="lg" className="gap-2 bg-secondary text-black hover:bg-secondary-dark">
            Click to access Auction
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
