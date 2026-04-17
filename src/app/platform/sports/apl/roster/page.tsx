"use client";

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search } from 'lucide-react';
import { normalizePlayerName } from '@/lib/utils';
import DeveloperCredits from '@/components/developer-credits';

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

      <DeveloperCredits
        developers={[
          {
            name: 'Nitin S',
            role: 'Lead Developer',
            profileUrl: 'https://github.com/28nitin07',
          },
        ]}
      />

interface Player {
  id: number;
  name: string;
  tier: string;
  soldAt: number | null;
  section: 'CM' | 'NCM';
  team: TeamInfo | null;
  playerImage?: string | null;
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

function formatRemainingPurse(amount: number): string {
  const absolute = Math.abs(amount);
  const normalized = Number.isInteger(absolute) ? absolute.toString() : absolute.toFixed(1);

  if (amount < 0) {
    return `- ${normalized} m`;
  }

  return `${normalized} m`;
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
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

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
            name: entry.attributes?.name ? normalizePlayerName(entry.attributes?.name) : `Player ${entry.id}`,
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
            playerImage: entry.attributes?.user?.data?.attributes?.profile_url ?? null,
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

  const visibleGroups = useMemo(() => {
    return filteredGroups.filter((group) => group.id !== -1);
  }, [filteredGroups]);

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
        remaining: TEAM_PURSE - spent,
      };

      return acc;
    }, {});
  }, [groups]);

  return (
    <section className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 w-full">
          <h1 className="!text-left text-2xl font-bold text-foreground sm:text-4xl">APL Roster</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Browse every APL team roster in a searchable catalogue with tier, section, and purchase information.
            Filter by tier or player query to quickly assess squad composition, buys completed, and remaining purse.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/platform/sports/apl/auction">Go to Auction</Link>
        </Button>
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
      ) : visibleGroups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">No players found for selected tier.</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {visibleGroups.map((group) => (
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
                  <Badge
                    className={
                      (metricsByTeamId[group.id]?.remaining ?? TEAM_PURSE) < 0
                        ? 'bg-red-600 text-white hover:bg-red-600'
                        : 'bg-emerald-600 text-white hover:bg-emerald-600'
                    }
                  >
                    Remaining {formatRemainingPurse(metricsByTeamId[group.id]?.remaining ?? TEAM_PURSE)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 md:hidden">
                  {group.players.map((player, index) => (
                    <Card 
                      key={player.id} 
                      className="border border-border/80 shadow-sm cursor-pointer hover:opacity-75 transition-opacity"
                      onClick={() => setSelectedPlayer(player)}
                    >
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            {player.playerImage ? (
                              <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded border border-border bg-background">
                                <Image
                                  src={player.playerImage}
                                  alt={player.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-border bg-muted text-xs font-semibold text-muted-foreground">
                                {player.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">Serial #{index + 1}</p>
                              <p className="truncate text-base font-semibold">{player.name}</p>
                            </div>
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
                        <TableRow 
                          key={player.id}
                          className="cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={() => setSelectedPlayer(player)}
                        >
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-semibold">
                            <div className="flex items-center gap-2">
                              {player.playerImage ? (
                                <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded border border-border bg-background">
                                  <Image
                                    src={player.playerImage}
                                    alt={player.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                              ) : (
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-border bg-muted text-xs font-semibold text-muted-foreground">
                                  {player.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <span className="truncate">{player.name}</span>
                            </div>
                          </TableCell>
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

      {/* Player Detail Modal */}
      <Dialog open={selectedPlayer !== null} onOpenChange={(open) => !open && setSelectedPlayer(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Player Details</DialogTitle>
          </DialogHeader>
          {selectedPlayer && (
            <div className="space-y-4">
              {selectedPlayer.playerImage ? (
                <div className="relative h-64 w-full overflow-hidden rounded-lg border border-border bg-background">
                  <Image
                    src={selectedPlayer.playerImage}
                    alt={selectedPlayer.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-64 w-full items-center justify-center rounded-lg border border-border bg-muted">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted-foreground/20 text-4xl font-bold text-muted-foreground">
                      {selectedPlayer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <p className="text-sm text-muted-foreground">No photo available</p>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Name</p>
                  <p className="text-lg font-semibold">{selectedPlayer.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Tier</p>
                    <Badge variant="outline" className={tierClass[selectedPlayer.tier] || tierClass['4']}>
                      Tier {selectedPlayer.tier}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Team</p>
                    <p className="font-medium">{selectedPlayer.team?.name || 'Unassigned'}</p>
                  </div>
                </div>
                {selectedPlayer.soldAt !== null && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Sold At</p>
                    <p className="text-lg font-bold text-amber-500">{formatAsMillions(selectedPlayer.soldAt)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
