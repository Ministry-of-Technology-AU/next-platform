"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Save, RefreshCw, Trophy, Users, BarChart3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

type Player = {
  id: string;
  name: string;
  points: number;
  matchPoints: number;
  isActive: boolean;
  strapiId: number;
  assists: number;
  fouls: number;
  rebounds: number;
  newAssists?: number;
  newFouls?: number;
  newRebounds?: number;
};
type SetRecord = { name: string; scoreA: number; scoreB: number };

export default function AdminMatchScoringPage() {
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Match State
  const [matchName, setMatchName] = useState("");
  const [matchStatus, setMatchStatus] = useState<"Upcoming" | "Live" | "Past">("Upcoming");
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [teamAName, setTeamAName] = useState("Team A");
  const [teamBName, setTeamBName] = useState("Team B");
  const [teamAId, setTeamAId] = useState<number | null>(null);
  const [teamBId, setTeamBId] = useState<number | null>(null);
  const [sets, setSets] = useState<SetRecord[]>([]);
  const [currentSetName, setCurrentSetName] = useState("Set 1");
  const [events, setEvents] = useState<any[]>([]);
  const [startTime, setStartTime] = useState<string | null>(null);

  // Roster State
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([]);

  // Modal State
  const [showEndModal, setShowEndModal] = useState(false);

  const fetchMatch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/platform/sports/aba/matches/${id}`);
      if (!res.ok) throw new Error("Match load failed");
      const { data } = await res.json();

      const attrs = data.attributes || {};
      const details = attrs.details || {};

      const tA = attrs.team_a?.data;
      const tB = attrs.team_b?.data;

      setTeamAId(tA?.id || null);
      setTeamBId(tB?.id || null);
      setTeamAName(tA?.attributes?.name || 'Team A');
      setTeamBName(tB?.attributes?.name || 'Team B');
      setMatchName(`${attrs.type || 'Match'}: ${tA?.attributes?.name || 'A'} vs ${tB?.attributes?.name || 'B'}`);
      setMatchStatus(attrs.status || 'Upcoming');
      setScoreA(details.scoreA || 0);
      setScoreB(details.scoreB || 0);
      setSets(details.sets || []);
      setEvents(details.events || []);
      setStartTime(attrs.start_time || null);

      const parsePlayers = (teamKey: 'team_a' | 'team_b'): Player[] => {
        const members = attrs[teamKey]?.data?.attributes?.members?.data || [];
        return members.map((p: any) => ({
          strapiId: p.id,
          id: p.id.toString(),
          name: p.attributes?.name || 'Unknown',
          points: p.attributes?.points_scored || 0,
          matchPoints: 0,
          assists: p.attributes?.assists || 0,
          fouls: p.attributes?.fouls || 0,
          rebounds: p.attributes?.rebounds || 0,
          isActive: false,
          newAssists: 0,
          newFouls: 0,
          newRebounds: 0
        }));
      };

      if (teamAPlayers.length === 0 && teamBPlayers.length === 0) {
        setTeamAPlayers(parsePlayers('team_a'));
        setTeamBPlayers(parsePlayers('team_b'));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to load match data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
  }, [id]);

  const saveDetailsToStrapi = async (updates: any) => {
    setSaving(true);
    try {
      await fetch(`/api/platform/sports/aba/matches/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.error(e);
      alert("Auto-save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = (team: 'A' | 'B', playerId: string) => {
    const targetTeam = team === 'A' ? teamAPlayers : teamBPlayers;
    const setTargetTeam = team === 'A' ? setTeamAPlayers : setTeamBPlayers;
    const player = targetTeam.find(p => p.id === playerId);

    if (!player) return;
    if (!player.isActive) {
      if (targetTeam.filter(p => p.isActive).length >= 3) {
        return alert("Maximum 3 players can be active.");
      }
    }
    setTargetTeam(prev => prev.map(p => p.id === playerId ? { ...p, isActive: !p.isActive } : p));
  };
  
  const getIndividualStats = (tA: Player[], tB: Player[]) => {
    return [...tA, ...tB].map(p => ({
      id: p.strapiId,
      matchPoints: p.matchPoints
    }));
  };

  const handleScoreChange = async (team: 'A' | 'B', playerId: string, change: number) => {
    const targetTeam = team === 'A' ? teamAPlayers : teamBPlayers;
    const setTargetTeam = team === 'A' ? setTeamAPlayers : setTeamBPlayers;
    const player = targetTeam.find(p => p.id === playerId);
    
    // Only prevent match points from going negative and team score from going negative
    if (!player || (player.matchPoints + change < 0)) return;
    const teamScore = team === 'A' ? scoreA : scoreB;
    if (teamScore + change < 0) return;

    // Optimistic UI
    const newPoints = player.points + change;
    const newMatchPoints = player.matchPoints + change;
    const newScoreA = team === 'A' ? Math.max(0, scoreA + change) : scoreA;
    const newScoreB = team === 'B' ? Math.max(0, scoreB + change) : scoreB;
    
      const newTeamA = team === 'A' ? targetTeam.map(p => p.id === playerId ? { ...p, points: newPoints, matchPoints: newMatchPoints } : p) : teamAPlayers;
      const newTeamB = team === 'B' ? targetTeam.map(p => p.id === playerId ? { ...p, points: newPoints, matchPoints: newMatchPoints } : p) : teamBPlayers;
      
      setTargetTeam(prev => prev.map(p => p.id === playerId ? { ...p, points: newPoints, matchPoints: newMatchPoints } : p));
      setScoreA(newScoreA);
      setScoreB(newScoreB);

      // Save Timeline Event
      const newEvent = {
        time: `${currentSetName} • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        team: team === 'A' ? teamAName : teamBName,
        player: player.name,
        action: change > 0 ? `Scored ${change}pt` : `Removed ${Math.abs(change)}pt`,
        newScore: `${newScoreA}-${newScoreB}`
      };
      const updatedEvents = [newEvent, ...events];
      setEvents(updatedEvents);

      setSaving(true);
      try {
        await fetch(`/api/platform/sports/aba/participants/${player.strapiId}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points_scored: newPoints })
        });
        await saveDetailsToStrapi({ 
          details: { 
            scoreA: newScoreA, 
            scoreB: newScoreB, 
            sets, 
            events: updatedEvents,
            individual_stats: getIndividualStats(newTeamA, newTeamB)
          } 
        });
      } catch (e) {
        console.error(e);
      } finally {
        setSaving(false);
      }
    };

  const handleEndSet = async () => {
    const newSets = [...sets, { name: currentSetName, scoreA, scoreB }];
    setSets(newSets);
    setCurrentSetName(`Set ${newSets.length + 1}`);
    await saveDetailsToStrapi({ 
      details: { 
        scoreA, 
        scoreB, 
        sets: newSets, 
        events,
        individual_stats: getIndividualStats(teamAPlayers, teamBPlayers)
      } 
    });
  };

  const handleUpdateModalStat = (team: 'A' | 'B', playerId: string, field: 'newAssists' | 'newFouls' | 'newRebounds', val: string) => {
    const setTargetTeam = team === 'A' ? setTeamAPlayers : setTeamBPlayers;
    const num = parseInt(val) || 0;
    setTargetTeam(prev => prev.map(p => p.id === playerId ? { ...p, [field]: num } : p));
  };

  const finalizeMatch = async () => {
    setSaving(true);
    try {
      // 1. Update all participants
      const allPlayers = [...teamAPlayers, ...teamBPlayers];
      await Promise.all(allPlayers.map(p =>
        fetch(`/api/platform/sports/aba/participants/${p.strapiId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            points_scored: p.points,
            assists: p.assists + (p.newAssists || 0),
            fouls: p.fouls + (p.newFouls || 0),
            rebounds: p.rebounds + (p.newRebounds || 0)
          })
        })
      ));

      // 2. Update teams
      if (teamAId && teamBId) {
        const getTeamStats = async (tid: number) => {
          const r = await fetch(`/api/platform/sports/aba/teams/${tid}`);
          const d = await r.json();
          return d.data?.attributes || {};
        };

        const [statsA, statsB] = await Promise.all([getTeamStats(teamAId), getTeamStats(teamBId)]);

        const winA = scoreA > scoreB;
        const winB = scoreB > scoreA;
        const tie = scoreA === scoreB;

        const updateTeam = async (tid: number, current: any, isWin: boolean, isLoss: boolean, isTie: boolean) => {
          const pointsToAdd = isWin ? 3 : isTie ? 1 : 0;
          await fetch(`/api/platform/sports/aba/teams/${tid}`, { // Assuming this endpoint exists, if not we'll need to create or use generic
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              matches_played: (current.matches_played || 0) + 1,
              matches_won: (current.matches_won || 0) + (isWin ? 1 : 0),
              matches_lost: (current.matches_lost || 0) + (isLoss ? 1 : 0),
              matches_tied: (current.matches_tied || 0) + (isTie ? 1 : 0),
              points: (current.points || 0) + pointsToAdd
            })
          });
        };

        await Promise.all([
          updateTeam(teamAId, statsA, winA, winB, tie),
          updateTeam(teamBId, statsB, winB, winA, tie)
        ]);
      }

      // 3. Update Match Status
      await saveDetailsToStrapi({ 
        status: "Past",
        details: {
          scoreA,
          scoreB,
          sets,
          events,
          individual_stats: getIndividualStats(teamAPlayers, teamBPlayers)
        }
      });
      setMatchStatus("Past");
      setShowEndModal(false);
      alert("Match finalized and standings updated!");
    } catch (e) {
      console.error(e);
      alert("Finalization failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleMatchStatus = async () => {
    if (matchStatus === "Upcoming") {
      setMatchStatus("Live");
      await saveDetailsToStrapi({ status: "Live" });
    } else if (matchStatus === "Live") {
      setShowEndModal(true);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading match panel...</div>;

  return (
    <div className="p-4 md:p-6 w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="-ml-4" asChild>
          <Link href="/platform/sports/aba/admin">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Admin Panel
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          {saving && <Badge variant="outline" className="text-muted-foreground border-transparent animate-pulse"><RefreshCw className="w-3 h-3 mr-2 animate-spin" /> Saving</Badge>}
          {matchStatus === "Upcoming" && <Button onClick={toggleMatchStatus} className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 font-bold px-8 shadow-lg shadow-green-500/20 transition-all active:scale-95" disabled={saving}>Start Game</Button>}
          {matchStatus === "Live" && <Button onClick={toggleMatchStatus} variant="destructive" disabled={saving}>End Game</Button>}
          {matchStatus === "Past" && <Badge variant="secondary">Game Ended</Badge>}
          <Button variant="default" onClick={() => saveDetailsToStrapi({ details: { scoreA, scoreB, sets, events } })} disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> Force Save
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black tracking-wider">{matchName}</h1>
        <div className="text-muted-foreground text-sm flex items-center gap-4">
          <div className="flex items-center gap-2">Status: <Badge variant={matchStatus === "Live" ? "destructive" : "outline"} className={matchStatus === "Live" ? "animate-pulse" : ""}>{matchStatus}</Badge></div>
          {startTime && <div className="flex items-center gap-2">Scheduled: <span className="font-bold text-foreground">{new Date(startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span></div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Left Section: Scorecard + Players */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <Card className="border-4 border-primary/20 shadow-2xl p-8 flex flex-col items-center justify-center min-h-[300px] bg-card text-card-foreground relative overflow-hidden">
            {matchStatus === 'Past' && <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm z-50"><h2 className="text-5xl font-black rotate-[-10deg] text-yellow-600/80 dark:text-yellow-500/80">FINISHED</h2></div>}
            <div className="flex w-full justify-between items-center text-center">
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-black tracking-widest text-muted-foreground mb-4 uppercase">{teamAName}</h3>
                <div className="text-7xl md:text-9xl font-black tabular-nums tracking-tighter text-foreground">{scoreA}</div>
              </div>
              <div className="text-5xl md:text-7xl font-bold text-muted-foreground/20 px-4 md:px-8">-</div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-black tracking-widest text-muted-foreground mb-4 uppercase">{teamBName}</h3>
                <div className="text-7xl md:text-9xl font-black tabular-nums tracking-tighter text-foreground">{scoreB}</div>
              </div>
            </div>
          </Card>

          <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-lg border border-dashed">
            <Input className="flex-1" value={currentSetName} onChange={(e) => setCurrentSetName(e.target.value)} placeholder="e.g. Q1, Q2" disabled={matchStatus !== "Live"} />
            <Button onClick={handleEndSet} className="w-1/3" variant="secondary" disabled={matchStatus !== "Live" || saving}>End {currentSetName}</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            {[{ team: 'A', name: teamAName, players: teamAPlayers }, { team: 'B', name: teamBName, players: teamBPlayers }].map(t => (
              <div key={t.team} className="space-y-4">
                <h4 className="text-xl font-semibold border-b pb-2">{t.name} Roster</h4>
                {t.players.map(player => (
                  <div key={player.id} className={`flex flex-col gap-2 p-3 rounded-lg border ${player.isActive ? 'border-green-500/50 bg-green-500/5' : 'border-border bg-muted/20 opacity-70'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button variant={player.isActive ? "default" : "outline"} size="sm" className={`h-6 text-[10px] px-2 font-black uppercase tracking-tighter ${player.isActive ? 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 font-bold px-8 shadow-lg shadow-green-500/20 transition-all active:scale-95' : ''}`} onClick={() => handleToggleActive(t.team as 'A' | 'B', player.id)} disabled={matchStatus !== "Live"}>{player.isActive ? 'Active' : 'Bench'}</Button>
                        <span className="font-semibold">{player.name}</span>
                      </div>
                      <span className="tabular-nums font-mono text-muted-foreground">{player.matchPoints} PTS</span>
                    </div>
                    {player.isActive && matchStatus === "Live" && (
                      <div className="flex gap-2 justify-end mt-1">
                        {[-1, 1, 2].map(val => (
                          <Button
                            key={val}
                            variant="secondary"
                            size="sm"
                            className="h-8 px-3 font-black text-xs border border-border/50 shadow-sm hover:translate-y-[-1px] transition-transform"
                            onClick={() => handleScoreChange(t.team as 'A' | 'B', player.id, val)}
                            disabled={saving}
                          >
                            {val > 0 ? `+${val}` : val}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-4">
          <h4 className="font-semibold text-muted-foreground mt-4">Frozen Sets</h4>
          {sets.map((set, idx) => (
            <Card key={idx} className="shadow-sm">
              <CardHeader className="py-2 px-3"><CardTitle className="text-xs uppercase text-muted-foreground">{set.name}</CardTitle></CardHeader>
              <CardContent className="px-3 pb-3 flex justify-between font-bold"><span>{set.scoreA}</span><span className="text-muted-foreground">-</span><span>{set.scoreB}</span></CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={showEndModal} onOpenChange={setShowEndModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-500" /> Finalize Match Stats</DialogTitle>
            <DialogDescription>Record final assists, fouls, and rebounds for all players before closing the match.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {[{ team: 'A', name: teamAName, players: teamAPlayers }, { team: 'B', name: teamBName, players: teamBPlayers }].map(t => (
              <div key={t.team} className="flex flex-col gap-4">
                <h3 className="font-bold flex items-center gap-2 text-lg border-b pb-2"><Users className="w-5 h-5" /> {t.name} Stats</h3>
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {t.players.map(p => (
                      <div key={p.id} className="p-3 bg-muted/30 border border-border/50 rounded-xl space-y-3 shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold">{p.name}</span>
                          <Badge variant="secondary" className="font-mono">{p.matchPoints} PTS</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Assists</Label>
                            <Input type="number" size={1} className="h-8 text-center" value={p.newAssists} onChange={(e) => handleUpdateModalStat(t.team as 'A' | 'B', p.id, 'newAssists', e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Fouls</Label>
                            <Input type="number" size={1} className="h-8 text-center" value={p.newFouls} onChange={(e) => handleUpdateModalStat(t.team as 'A' | 'B', p.id, 'newFouls', e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Rebounds</Label>
                            <Input type="number" size={1} className="h-8 text-center" value={p.newRebounds} onChange={(e) => handleUpdateModalStat(t.team as 'A' | 'B', p.id, 'newRebounds', e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ))}
          </div>

          <DialogFooter className="border-t pt-4">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-4 text-xl font-bold">
                <div className={scoreA > scoreB ? 'text-green-600' : ''}>{teamAName}: {scoreA}</div>
                <div className="text-muted-foreground">-</div>
                <div className={scoreB > scoreA ? 'text-green-600' : ''}>{teamBName}: {scoreB}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowEndModal(false)}>Cancel</Button>
                <Button onClick={finalizeMatch} disabled={saving} className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 font-bold px-8 shadow-lg shadow-green-500/20 transition-all active:scale-95">
                  {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
                  Finalize & Update Standings
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
