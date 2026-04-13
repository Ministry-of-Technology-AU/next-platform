"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, CheckCircle } from 'lucide-react';

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

  const MatchCard = ({ match, showLink = true }: { match: any, showLink?: boolean }) => {
    const content = (
      <Card className={`transition-all hover:shadow-lg ${match.status === 'live' ? 'ring-2 ring-red-500' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              Match {match.match_number}
            </Badge>
            {match.status === 'live' && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                <Clock className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
            )}
            {match.status === 'completed' && (
              <Badge variant="default" className="text-xs bg-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                FINISHED
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                {match.teamALogo && (
                  <Image src={match.teamALogo} alt={match.teamA} width={24} height={24} className="w-6 h-6 rounded" />
                )}
                <span className="text-sm font-medium truncate">{match.teamA}</span>
              </div>
              <span className={`text-lg font-bold w-8 text-center ${
                match.status === 'completed' && match.scoreA > match.scoreB ? 'text-yellow-600' : 'text-muted-foreground'
              }`}>
                {match.scoreA}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                {match.teamBLogo && (
                  <Image src={match.teamBLogo} alt={match.teamB} width={24} height={24} className="w-6 h-6 rounded" />
                )}
                <span className="text-sm font-medium truncate">{match.teamB}</span>
              </div>
              <span className={`text-lg font-bold w-8 text-center ${
                match.status === 'completed' && match.scoreB > match.scoreA ? 'text-yellow-600' : 'text-muted-foreground'
              }`}>
                {match.scoreB}
              </span>
            </div>
          </div>

          {match.start_time && (
            <div className="mt-3 text-xs text-muted-foreground text-center">
              {new Date(match.start_time).toLocaleString([], {
                dateStyle: 'short',
                timeStyle: 'short'
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );

    if (showLink && match.id) {
      return (
        <Link href={`/platform/sports/apl/${match.id}`}>
          {content}
        </Link>
      );
    }

    return content;
  };

  const RoundSection = ({ title, matches, cols = 1 }: { title: string, matches: any[], cols?: number }) => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className={`grid grid-cols-1 ${cols > 1 ? `md:grid-cols-${cols}` : ''} gap-4 mt-4`}>
          {matches.length > 0 ? (
            matches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))
          ) : (
            <Card className="opacity-50">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Matches to be announced</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-12 max-w-7xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">APL Knockout Bracket</h1>
        <p className="text-muted-foreground">Follow the tournament progression</p>
      </div>

      {/* Bracket Layout */}
      <div className="space-y-12">
        {/* Round of 16 */}
        {roundOf16.length > 0 && (
          <RoundSection title="Round of 16" matches={roundOf16} cols={2} />
        )}

        {/* Quarter Finals */}
        {quarterFinal.length > 0 && (
          <RoundSection title="Quarter Finals" matches={quarterFinal} cols={2} />
        )}

        {/* Semi Finals */}
        {semiFinal.length > 0 && (
          <RoundSection title="Semi Finals" matches={semiFinal} cols={1} />
        )}

        {/* Final */}
        {final.length > 0 && (
          <RoundSection title="Final" matches={final} cols={1} />
        )}

        {/* No matches message */}
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
    </div>
  );
}