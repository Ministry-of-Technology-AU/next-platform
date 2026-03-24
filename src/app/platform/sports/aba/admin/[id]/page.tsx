"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Save, RefreshCw } from 'lucide-react';

type Player = { id: string; name: string; points: number; isActive: boolean; strapiId: number };
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
  const [sets, setSets] = useState<SetRecord[]>([]);
  const [currentSetName, setCurrentSetName] = useState("Set 1");
  const [events, setEvents] = useState<any[]>([]);

  // Roster State
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([]);

  const fetchMatch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/platform/sports/aba/matches/${id}`);
      if (!res.ok) throw new Error("Match load failed");
      const { data } = await res.json();

      const attrs = data.attributes || {};
      const details = attrs.details || {};
      
      setTeamAName(attrs.team_a?.data?.attributes?.name || 'Team A');
      setTeamBName(attrs.team_b?.data?.attributes?.name || 'Team B');
      setMatchName(`${attrs.type || 'Match'}: ${attrs.team_a?.data?.attributes?.name || 'A'} vs ${attrs.team_b?.data?.attributes?.name || 'B'}`);
      setMatchStatus(attrs.status || 'Upcoming');
      setScoreA(details.scoreA || 0);
      setScoreB(details.scoreB || 0);
      setSets(details.sets || []);
      setEvents(details.events || []);

      const parsePlayers = (teamKey: 'team_a' | 'team_b'): Player[] => {
        const members = attrs[teamKey]?.data?.attributes?.members?.data || [];
        return members.map((p: any) => ({
          strapiId: p.id,
          id: p.id.toString(),
          name: p.attributes?.name || 'Unknown',
          points: p.attributes?.points_scored || 0,
          isActive: false // Default all to bench on reload to avoid complex state merge
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleScoreChange = async (team: 'A' | 'B', playerId: string, change: number) => {
    const targetTeam = team === 'A' ? teamAPlayers : teamBPlayers;
    const setTargetTeam = team === 'A' ? setTeamAPlayers : setTeamBPlayers;
    const player = targetTeam.find(p => p.id === playerId);
    
    if (!player || (player.points + change < 0)) return; 

    // Optimistic UI
    const newPoints = player.points + change;
    const newScoreA = team === 'A' ? Math.max(0, scoreA + change) : scoreA;
    const newScoreB = team === 'B' ? Math.max(0, scoreB + change) : scoreB;
    
    setTargetTeam(prev => prev.map(p => p.id === playerId ? { ...p, points: newPoints } : p));
    setScoreA(newScoreA);
    setScoreB(newScoreB);

    // Save Timeline Event
    const newEvent = {
        time: `${currentSetName} • ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
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
      await saveDetailsToStrapi({ details: { scoreA: newScoreA, scoreB: newScoreB, sets, events: updatedEvents } });
    } catch (e) {
       console.error(e);
       // We should ideally revert optimistic update here 
    } finally {
       setSaving(false);
    }
  };

  const handleEndSet = async () => {
    const newSets = [...sets, { name: currentSetName, scoreA, scoreB }];
    setSets(newSets);
    setCurrentSetName(`Set ${newSets.length + 1}`);
    await saveDetailsToStrapi({ details: { scoreA, scoreB, sets: newSets, events } });
  };

  const toggleMatchStatus = async () => {
    let newStatus: "Upcoming" | "Live" | "Past" = "Live";
    if (matchStatus === "Upcoming") newStatus = "Live";
    else if (matchStatus === "Live") newStatus = "Past";
    
    setMatchStatus(newStatus);
    await saveDetailsToStrapi({ status: newStatus });
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
           {matchStatus === "Upcoming" && <Button onClick={toggleMatchStatus} className="bg-green-600 hover:bg-green-700" disabled={saving}>Start Game</Button>}
           {matchStatus === "Live" && <Button onClick={toggleMatchStatus} variant="destructive" disabled={saving}>End Game</Button>}
           {matchStatus === "Past" && <Badge variant="secondary">Game Ended</Badge>}
           <Button variant="default" onClick={() => saveDetailsToStrapi({ details: { scoreA, scoreB, sets, events } })} disabled={saving}>
              <Save className="w-4 h-4 mr-2" /> Force Save
           </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Input 
          className="text-2xl font-bold h-12 w-full md:w-2/3 lg:w-1/2 bg-transparent border-dashed"
          value={matchName}
          onChange={(e) => setMatchName(e.target.value)}
          readOnly
        />
        <div className="text-muted-foreground text-sm flex items-center gap-2">
          Status: <Badge variant={matchStatus === "Live" ? "destructive" : "outline"} className={matchStatus === "Live" ? "animate-pulse" : ""}>{matchStatus}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Left Section: Scorecard + Players */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Main Huge Scorecard */}
          <Card className="border-4 border-primary/20 shadow-xl p-8 flex flex-col items-center justify-center min-h-[300px] bg-card/50 relative overflow-hidden">
             {matchStatus === 'Past' && <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm z-50"><h2 className="text-5xl font-black rotate-[-10deg] text-yellow-500/80">FINISHED</h2></div>}
             <div className="flex w-full justify-between items-center text-center">
                <div className="flex-1">
                  <h3 className="text-2xl md:text-4xl tracking-tight text-muted-foreground mb-4">{teamAName}</h3>
                  <div className="text-7xl md:text-9xl font-black tabular-nums">{scoreA}</div>
                </div>
                <div className="text-5xl md:text-7xl font-bold text-muted-foreground/30 px-4 md:px-8">-</div>
                <div className="flex-1">
                  <h3 className="text-2xl md:text-4xl tracking-tight text-muted-foreground mb-4">{teamBName}</h3>
                  <div className="text-7xl md:text-9xl font-black tabular-nums">{scoreB}</div>
                </div>
             </div>
           </Card>

          {/* End Set Controls (Below Scorecard) */}
          <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-lg border border-dashed">
             <Input 
               className="flex-1" 
               value={currentSetName} 
               onChange={(e) => setCurrentSetName(e.target.value)} 
               placeholder="e.g. 1st Half, Q1, Set 3"
               disabled={matchStatus !== "Live"}
             />
             <Button onClick={handleEndSet} className="w-1/3" variant="secondary" disabled={matchStatus !== "Live" || saving}>
               End {currentSetName}
             </Button>
          </div>

          {/* Player controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
             {/* Team A Players */}
             <div className="space-y-4">
               <h4 className="text-xl font-semibold border-b pb-2">{teamAName} Roster</h4>
               {teamAPlayers.length === 0 && <p className="text-sm text-muted-foreground italic">No players registered.</p>}
               {teamAPlayers.map(player => (
                 <div key={player.id} className={`flex flex-col gap-2 p-3 rounded-lg border ${player.isActive ? 'border-green-500/50 bg-green-500/5' : 'border-muted bg-muted/20 opacity-70'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button 
                          variant={player.isActive ? "default" : "outline"}
                          size="sm" 
                          className={`h-6 text-xs px-2 ${player.isActive ? 'bg-green-600 hover:bg-green-700' : ''}`}
                          onClick={() => handleToggleActive('A', player.id)}
                          disabled={matchStatus !== "Live"}
                        >
                          {player.isActive ? 'Active' : 'Bench'}
                        </Button>
                        <span className="font-semibold">{player.name}</span>
                      </div>
                      <span className="tabular-nums font-mono text-muted-foreground">Pts: {player.points}</span>
                    </div>

                    {player.isActive && matchStatus === "Live" && (
                      <div className="flex gap-2 justify-end mt-1">
                        <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleScoreChange('A', player.id, -1)} disabled={player.points === 0 || saving}>-1</Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleScoreChange('A', player.id, 1)} disabled={saving}>+1</Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleScoreChange('A', player.id, 2)} disabled={saving}>+2</Button>
                      </div>
                    )}
                 </div>
               ))}
             </div>

             {/* Team B Players */}
             <div className="space-y-4">
               <h4 className="text-xl font-semibold border-b pb-2">{teamBName} Roster</h4>
               {teamBPlayers.length === 0 && <p className="text-sm text-muted-foreground italic">No players registered.</p>}
               {teamBPlayers.map(player => (
                 <div key={player.id} className={`flex flex-col gap-2 p-3 rounded-lg border ${player.isActive ? 'border-green-500/50 bg-green-500/5' : 'border-muted bg-muted/20 opacity-70'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button 
                          variant={player.isActive ? "default" : "outline"}
                          size="sm" 
                          className={`h-6 text-xs px-2 ${player.isActive ? 'bg-green-600 hover:bg-green-700' : ''}`}
                          onClick={() => handleToggleActive('B', player.id)}
                          disabled={matchStatus !== 'Live'}
                        >
                          {player.isActive ? 'Active' : 'Bench'}
                        </Button>
                        <span className="font-semibold">{player.name}</span>
                      </div>
                      <span className="tabular-nums font-mono text-muted-foreground">Pts: {player.points}</span>
                    </div>

                    {player.isActive && matchStatus === "Live" && (
                      <div className="flex gap-2 justify-end mt-1">
                        <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleScoreChange('B', player.id, -1)} disabled={player.points === 0 || saving}>-1</Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleScoreChange('B', player.id, 1)} disabled={saving}>+1</Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleScoreChange('B', player.id, 2)} disabled={saving}>+2</Button>
                      </div>
                    )}
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Right Section: Set Stack */}
        <div className="lg:col-span-1 flex flex-col gap-4">
           <div className="flex flex-col gap-2 mt-4 relative">
             <h4 className="font-semibold text-muted-foreground mb-2">Frozen Sets</h4>
             {sets.length === 0 ? (
               <div className="text-sm text-muted-foreground italic p-4 border border-dashed rounded-lg text-center">No sets frozen yet.</div>
             ) : (
               sets.map((set: any, idx) => (
                 <Card key={idx} className={`shadow-md transition-all duration-300 w-full`} style={{ transform: `translateY(${-(sets.length - 1 - idx) * 4}px)`, zIndex: idx }}>
                   <CardHeader className="py-3 px-4">
                     <CardTitle className="text-sm">{set.name}</CardTitle>
                   </CardHeader>
                   <CardContent className="px-4 pb-4">
                     <div className="flex justify-between items-center text-xl font-bold">
                       <span>{set.scoreA}</span>
                       <span className="text-muted-foreground">-</span>
                       <span>{set.scoreB}</span>
                     </div>
                   </CardContent>
                 </Card>
               ))
             )}
           </div>
        </div>

      </div>
    </div>
  );
}
