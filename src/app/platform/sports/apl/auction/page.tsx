"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import { Search, X } from 'lucide-react';

interface AuctionRow {
  serialNo: number;
  name: string;
  category: string;
  section: 'CM' | 'NCM';
  team: string;
  price: number;
  playerImage?: string | null;
}

const tierClass: Record<string, string> = {
  '1': 'bg-amber-100 text-amber-900 border-amber-300',
  '2': 'bg-slate-100 text-slate-900 border-slate-300',
  '3': 'bg-orange-100 text-orange-900 border-orange-300',
  '4': 'bg-rose-100 text-rose-900 border-rose-300',
};

const formatAsMillions = (amount: number): string => {
  const normalized = Number.isInteger(amount) ? amount.toString() : amount.toFixed(1);
  return `₹${normalized}M`;
};

const priceBands = [
  { value: '0-25', label: '₹0M - ₹25M' },
  { value: '25-50', label: '₹25M - ₹50M' },
  { value: '50-75', label: '₹50M - ₹75M' },
  { value: '75-100', label: '₹75M - ₹100M' },
  { value: '100-125', label: '₹100M - ₹125M' },
  { value: '125-150', label: '₹125M - ₹150M' },
];

function getTeamAnchor(teamName: string): string {
  const slug = teamName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `/platform/sports/apl/roster#team-${slug || 'unassigned'}`;
}

