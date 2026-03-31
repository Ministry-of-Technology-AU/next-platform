"use client";

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

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

export default function APLAuctionPage() {
  const [rows, setRows] = useState<AuctionRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  const stats = useMemo(() => {
    if (rows.length === 0) return { sold: 0, totalValue: 0, average: 0 };
    const totalValue = rows.reduce((sum, row) => sum + row.price, 0);
    return {
      sold: rows.length,
      totalValue,
      average: Math.round(totalValue / rows.length),
    };
  }, [rows]);

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
            <p className="mt-1 text-2xl font-bold">Rs. {stats.totalValue.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Avg. Buy</p>
            <p className="mt-1 text-2xl font-bold">Rs. {stats.average.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-left">Auction Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading auction updates...</div>
          ) : rows.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No auction records available yet.</div>
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
                  {rows.map((row) => (
                    <TableRow key={`${row.serialNo}-${row.name}`}>
                      <TableCell className="font-medium">{row.serialNo}</TableCell>
                      <TableCell className="font-semibold">{row.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={tierClass[row.category] || tierClass['4']}>
                          Tier {row.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{row.team}</TableCell>
                      <TableCell className="text-right font-medium">Rs. {row.price.toLocaleString('en-IN')}</TableCell>
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
