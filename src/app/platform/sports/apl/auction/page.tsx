"use client";

import { useEffect, useMemo, useState } from 'react';
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
import { X } from 'lucide-react';

interface AuctionRow {
  serialNo: number;
  name: string;
  category: string;
  team: string;
  price: number;
}

const tierClass: Record<string, string> = {
  '1': 'bg-amber-100 text-amber-900 border-amber-300',
  '2': 'bg-slate-100 text-slate-900 border-slate-300',
  '3': 'bg-orange-100 text-orange-900 border-orange-300',
  '4': 'bg-rose-100 text-rose-900 border-rose-300',
};

const formatAsCreore = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

const priceBands = [
  { value: '0-50', label: '₹0 - ₹50L' },
  { value: '50-100', label: '₹50L - ₹1Cr' },
  { value: '100-200', label: '₹1Cr - ₹2Cr' },
  { value: '200+', label: '₹2Cr+' },
];

export default function APLAuctionPage() {
  const [rows, setRows] = useState<AuctionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [selectedPriceBand, setSelectedPriceBand] = useState<string>('');

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
    fetchAuction();
    const interval = setInterval(fetchAuction, 3500);
    return () => clearInterval(interval);
  }, []);

  const getPriceBandRange = (band: string): { min: number; max: number } => {
    const ranges: Record<string, { min: number; max: number }> = {
      '0-50': { min: 0, max: 5000000 },
      '50-100': { min: 5000000, max: 10000000 },
      '100-200': { min: 10000000, max: 20000000 },
      '200+': { min: 20000000, max: Infinity },
    };
    return ranges[band] || { min: 0, max: Infinity };
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch = row.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeam = !selectedTeam || row.team === selectedTeam;
      const matchesTier = !selectedTier || row.category === selectedTier;

      let matchesPriceBand = true;
      if (selectedPriceBand) {
        const { min, max } = getPriceBandRange(selectedPriceBand);
        matchesPriceBand = row.price >= min && row.price <= max;
      }

      return matchesSearch && matchesTeam && matchesTier && matchesPriceBand;
    });
  }, [rows, searchQuery, selectedTeam, selectedTier, selectedPriceBand]);

  const stats = useMemo(() => {
    if (filteredRows.length === 0) return { sold: 0, totalValue: 0, average: 0 };
    const totalValue = filteredRows.reduce((sum, row) => sum + row.price, 0);
    return {
      sold: filteredRows.length,
      totalValue,
      average: Math.round(totalValue / filteredRows.length),
    };
  }, [filteredRows]);

  const teams = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.team))).sort();
  }, [rows]);

  const tiers = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.category))).sort();
  }, [rows]);

  const hasActiveFilters =
    searchQuery || selectedTeam || selectedTier || selectedPriceBand;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTeam('');
    setSelectedTier('');
    setSelectedPriceBand('');
  };

  return (
    <section className="px-3 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">APL Auction Feed</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Live results showing serial no, player name, category, team, and final price.
        </p>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Players Sold</p>
            <p className="mt-1 text-2xl font-bold">{stats.sold}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Value</p>
            <p className="mt-1 text-2xl font-bold">{formatAsCreore(stats.totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Avg. Buy</p>
            <p className="mt-1 text-2xl font-bold">{formatAsCreore(stats.average)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-left">Auction Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid gap-3 sm:grid-cols-5">
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sm:col-span-2"
            />

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
                className="flex items-center gap-2"
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
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Serial</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((row) => (
                    <TableRow key={`${row.serialNo}-${row.name}`}>
                      <TableCell className="font-medium">{row.serialNo}</TableCell>
                      <TableCell className="font-semibold">{row.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={tierClass[row.category] || tierClass['4']}>
                          Tier {row.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{row.team}</TableCell>
                      <TableCell className="text-right font-medium">{formatAsCreore(row.price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
