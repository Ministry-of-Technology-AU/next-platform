"use client";

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lock, Trophy, Users, CheckCircle2, Clock, Search } from 'lucide-react';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const FANTASY_OPEN = process.env.NEXT_PUBLIC_ABA_FANTASY_OPEN === 'true';

function getStrapiMediaUrl(media: any): string | null {
  if (!media?.data?.attributes?.url) return null;
  const url = media.data.attributes.url;
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
}

interface Participant {
  id: number;
  name: string;
  teamName: string;
  teamLogo: string | null;
}

interface SavedTeam {
  playerIds: number[];
}

export default function FantasyPage() {
  const { status } = useSession();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [savedTeam, setSavedTeam] = useState<SavedTeam | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    async function load() {
      try {
        const [participantsRes, fantasyRes] = await Promise.all([
          fetch('/api/platform/sports/aba/participants?limit=200'),
          fetch('/api/platform/sports/aba/fantasy')
        ]);

        if (participantsRes.ok) {
          const d = await participantsRes.json();
          const parsed: Participant[] = (d.data || []).map((p: any) => ({
            id: p.id,
            name: p.attributes?.name || 'Unknown',
            teamName: p.attributes?.team?.data?.attributes?.name || 'Unassigned',
            teamLogo: getStrapiMediaUrl(p.attributes?.team?.data?.attributes?.logo)
          }));
          setParticipants(parsed);
        }

        if (fantasyRes.ok) {
          const d = await fantasyRes.json();
          // d.data is an array of participant objects from the fantasy_teams relation
          const teams: any[] = d.data || [];
          if (teams.length > 0) {
            setSavedTeam({ playerIds: teams.map((p: any) => p.id) });
          }
        }
      } catch (e) {
        console.error('Load error:', e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [status]);

  const teamGroups = useMemo(() => {
    const groups: Record<string, Participant[]> = {};
    for (const p of participants) {
      if (!groups[p.teamName]) groups[p.teamName] = [];
      groups[p.teamName].push(p);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [participants]);

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teamGroups;
    return teamGroups
      .map(([teamName, players]) => [
        teamName,
        players.filter(p => p.name.toLowerCase().includes(q) || p.teamName.toLowerCase().includes(q))
      ] as [string, Participant[]])
      .filter(([, players]) => players.length > 0);
  }, [teamGroups, search]);

  const savedPlayers = useMemo(() => {
    if (!savedTeam) return [];
    return savedTeam.playerIds
      .map(id => participants.find(p => p.id === id))
      .filter(Boolean) as Participant[];
  }, [savedTeam, participants]);

  function togglePlayer(id: number) {
    if (savedTeam) return;
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 6) {
        next.add(id);
      }
      return next;
    });
  }

  async function handleSave() {
    if (selectedIds.size !== 6) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/platform/sports/aba/fantasy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerIds: Array.from(selectedIds) })
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || 'Failed to save');
        return;
      }
      setSavedTeam({ playerIds: Array.from(selectedIds) });
    } catch (e) {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading Fantasy...</div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="p-8 text-center text-muted-foreground">Please sign in to access Fantasy.</div>
    );
  }

  // Selections closed + no team saved
  if (!FANTASY_OPEN && !savedTeam) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Fantasy Selections Closed</h1>
          <p className="text-muted-foreground max-w-sm">
            The window to pick your fantasy team has ended. Check back for results!
          </p>
        </div>
      </div>
    );
  }

  // Has saved team (locked view)
  if (savedTeam) {
    return (
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h1 className="text-2xl font-black tracking-tight">Your Fantasy Team</h1>
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <Lock className="w-3 h-3" /> Locked
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedPlayers.map((player, idx) => (
            <Card key={player.id} className="bg-card border-border shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-lg font-black text-muted-foreground w-6 text-center">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{player.name}</p>
                  <p className="text-xs text-muted-foreground font-semibold mt-0.5">{player.teamName}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              </CardContent>
            </Card>
          ))}
          {savedPlayers.length === 0 && (
            <p className="text-muted-foreground col-span-3 text-center py-8">Loading player details...</p>
          )}
        </div>
      </div>
    );
  }

  // Selection UI (before deadline, no saved team)
  const selectedCount = selectedIds.size;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-black tracking-tight">Pick Your Fantasy Team</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>Selections open</span>
          </div>
          <Badge
            variant={selectedCount === 6 ? 'default' : 'outline'}
            className="text-xs font-bold"
          >
            {selectedCount}/6 selected
          </Badge>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Select exactly 6 players. Once you save, your team is locked.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player pool */}
        <div className="order-2 lg:order-1 lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search players or teams..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
            />
          </div>
          {filteredGroups.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No players found.</p>
          )}
          {filteredGroups.map(([teamName, players]) => (
            <Card key={teamName} className="bg-card border-border shadow-sm overflow-hidden">
              <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border">
                <CardTitle className="text-sm font-bold tracking-wide uppercase">{teamName}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {players.map(player => {
                    const isSelected = selectedIds.has(player.id);
                    const isDisabled = !isSelected && selectedCount >= 6;
                    return (
                      <button
                        key={player.id}
                        onClick={() => togglePlayer(player.id)}
                        disabled={isDisabled}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                          ${isSelected
                            ? 'bg-primary/10 hover:bg-primary/15'
                            : isDisabled
                              ? 'opacity-40 cursor-not-allowed'
                              : 'hover:bg-muted/50'
                          }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                          ${isSelected ? 'border-primary bg-primary' : 'border-border'}`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="font-semibold text-sm flex-1">{player.name}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected players sidebar */}
        <div className="order-1 lg:order-2 lg:col-span-1">
          <div className="lg:sticky lg:top-4 space-y-4">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="py-3 px-4 border-b border-border">
                <CardTitle className="text-sm font-bold">Your Squad ({selectedCount}/6)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[320px]">
                  <div className="p-3 space-y-2">
                    {Array.from(selectedIds).map((id, idx) => {
                      const player = participants.find(p => p.id === id);
                      if (!player) return null;
                      return (
                        <div key={id} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                          <span className="text-xs font-black text-muted-foreground w-4">{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{player.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{player.teamName}</p>
                          </div>
                          <button
                            onClick={() => togglePlayer(id)}
                            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                    {selectedCount === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-8">
                        Select players from the list
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Button
              onClick={handleSave}
              disabled={selectedCount !== 6 || saving}
              className="w-full font-bold"
            >
              {saving ? 'Saving...' : selectedCount === 6 ? 'Lock In My Team' : `Select ${6 - selectedCount} more`}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Once saved, your selection cannot be changed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
