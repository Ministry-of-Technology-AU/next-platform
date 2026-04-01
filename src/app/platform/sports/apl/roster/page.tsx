"use client";

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';

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
  section: 'CM' | 'NCM';
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

const TEAM_PURSE = 150;
const CM_LIMIT = 8;
const NCM_LIMIT = 2;

interface TeamMetrics {
  cmCount: number;
  ncmCount: number;
  boughtCount: number;
  spent: number;
  remaining: number;
}

function formatAsMillions(amount: number): string {
  const normalized = Number.isInteger(amount) ? amount.toString() : amount.toFixed(1);
  return `₹${normalized}M`;
}

function toTeamSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'unassigned';
}

function normalizeTier(value: unknown): string {
  if (value === null || value === undefined) return '4';
  const raw = String(value).trim().toLowerCase();
  const digits = raw.replace(/[^0-9]/g, '');
  if (digits) return digits;
  return raw || '4';
}

export default function APLRosterPage() {
  const [groups, setGroups] = useState<TeamGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
            tier: normalizeTier(entry.attributes?.tier),
            soldAt: entry.attributes?.sold_at ?? null,
            section: entry.attributes?.isCM ? 'CM' : 'NCM',
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
    let result = groups;

    // Filter by tier
    if (selectedTier !== 'all') {
      result = result
        .map((group) => ({
          ...group,
          players: group.players.filter((player) => player.tier === selectedTier),
        }))
        .filter((group) => group.players.length > 0);
    }

    // Filter by search query (team name or player name)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result
        .map((group) => ({
          ...group,
          players: group.players.filter(
            (player) =>
              group.name.toLowerCase().includes(query) ||
              player.name.toLowerCase().includes(query)
          ),
        }))
        .filter((group) => group.name.toLowerCase().includes(query) || group.players.length > 0);
    }

    return result;
  }, [groups, selectedTier, searchQuery]);

  const metricsByTeamId = useMemo(() => {
    return groups.reduce<Record<number, TeamMetrics>>((acc, group) => {
      const boughtPlayers = group.players.filter((player) => player.soldAt !== null);
      const cmCount = boughtPlayers.filter((player) => player.section === 'CM').length;
      const ncmCount = boughtPlayers.filter((player) => player.section === 'NCM').length;
      const spent = boughtPlayers.reduce((sum, player) => sum + (player.soldAt || 0), 0);

      acc[group.id] = {
        cmCount,
        ncmCount,
        boughtCount: boughtPlayers.length,
        spent,
        remaining: Math.max(TEAM_PURSE - spent, 0),
      };

      return acc;
    }, {});
  }, [groups]);

  return (
    <section className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold text-foreground sm:text-4xl">APL Roster</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Team-wise player catalogue inspired by ABA, with tier-level segmentation.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="relative flex-grow">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search teams or players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedTier} onValueChange={setSelectedTier}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="1">Tier 1</SelectItem>
            <SelectItem value="2">Tier 2</SelectItem>
            <SelectItem value="3">Tier 3</SelectItem>
            <SelectItem value="4">Tier 4</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
            <Card id={`team-${toTeamSlug(group.name)}`} key={group.id} className="scroll-mt-24 border-border/80">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                    <CardTitle className="text-lg text-left sm:text-xl">{group.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    {(metricsByTeamId[group.id]?.boughtCount || 0)}/{CM_LIMIT + NCM_LIMIT} bought
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge variant="outline">CM {metricsByTeamId[group.id]?.cmCount || 0}/{CM_LIMIT}</Badge>
                  <Badge variant="outline">NCM {metricsByTeamId[group.id]?.ncmCount || 0}/{NCM_LIMIT}</Badge>
                  <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                    Remaining {formatAsMillions(metricsByTeamId[group.id]?.remaining || TEAM_PURSE)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 md:hidden">
                  {group.players.map((player, index) => (
                    <Card key={player.id} className="border border-border/80 shadow-sm">
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Serial #{index + 1}</p>
                            <p className="truncate text-base font-semibold">{player.name}</p>
                          </div>
                          <Badge variant="outline" className={tierClass[player.tier] || tierClass['4']}>
                            Tier {player.tier}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Price</p>
                          <p className="font-semibold">
                            {player.soldAt !== null ? formatAsMillions(player.soldAt) : '-'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <ScrollArea className="hidden w-full md:block">
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
                            {player.soldAt !== null ? formatAsMillions(player.soldAt) : '-'}
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
