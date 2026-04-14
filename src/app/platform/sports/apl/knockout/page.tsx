"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

function getStrapiMediaUrl(media: any): string | null {
  if (!media?.data?.attributes?.url) return null;
  const url = media.data.attributes.url;
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
}

export default function APLKnockoutPage() {
  const [rawMatches, setRawMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const matchesRes = await fetch('/api/platform/sports/apl/matches');

      if (matchesRes.ok) {
        const d = await matchesRes.json();
        setRawMatches(d.data || []);
      }
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // SSE: listen for real-time updates
    const eventSource = new EventSource('/api/platform/sports/apl/sse');
    eventSource.onmessage = () => fetchData();
    eventSource.onerror = () => console.warn('[SSE] Connection lost');

    return () => eventSource.close();
  }, []);

  const bracketData = useMemo(() => {
    if (!rawMatches.length) return {
      roundOf16: [],
      quarterFinal: [],
      semiFinal: [],
      final: []
    };

    const knockoutMatches = rawMatches
      .filter((m: any) => m.attributes?.round && m.attributes.round !== 'group_stage')
      .map((m: any) => ({
        id: m.id,
        teamA: m.attributes?.team_a?.data?.attributes?.name || 'TBD',
        teamB: m.attributes?.team_b?.data?.attributes?.name || 'TBD',
        teamALogo: getStrapiMediaUrl(m.attributes?.team_a?.data?.attributes?.logo),
        teamBLogo: getStrapiMediaUrl(m.attributes?.team_b?.data?.attributes?.logo),
        scoreA: m.attributes?.team_a_score || 0,
        scoreB: m.attributes?.team_b_score || 0,
        status: m.attributes?.status || 'upcoming',
        round: m.attributes?.round,
        start_time: m.attributes?.start_time,
        match_number: m.attributes?.match_number
      }))
      .sort((a, b) => (a.match_number || 0) - (b.match_number || 0));

    return {
      roundOf16: knockoutMatches.filter(m => m.round === 'round_of_16'),
      quarterFinal: knockoutMatches.filter(m => m.round === 'quarter_final'),
      semiFinal: knockoutMatches.filter(m => m.round === 'semi_final'),
      final: knockoutMatches.filter(m => m.round === 'final')
    };
  }, [rawMatches]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading Knockout Bracket...</div>;

  const { roundOf16, quarterFinal, semiFinal, final } = bracketData;

  const BracketMatch = ({ match, position }: { match: any, position: 'left' | 'right' | 'top' | 'bottom' }) => {
    const isWinner = match.status === 'completed' && match.scoreA !== match.scoreB;
    const winner = isWinner ? (match.scoreA > match.scoreB ? 'A' : 'B') : null;

    const content = (
      <Card className={`w-48 transition-all hover:shadow-lg ${match.status === 'live' ? 'ring-2 ring-red-500' : ''} ${isWinner ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''}`}>
        <CardContent className="p-3">
          <div className="space-y-1">
            <div className={`flex items-center gap-2 ${position === 'left' ? 'justify-end' : position === 'right' ? 'justify-start' : 'justify-center'}`}>
              {match.teamALogo && position !== 'right' && (
                <Image src={match.teamALogo} alt={match.teamA} width={20} height={20} className="w-5 h-5 rounded" />
              )}
              <span className={`text-xs font-medium truncate ${winner === 'A' ? 'font-bold text-yellow-600' : ''}`}>{match.teamA}</span>
              {match.teamALogo && position === 'right' && (
                <Image src={match.teamALogo} alt={match.teamA} width={20} height={20} className="w-5 h-5 rounded" />
              )}
              <span className={`text-xs font-bold w-6 text-center ${winner === 'A' ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                {match.scoreA}
              </span>
            </div>

            <div className={`flex items-center gap-2 ${position === 'left' ? 'justify-end' : position === 'right' ? 'justify-start' : 'justify-center'}`}>
              {match.teamBLogo && position !== 'right' && (
                <Image src={match.teamBLogo} alt={match.teamB} width={20} height={20} className="w-5 h-5 rounded" />
              )}
              <span className={`text-xs font-medium truncate ${winner === 'B' ? 'font-bold text-yellow-600' : ''}`}>{match.teamB}</span>
              {match.teamBLogo && position === 'right' && (
                <Image src={match.teamBLogo} alt={match.teamB} width={20} height={20} className="w-5 h-5 rounded" />
              )}
              <span className={`text-xs font-bold w-6 text-center ${winner === 'B' ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                {match.scoreB}
              </span>
            </div>
          </div>

          {match.start_time && (
            <div className="mt-2 text-xs text-muted-foreground text-center">
              {new Date(match.start_time).toLocaleString([], {
                dateStyle: 'short',
                timeStyle: 'short'
              })}
            </div>
          )}

          <div className="mt-1 flex justify-center">
            {match.status === 'live' && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                LIVE
              </Badge>
            )}
            {match.status === 'completed' && (
              <Badge variant="default" className="text-xs bg-green-600">
                FINISHED
              </Badge>
            )}
            {match.status === 'upcoming' && (
              <Badge variant="outline" className="text-xs">
                UPCOMING
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );

    if (match.id) {
      return (
        <Link href={`/platform/sports/apl/${match.id}`}>
          {content}
        </Link>
      );
    }

    return content;
  };


  return (
    <div className="p-4 md:p-8 space-y-12 max-w-7xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">APL Knockout Bracket</h1>
        <p className="text-muted-foreground">Follow the tournament progression</p>
      </div>

      {/* Bracket Layout */}
      <div className="relative min-h-[600px] overflow-x-auto">
        {/* Round of 16 - Left side */}
        <div className="absolute left-0 top-0 space-y-8">
          {roundOf16.slice(0, 4).map((match) => (
            <BracketMatch key={match.id} match={match} position="left" />
          ))}
        </div>

        {/* Round of 16 - Right side */}
        <div className="absolute right-0 top-0 space-y-8">
          {roundOf16.slice(4, 8).map((match) => (
            <BracketMatch key={match.id} match={match} position="right" />
          ))}
        </div>

        {/* Quarter Finals */}
        <div className="absolute left-1/2 top-16 transform -translate-x-1/2 space-y-16">
          {quarterFinal.map((match) => (
            <BracketMatch key={match.id} match={match} position="top" />
          ))}
        </div>

        {/* Semi Finals */}
        <div className="absolute left-1/2 top-32 transform -translate-x-1/2 space-y-32">
          {semiFinal.map((match) => (
            <BracketMatch key={match.id} match={match} position="top" />
          ))}
        </div>

        {/* Final */}
        <div className="absolute left-1/2 top-48 transform -translate-x-1/2">
          {final.map((match) => (
            <BracketMatch key={match.id} match={match} position="top" />
          ))}
        </div>
      </div>

      {/* Fallback to old layout if no bracket data */}
      {roundOf16.length === 0 && quarterFinal.length === 0 &&
       semiFinal.length === 0 && final.length === 0 && (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-bold mb-2">Bracket Coming Soon</h3>
            <p className="text-muted-foreground">
              The knockout bracket will be available once the group stage concludes.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}