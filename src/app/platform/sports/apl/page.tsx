"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function APLLandingPage() {
  return (
    <section className="relative min-h-[78vh] overflow-hidden rounded-xl border border-border/70 bg-gradient-to-b from-black/65 via-black/55 to-black/70 sm:min-h-[82vh] sm:rounded-2xl">
      <div className="absolute inset-0 bg-[url('/mascot-happy.png')] bg-cover bg-center opacity-45" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/55" />

      <div className="relative z-10 flex min-h-[78vh] flex-col items-center justify-center px-4 text-center sm:min-h-[82vh] sm:px-10">
        <p className="mb-4 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary sm:px-4 sm:text-xs sm:tracking-[0.2em]">
          Ashoka Premier League
        </p>
        <h1 className="mb-3 text-3xl font-extrabold tracking-wide text-white sm:mb-4 sm:text-6xl">
          Coming Soon
        </h1>
        <p className="mb-7 max-w-xl text-sm leading-relaxed text-white/85 sm:mb-8 sm:text-base">
          APL is almost here. Auction operations, roster tracking, and live updates will go live shortly.
        </p>

        <div className="flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
          <Link href="/platform/sports/apl/auction" className="w-full sm:w-auto">
            <Button size="lg" className="w-full gap-2 bg-secondary text-black hover:bg-secondary-dark sm:w-auto">
              Click to access Auction
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/platform/sports/apl/roster" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full border-secondary/60 bg-secondary/10 text-secondary hover:bg-secondary/20 hover:text-secondary sm:w-auto"
            >
              View Roster
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
