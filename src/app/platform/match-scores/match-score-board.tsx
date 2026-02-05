'use client';

import { useState, useEffect } from 'react';
import { MatchScore } from './types';
import { MatchCard } from './match-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // standard shadcn imports
import { Skeleton } from '@/components/ui/skeleton';

export function MatchScoreBoard() {
    const [matches, setMatches] = useState<MatchScore[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [leagues, setLeagues] = useState<string[]>([]);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await fetch('/api/platform/match-scores');
                const data: MatchScore[] = await response.json();
                setMatches(data);

                const uniqueLeagues = Array.from(new Set(data.map(m => m.league_name))).sort();
                setLeagues(uniqueLeagues);
            } catch (error) {
                console.error('Error fetching matches:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
        const interval = setInterval(fetchMatches, 30000);
        return () => clearInterval(interval);
    }, []);

    // Helper to render the horizontal list
    const MatchList = ({ data }: { data: MatchScore[] }) => {
        if (data.length === 0) {
            return <p className="text-muted-foreground py-8">No live matches.</p>;
        }
        return (
            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-2 px-2 scrollbar-hide">
                {data.map((match) => (
                    // Constrain width to make them "small and fitted" like the image
                    <div key={match.id} className="min-w-[240px] w-[240px] flex-shrink-0">
                        <MatchCard match={match} />
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="w-full space-y-4">
                <div className="h-10 w-full max-w-md bg-secondary/20 rounded-lg animate-pulse" />
                <div className="h-48 w-full bg-secondary/10 rounded-[3rem] animate-pulse" />
            </div>
        );
    }

    return (
        <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
            {/* Tabs sit outside/above the dark container */}
            <TabsList className="mb-0 pl-8 flex flex-wrap h-auto gap-2 bg-transparent justify-start">
                <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-primary dark:data-[state=active]:bg-primary dark:border-none data-[state=active]:text-primary-foreground rounded-t-lg rounded-b-none border-b-0 px-6 py-2"
                >
                    All Leagues
                </TabsTrigger>
                {leagues.map(league => (
                    <TabsTrigger
                        key={league}
                        value={league}
                        className="data-[state=active]:bg-primary dark:data-[state=active]:bg-primary dark:border-none data-[state=active]:text-primary-foreground rounded-t-lg rounded-b-none border-b-0 px-6 py-2"
                    >
                        {league}
                    </TabsTrigger>
                ))}
            </TabsList>

            {/* The Dark Container (The "Board") */}
            <div className="bg-black dark:bg-gray rounded-[40px] p-6 text-white shadow-xl relative overflow-hidden">

                {/* LIVE Indicator (Top Left) */}
                <div className="flex items-center gap-2 mb-4 pl-2">
                    <span className="text-sm font-black tracking-wide text-primary-bright">LIVE</span>
                    <span className="h-2 w-2 rounded-full bg-green animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                </div>

                {/* Tab Contents Logic */}
                <TabsContent value="all" className="mt-0 outline-none">
                    <MatchList data={matches} />
                </TabsContent>

                {leagues.map(league => (
                    <TabsContent key={league} value={league} className="mt-0 outline-none">
                        <MatchList data={matches.filter(m => m.league_name === league)} />
                    </TabsContent>
                ))}
            </div>
        </Tabs>
    );
}