export default function APLAuctionPage() {
  const [rows, setRows] = useState<AuctionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedPriceBand, setSelectedPriceBand] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<AuctionRow | null>(null);

  async function fetchAuction() {
    try {
      const res = await fetch('/api/platform/sports/apl/auction-results');
      if (!res.ok) return;
      const payload = await res.json();
      setRows(payload.data || []);
    } catch (error) {
      console.error('Failed to fetch auction feed:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Initial fetch on mount
    fetchAuction();

    // Connect to SSE stream for real-time updates
    const eventSource = new EventSource('/api/platform/sports/apl/sse');

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log('[APL SSE] Received update:', payload);
        // Re-fetch auction data when any APL entity changes
        fetchAuction();
      } catch (e) {
        console.error('[APL SSE] Parse error:', e);
      }
    };

    eventSource.onerror = () => {
      console.warn('[APL SSE] Connection lost, will auto-reconnect...');
      // EventSource auto-reconnects by default
    };

    // Commented out polling (kept for fallback reference):
    // const interval = setInterval(fetchAuction, 3500);

    return () => {
      eventSource.close();
      // clearInterval(interval);
    };
  }, []);

  const getPriceBandRange = (band: string): { min: number; max: number } => {
    const ranges: Record<string, { min: number; max: number }> = {
      '0-25': { min: 0, max: 25 },
      '25-50': { min: 25, max: 50 },
      '50-75': { min: 50, max: 75 },
      '75-100': { min: 75, max: 100 },
      '100-125': { min: 100, max: 125 },
      '125-150': { min: 125, max: 150 },
    };
    return ranges[band] || { min: 0, max: Infinity };
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch = row.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeam = !selectedTeam || row.team === selectedTeam;
      const matchesTier = !selectedTier || row.category === selectedTier;
      const matchesSection = !selectedSection || row.section === selectedSection;

      let matchesPriceBand = true;
      if (selectedPriceBand) {
        const { min, max } = getPriceBandRange(selectedPriceBand);
        matchesPriceBand = row.price >= min && row.price <= max;
      }

      return matchesSearch && matchesTeam && matchesTier && matchesSection && matchesPriceBand;
    });
  }, [rows, searchQuery, selectedTeam, selectedTier, selectedSection, selectedPriceBand]);

  const stats = useMemo(() => {
    if (filteredRows.length === 0) return { sold: 0, totalValue: 0, average: 0 };
    const totalValue = filteredRows.reduce((sum, row) => sum + row.price, 0);
    return {
      sold: filteredRows.length,
      totalValue,
      average: Math.round(totalValue / filteredRows.length),
    };
  }, [filteredRows]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTeam('');
    setSelectedTier('');
    setSelectedSection('');
    setSelectedPriceBand('');
  };

  const teams = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.team))).sort();
  }, [rows]);

  const tiers = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.category))).sort();
  }, [rows]);

  const sections = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.section))).sort((a, b) => {
      if (a === b) return 0;
      if (a === 'CM') return -1;
      if (b === 'CM') return 1;
      return a.localeCompare(b);
    });
  }, [rows]);

  const hasActiveFilters =
    searchQuery || selectedTeam || selectedTier || selectedSection || selectedPriceBand;

  const tierColors: Record<string, string> = {
    '1':
      'border-amber-300 bg-amber-200 text-amber-950 dark:border-amber-400/40 dark:bg-amber-500/20 dark:text-amber-200',
    '2':
      'border-slate-300 bg-slate-200 text-slate-900 dark:border-slate-400/40 dark:bg-slate-500/20 dark:text-slate-200',
    '3':
      'border-orange-300 bg-orange-200 text-orange-950 dark:border-orange-400/40 dark:bg-orange-500/20 dark:text-orange-200',
    '4':
      'border-rose-300 bg-rose-200 text-rose-950 dark:border-rose-400/40 dark:bg-rose-500/20 dark:text-rose-200',
  };

  const sectionBadgeClass: Record<'CM' | 'NCM', string> = {
    CM: 'bg-emerald-500 text-white',
    NCM: 'bg-sky-500 text-white',
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
      <div className="mb-5 space-y-2 sm:mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="!text-left text-2xl font-bold text-foreground sm:text-4xl">APL Auction Feed</h1>
            <p className="text-left text-sm text-muted-foreground sm:text-base">
              Track live APL auction outcomes with instant updates for player, category, team, and final price.
              Use team, tier, section, and price-band filters to spot bidding patterns and jump to roster context.
            </p>
          </div>
          <Link href="/platform/sports/apl/roster" className="w-full sm:w-auto">
            <Button
              size="sm"
              className="w-full bg-secondary text-black hover:bg-secondary-dark sm:w-auto"
            >
              Go to Roster
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardContent className="py-4 sm:py-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Players Sold</p>
            <p className="mt-1 text-xl font-bold sm:text-2xl">{stats.sold}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardContent className="py-4 sm:py-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Value</p>
            <p className="mt-1 text-xl font-bold sm:text-2xl">{formatAsMillions(stats.totalValue)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardContent className="py-4 sm:py-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Avg. Buy</p>
            <p className="mt-1 text-xl font-bold sm:text-2xl">{formatAsMillions(stats.average)}</p>
          </CardContent>
        </Card>
      </div>

      {filteredRows.length > 0 && (
        <Card className="mb-6 border-border/70 bg-card/90 shadow-sm">
          <CardHeader className="pb-3">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div className="min-w-0 text-left">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-amber-500">Most Recent Bid</p>
                <div className="flex items-center gap-3">
                  {filteredRows[0].playerImage ? (
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                      <Image
                        src={filteredRows[0].playerImage}
                        alt={filteredRows[0].name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-sm font-semibold text-muted-foreground">
                      {filteredRows[0].name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <CardTitle className="truncate !text-left text-2xl sm:text-3xl">{filteredRows[0].name}</CardTitle>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:items-end sm:text-right">
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Tier</p>
                  <Badge className={`${tierColors[filteredRows[0].category] || tierColors['4']} border text-base px-3 py-1`}>
                  Tier {filteredRows[0].category}
                </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Team</p>
                <p className="truncate text-xl font-semibold">{filteredRows[0].team}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Price</p>
                <p className="text-2xl font-bold text-amber-500">{formatAsMillions(filteredRows[0].price)}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Status</p>
                <Badge className="border border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-400/40 dark:bg-emerald-500/20 dark:text-emerald-200 text-base px-3 py-1">
                  SOLD
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-left">Auction Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-5 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-2 lg:grid-cols-6">
            <div className="relative sm:col-span-2 lg:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                {tiers.map((tier) => (
                  <SelectItem key={tier} value={tier}>
                    Tier {tier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section} value={section}>
                    {section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPriceBand} onValueChange={setSelectedPriceBand}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by price" />
              </SelectTrigger>
              <SelectContent>
                {priceBands.map((band) => (
                  <SelectItem key={band.value} value={band.value}>
                    {band.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="flex items-center gap-2 sm:w-fit"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading auction updates...</div>
          ) : filteredRows.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {rows.length === 0
                ? 'No auction records available yet.'
                : 'No results match your filters.'}
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {filteredRows.map((row) => (
                  <Card key={`${row.serialNo}-${row.name}`} className="border border-border/80 shadow-sm">
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {row.playerImage ? (
                            <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded border border-border bg-background">
                              <img
                                src={row.playerImage}
                                alt={row.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-border bg-muted text-xs font-semibold text-muted-foreground">
                              {row.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Serial #{row.serialNo}</p>
                            <p className="truncate text-base font-semibold">{row.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={sectionBadgeClass[row.section]}>{row.section}</Badge>
                          <Badge variant="outline" className={tierClass[row.category] || tierClass['4']}>
                            Tier {row.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Team</p>
                          <p className="truncate font-medium">
                            <Link href={getTeamAnchor(row.team)} className="underline-offset-4 hover:underline">
                              {row.team}
                            </Link>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Price</p>
                          <p className="font-semibold">{formatAsMillions(row.price)}</p>
                        </div>
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
                      <TableHead>Tier</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRows.map((row) => (
                      <TableRow key={`${row.serialNo}-${row.name}`}>
                        <TableCell className="font-medium">{row.serialNo}</TableCell>
                        <TableCell 
                          className="font-semibold cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={() => setSelectedPlayer(row)}
                        >
                          <div className="flex items-center gap-2">
                            {row.playerImage ? (
                              <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded border border-border bg-background">
                                <img
                                  src={row.playerImage}
                                  alt={row.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-border bg-muted text-xs font-semibold text-muted-foreground">
                                {row.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <span className="truncate">{row.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={sectionBadgeClass[row.section]}>{row.section}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={tierClass[row.category] || tierClass['4']}>
                            Tier {row.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={getTeamAnchor(row.team)} className="underline-offset-4 hover:underline">
                            {row.team}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatAsMillions(row.price)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </>
          )}
        </CardContent>
      </Card>
      {/* Player Detail Modal */}
      <Dialog open={selectedPlayer !== null} onOpenChange={(open) => !open && setSelectedPlayer(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Player Auction Details</DialogTitle>
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
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Serial</p>
                  <p className="font-medium">{selectedPlayer.serialNo}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Name</p>
                  <p className="text-lg font-semibold">{selectedPlayer.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Category</p>
                    <Badge className={sectionBadgeClass[selectedPlayer.section]}>{selectedPlayer.section}</Badge>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Tier</p>
                    <Badge variant="outline" className={tierClass[selectedPlayer.category] || tierClass['4']}>
                      Tier {selectedPlayer.category}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Team</p>
                    <p className="font-medium">{selectedPlayer.team}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Price</p>
                    <p className="text-lg font-bold text-amber-500">{formatAsMillions(selectedPlayer.price)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>    </section>
  );
}
