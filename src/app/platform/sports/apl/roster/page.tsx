"use client";

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

function getStrapiMediaUrl(media: any): string | null {
  if (!media?.data?.attributes?.url) return null;
  const url = media.data.attributes.url;
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
}

interface TeamInfo {
  id: number;
  name: string;
  logo: any;
}

interface Player {
  id: number;
  name: string;
  tier: string;
  soldAt: number | null;
  team: TeamInfo | null;
}

interface TeamGroup {
  id: number;
  name: string;
  logo: any;
  players: Player[];
}

const tierClass: Record<string, string> = {
  '1': 'bg-amber-100 text-amber-900 border-amber-300',
  '2': 'bg-slate-100 text-slate-900 border-slate-300',
  '3': 'bg-orange-100 text-orange-900 border-orange-300',
  '4': 'bg-rose-100 text-rose-900 border-rose-300',
};

export default function APLRosterPage() {
  const [groups, setGroups] = useState<TeamGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState('all');

  useEffect(() => {
    async function fetchRoster() {
      try {
        const [teamsRes, participantsRes] = await Promise.all([
          fetch('/api/platform/sports/apl/teams'),
          fetch('/api/platform/sports/apl/participants?limit=800'),
        ]);

        const teamsPayload = teamsRes.ok ? await teamsRes.json() : { data: [] };
        const participantsPayload = participantsRes.ok ? await participantsRes.json() : { data: [] };

        const teamMap: Record<number, TeamGroup> = {};

        (teamsPayload.data || []).forEach((entry: any) => {
          teamMap[entry.id] = {
            id: entry.id,
            name: entry.attributes?.name || `Team ${entry.id}`,
            logo: entry.attributes?.logo,
            players: [],
          };
        });

        (participantsPayload.data || []).forEach((entry: any) => {
          const teamData = entry.attributes?.team?.data;
          const teamId = teamData?.id;
          const teamName = teamData?.attributes?.name || 'Unassigned';

          const player: Player = {
            id: entry.id,
            name: entry.attributes?.name || `Player ${entry.id}`,
            tier: entry.attributes?.tier || '4',
            soldAt: entry.attributes?.sold_at ?? null,
            team: teamData
              ? {
                  id: teamData.id,
                  name: teamName,
                  logo: teamData.attributes?.logo,
                }
              : null,
          };

          if (teamId && teamMap[teamId]) {
            teamMap[teamId].players.push(player);
          } else {
            if (!teamMap[-1]) {
              teamMap[-1] = { id: -1, name: 'Unassigned', logo: null, players: [] };
            }
            teamMap[-1].players.push(player);
          }
        });

        const normalized = Object.values(teamMap)
          .map((group) => ({
            ...group,
            players: group.players.sort((a, b) => {
              const tierDelta = Number(a.tier) - Number(b.tier);
              if (tierDelta !== 0) return tierDelta;
              return a.name.localeCompare(b.name);
            }),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setGroups(normalized);
      } catch (error) {
        console.error('Failed to fetch APL roster:', error);
      } finally {
        setLoading(false);
      }
    }

    // Initial fetch on mount
    fetchRoster();

    // Connect to SSE stream for real-time updates
    const eventSource = new EventSource('/api/platform/sports/apl/sse');

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log('[APL SSE] Received update (roster):', payload);
        // Re-fetch roster data when any APL entity changes
        fetchRoster();
      } catch (e) {
        console.error('[APL SSE] Parse error:', e);
      }
    };

    eventSource.onerror = () => {
      console.warn('[APL SSE] Connection lost, will auto-reconnect...');
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const filteredGroups = useMemo(() => {
    if (selectedTier === 'all') return groups;
    return groups
      .map((group) => ({
        ...group,
        players: group.players.filter((player) => player.tier === selectedTier),
      }))
      .filter((group) => group.players.length > 0);
  }, [groups, selectedTier]);

  return (
    <section className="px-3 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">APL Roster</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Team-wise player catalogue inspired by ABA, with tier-level segmentation.
        </p>
      </div>

      <Tabs value={selectedTier} onValueChange={setSelectedTier} className="mb-6">
        <TabsList className="flex h-auto w-full flex-wrap gap-2 bg-transparent p-0">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="1">Tier 1</TabsTrigger>
          <TabsTrigger value="2">Tier 2</TabsTrigger>
          <TabsTrigger value="3">Tier 3</TabsTrigger>
          <TabsTrigger value="4">Tier 4</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">Loading roster...</CardContent>
        </Card>
      ) : filteredGroups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">No players found for selected tier.</CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {filteredGroups.map((group) => (
            <Card key={group.id} className="border-border/80">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {group.logo && getStrapiMediaUrl(group.logo) ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border bg-background">
                        <Image
                          src={getStrapiMediaUrl(group.logo) as string}
                          alt={group.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {group.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <CardTitle className="text-xl text-left">{group.name}</CardTitle>
                  </div>
                  <Badge variant="secondary">{group.players.length} players</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Serial</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.players.map((player, index) => (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-semibold">{player.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={tierClass[player.tier] || tierClass['4']}>
                              Tier {player.tier}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {player.soldAt ? `Rs. ${player.soldAt.toLocaleString('en-IN')}` : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
