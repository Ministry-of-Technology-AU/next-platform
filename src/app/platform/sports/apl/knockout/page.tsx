"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import styles from '../apl.module.css';

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

  const createPlaceholderMatch = (key: string) => ({
    id: key,
    teamA: 'TBA',
    teamB: 'TBA',
    teamALogo: null,
    teamBLogo: null,
    scoreA: null,
    scoreB: null,
    status: 'upcoming'
  });

  const padMatches = (matches: any[], expectedCount: number, prefix: string) => {
    const padded = [...matches];
    while (padded.length < expectedCount) {
      padded.push(createPlaceholderMatch(`${prefix}-${padded.length}`));
    }
    return padded;
  };

  const renderMatches = (matches: any[]) => (
    matches.map((match: any) => (
      <div key={match.id} className={styles.bracketCard}>
        <div className={styles.bracketCardTitle}>
          <div className="flex items-center gap-2">
            {match.teamALogo && (
              <Image src={match.teamALogo} alt={match.teamA} width={24} height={24} className="w-6 h-6 rounded-full" />
            )}
            <span className={styles.bracketTeam}>{match.teamA}</span>
          </div>
          <span className={styles.bracketScore}>{match.scoreA ?? '-'}</span>
        </div>
        <div className={styles.bracketCardTitle}>
          <div className="flex items-center gap-2">
            {match.teamBLogo && (
              <Image src={match.teamBLogo} alt={match.teamB} width={24} height={24} className="w-6 h-6 rounded-full" />
            )}
            <span className={styles.bracketTeam}>{match.teamB}</span>
          </div>
          <span className={styles.bracketScore}>{match.scoreB ?? '-'}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-slate-400">
          <span>{match.status === 'upcoming' ? 'TBA' : match.status.toUpperCase()}</span>
          {match.start_time ? <span>{new Date(match.start_time).toLocaleDateString()}</span> : <span>&nbsp;</span>}
        </div>
      </div>
    ))
  );

  const BracketMatch = ({ match }: { match: any }) => {
    const content = (
      <div className={styles.bracketCard}>
        <div className={styles.bracketCardTitle}>
          <div className="flex items-center gap-2">
            {match.teamALogo && (
              <Image src={match.teamALogo} alt={match.teamA} width={24} height={24} className="w-6 h-6 rounded-full" />
            )}
            <span className={styles.bracketTeam}>{match.teamA}</span>
          </div>
          <span className={styles.bracketScore}>{match.scoreA ?? '-'}</span>
        </div>
        <div className={styles.bracketCardTitle}>
          <div className="flex items-center gap-2">
            {match.teamBLogo && (
              <Image src={match.teamBLogo} alt={match.teamB} width={24} height={24} className="w-6 h-6 rounded-full" />
            )}
            <span className={styles.bracketTeam}>{match.teamB}</span>
          </div>
          <span className={styles.bracketScore}>{match.scoreB ?? '-'}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-slate-400">
          <span>{match.status === 'upcoming' ? 'TBA' : match.status.toUpperCase()}</span>
          {match.start_time ? <span>{new Date(match.start_time).toLocaleDateString()}</span> : <span>&nbsp;</span>}
        </div>
      </div>
    );

    if (match.id && match.teamA !== 'TBA' && match.teamB !== 'TBA') {
      return <Link href={`/platform/sports/apl/${match.id}`}>{content}</Link>;
    }

    return content;
  };

  const leftRound = padMatches(roundOf16.slice(0, 4), 4, 'left-r16');
  const rightRound = padMatches(roundOf16.slice(4, 8), 4, 'right-r16');
  const leftQuarters = padMatches(quarterFinal.slice(0, 2), 2, 'left-qf');
  const rightQuarters = padMatches(quarterFinal.slice(2, 4), 2, 'right-qf');
  const semis = padMatches(semiFinal.slice(0, 2), 2, 'semi');
  const finalMatch = final[0] || createPlaceholderMatch('final-0');

  return (
    <div className="p-4 md:p-8 space-y-12 max-w-7xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">APL Knockout Bracket</h1>
        <p className="text-muted-foreground">Follow the tournament progression</p>
      </div>

      {/* Bracket Layout */}
      <div className={`${styles.knockoutBracket} ${styles.knockoutFrame}`}>
        <div className={styles.bracketColumn}>
          <div className={styles.bracketHeader}>Round of 16</div>
          {renderMatches(leftRound)}
        </div>

        <div className={styles.bracketColumn}>
          <div className={styles.bracketHeader}>Quarter Finals</div>
          {renderMatches(leftQuarters)}
        </div>

        <div className={styles.bracketColumn}>
          <div className={styles.bracketHeader}>Semi Finals</div>
          {renderMatches(semis)}
          <div className="h-16" />
          <div className={styles.bracketHeader}>Final</div>
          <BracketMatch match={finalMatch} />
        </div>

        <div className={styles.bracketColumn}>
          <div className={styles.bracketHeader}>Quarter Finals</div>
          {renderMatches(rightQuarters)}
        </div>

        <div className={styles.bracketColumn}>
          <div className={styles.bracketHeader}>Round of 16</div>
          {renderMatches(rightRound)}
        </div>
      </div>

    </div>
  );
}