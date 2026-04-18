"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import DeveloperCredits from '@/components/developer-credits';
import KnockoutBracketTree from '@/components/apl/knockout-bracket-tree';
import { isKnockoutRound } from '@/lib/apl-knockout';

export default function APLKnockoutPage() {
  const [rawMatches, setRawMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const matchesRes = await fetch('/api/platform/sports/apl/matches');

        if (matchesRes.ok) {
          const d = await matchesRes.json();
          setRawMatches(d.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const eventSource = new EventSource('/api/platform/sports/apl/sse');
    eventSource.onmessage = () => fetchData();
    eventSource.onerror = () => console.warn('[SSE] Connection lost');

    return () => eventSource.close();
  }, []);

  const knockoutMatches = useMemo(
    () => rawMatches.filter((match: any) => isKnockoutRound(match?.attributes?.round, match?.attributes?.type)),
    [rawMatches]
  );

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading Knockout Bracket...</div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-[1200px] mx-auto space-y-4">
      <div className="flex justify-start">
        <Link href="/platform/sports/apl">
          <Button variant="outline" className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            APL Home
          </Button>
        </Link>
      </div>

      <KnockoutBracketTree matches={knockoutMatches} />
      <DeveloperCredits
        developers={[
          {
            name: 'Nitin S',
            role: 'Lead Developer',
            profileUrl: 'https://github.com/28nitin07',
          },
        ]}
      />
    </div>
  );
}
// 