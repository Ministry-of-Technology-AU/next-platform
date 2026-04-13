"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Search, Trophy, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

function getStrapiMediaUrl(media: any): string | null {
  if (!media?.data?.attributes?.url) return null;
  const url = media.data.attributes.url;
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
}

export default function APLMatchesPage() {
  const [rawMatches, setRawMatches] = useState<any[]>([]);
  const [rawTeams, setRawTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roundFilter, setRoundFilter] = useState('all');

  const fetchData = async () => {
    try {
      const [matchesRes, teamsRes] = await Promise.all([
        fetch('/api/platform/sports/apl/matches?populate=*'),
        fetch('/api/platform/sports/apl/teams')
      ]);

      if (matchesRes.ok) {
        const d = await matchesRes.json();
        setRawMatches(d.data || []);
      }
      if (teamsRes.ok) {
        const d = await teamsRes.json();
        setRawTeams(d.data || []);
      }
    } catch (e) {
      console.error("Error fetching matches:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // SSE for real-time updates
    const eventSource = new EventSource('/api/platform/sports/apl/sse');
    eventSource.onmessage = (event) => {
      try {
        JSON.parse(event.data);
        fetchData();
      } catch (e) {
        console.error('[SSE] Parse error:', e);
      }
    };
    eventSource.onerror = () => {
      console.warn('[SSE] Connection lost');
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const teamMap = useMemo(() => {
    const map: Record<number, any> = {};
    rawTeams.forEach(team => {
      map[team.id] = team;
    });
    return map;
  }, [rawTeams]);

  const filteredMatches = useMemo(() => {
    return rawMatches.filter(match => {
      const attrs = match.attributes || {};
      const teamA = teamMap[attrs.team_a?.data?.id];
      const teamB = teamMap[attrs.team_b?.data?.id];

      // Search filter
      const searchMatch = searchTerm === '' ||
        (teamA?.attributes?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teamB?.attributes?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (attrs.match_number && attrs.match_number.toString().includes(searchTerm));

      // Status filter
      const statusMatch = statusFilter === 'all' || attrs.status === statusFilter;

      // Round filter
      const roundMatch = roundFilter === 'all' || attrs.round === roundFilter;

      return searchMatch && statusMatch && roundMatch;
    });
  }, [rawMatches, teamMap, searchTerm, statusFilter, roundFilter]);

  const matchesByStatus = useMemo(() => {
    return {
      live: filteredMatches.filter(m => m.attributes?.status === 'live'),
      upcoming: filteredMatches.filter(m => m.attributes?.status === 'upcoming'),
      completed: filteredMatches.filter(m => m.attributes?.status === 'completed')
    };
  }, [filteredMatches]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-red-500 hover:bg-red-600 animate-pulse">LIVE</Badge>;
      case 'upcoming':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">UPCOMING</Badge>;
      case 'completed':
        return <Badge variant="secondary">COMPLETED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoundDisplay = (round: string) => {
    switch (round) {
      case 'group_stage':
        return 'Group Stage';
      case 'round_of_16':
        return 'Round of 16';
      case 'quarter_final':
        return 'Quarter Final';
      case 'semi_final':
        return 'Semi Final';
      case 'final':
        return 'Final';
      default:
        return round;
    }
  };

  const getPeriodDisplay = (period: string) => {
    switch (period) {
      case 'first_half':
        return '1st Half';
      case 'half_time':
        return 'Half Time';
      case 'second_half':
        return '2nd Half';
      case 'extra_time_first':
        return 'Extra Time 1st';
      case 'extra_time_second':
        return 'Extra Time 2nd';
      case 'penalty_shootout':
        return 'Penalties';
      case 'full_time':
        return 'Full Time';
      case 'not_started':
        return 'Not Started';
      default:
        return period;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading matches...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">APL Matches</h1>
          <p className="text-muted-foreground">View all Ashoka Premier League football matches</p>
        </div>
        <div className="flex gap-2">
          <Link href="/platform/sports/apl">
            <Button variant="outline">
              <Trophy className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link href="/platform/sports/apl/admin">
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search teams or match number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roundFilter} onValueChange={setRoundFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by round" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rounds</SelectItem>
                <SelectItem value="group_stage">Group Stage</SelectItem>
                <SelectItem value="round_of_16">Round of 16</SelectItem>
                <SelectItem value="quarter_final">Quarter Final</SelectItem>
                <SelectItem value="semi_final">Semi Final</SelectItem>
                <SelectItem value="final">Final</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Match Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({filteredMatches.length})</TabsTrigger>
          <TabsTrigger value="live" className="relative">
            Live ({matchesByStatus.live.length})
            {matchesByStatus.live.length > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({matchesByStatus.upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({matchesByStatus.completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {filteredMatches.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No matches found matching your filters.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredMatches.map((match) => {
                  const attrs = match.attributes || {};
                  const teamA = teamMap[attrs.team_a?.data?.id];
                  const teamB = teamMap[attrs.team_b?.data?.id];

                  return (
                    <Link key={match.id} href={`/platform/sports/apl/${match.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(attrs.status)}
                              {attrs.round && (
                                <Badge variant="outline">
                                  {getRoundDisplay(attrs.round)}
                                </Badge>
                              )}
                              {attrs.match_number && (
                                <Badge variant="outline">
                                  Match #{attrs.match_number}
                                </Badge>
                              )}
                            </div>
                            {attrs.start_time && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                {new Date(attrs.start_time).toLocaleDateString()}
                                <Clock className="w-4 h-4 ml-2" />
                                {new Date(attrs.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            {/* Team A */}
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                                {teamA?.attributes?.logo ? (
                                  <Image
                                    src={getStrapiMediaUrl(teamA.attributes.logo)!}
                                    alt={teamA.attributes.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-muted-foreground/20 rounded" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold">{teamA?.attributes?.name || 'TBD'}</p>
                                {attrs.status === 'completed' && (
                                  <p className="text-2xl font-bold text-primary">{attrs.team_a_score || 0}</p>
                                )}
                              </div>
                            </div>

                            {/* VS / Score */}
                            <div className="text-center">
                              {attrs.status === 'live' ? (
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-red-500">LIVE</p>
                                  <p className="text-xs text-muted-foreground">
                                    {getPeriodDisplay(attrs.period || 'not_started')}
                                  </p>
                                </div>
                              ) : attrs.status === 'completed' ? (
                                <div className="text-2xl font-bold">VS</div>
                              ) : (
                                <div className="text-lg font-semibold">VS</div>
                              )}
                            </div>

                            {/* Team B */}
                            <div className="flex items-center gap-3 justify-end">
                              <div>
                                <p className="font-semibold text-right">{teamB?.attributes?.name || 'TBD'}</p>
                                {attrs.status === 'completed' && (
                                  <p className="text-2xl font-bold text-primary text-right">{attrs.team_b_score || 0}</p>
                                )}
                              </div>
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                                {teamB?.attributes?.logo ? (
                                  <Image
                                    src={getStrapiMediaUrl(teamB.attributes.logo)!}
                                    alt={teamB.attributes.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-muted-foreground/20 rounded" />
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Live Tab */}
        <TabsContent value="live" className="mt-6">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {matchesByStatus.live.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No live matches at the moment.</p>
                  </CardContent>
                </Card>
              ) : (
                matchesByStatus.live.map((match) => {
                  const attrs = match.attributes || {};
                  const teamA = teamMap[attrs.team_a?.data?.id];
                  const teamB = teamMap[attrs.team_b?.data?.id];

                  return (
                    <Link key={match.id} href={`/platform/sports/apl/${match.id}`}>
                      <Card className="border-red-200 hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <Badge className="bg-red-500 hover:bg-red-600 animate-pulse">LIVE NOW</Badge>
                            <p className="text-sm text-muted-foreground">
                              {getPeriodDisplay(attrs.period || 'not_started')}
                            </p>
                          </div>

                          <div className="grid grid-cols-3 gap-4 items-center">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto mb-2 overflow-hidden">
                                {teamA?.attributes?.logo ? (
                                  <Image
                                    src={getStrapiMediaUrl(teamA.attributes.logo)!}
                                    alt={teamA.attributes.name}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-muted-foreground/20 rounded" />
                                )}
                              </div>
                              <p className="font-semibold">{teamA?.attributes?.name || 'TBD'}</p>
                              <p className="text-3xl font-bold text-primary">{attrs.team_a_score || 0}</p>
                            </div>

                            <div className="text-center">
                              <div className="text-4xl font-bold text-red-500 animate-pulse">VS</div>
                            </div>

                            <div className="text-center">
                              <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto mb-2 overflow-hidden">
                                {teamB?.attributes?.logo ? (
                                  <Image
                                    src={getStrapiMediaUrl(teamB.attributes.logo)!}
                                    alt={teamB.attributes.name}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-muted-foreground/20 rounded" />
                                )}
                              </div>
                              <p className="font-semibold">{teamB?.attributes?.name || 'TBD'}</p>
                              <p className="text-3xl font-bold text-primary">{attrs.team_b_score || 0}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Similar structure for upcoming and completed tabs */}
        <TabsContent value="upcoming" className="mt-6">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {matchesByStatus.upcoming.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No upcoming matches scheduled.</p>
                  </CardContent>
                </Card>
              ) : (
                matchesByStatus.upcoming.map((match) => {
                  const attrs = match.attributes || {};
                  const teamA = teamMap[attrs.team_a?.data?.id];
                  const teamB = teamMap[attrs.team_b?.data?.id];

                  return (
                    <Link key={match.id} href={`/platform/sports/apl/${match.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline" className="border-blue-500 text-blue-500">UPCOMING</Badge>
                            {attrs.start_time && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                {new Date(attrs.start_time).toLocaleDateString()}
                                <Clock className="w-4 h-4 ml-2" />
                                {new Date(attrs.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-4 items-center">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2 overflow-hidden">
                                {teamA?.attributes?.logo ? (
                                  <Image
                                    src={getStrapiMediaUrl(teamA.attributes.logo)!}
                                    alt={teamA.attributes.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-muted-foreground/20 rounded" />
                                )}
                              </div>
                              <p className="font-semibold">{teamA?.attributes?.name || 'TBD'}</p>
                            </div>

                            <div className="text-center">
                              <div className="text-lg font-semibold">VS</div>
                            </div>

                            <div className="text-center">
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2 overflow-hidden">
                                {teamB?.attributes?.logo ? (
                                  <Image
                                    src={getStrapiMediaUrl(teamB.attributes.logo)!}
                                    alt={teamB.attributes.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-muted-foreground/20 rounded" />
                                )}
                              </div>
                              <p className="font-semibold">{teamB?.attributes?.name || 'TBD'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {matchesByStatus.completed.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No completed matches yet.</p>
                  </CardContent>
                </Card>
              ) : (
                matchesByStatus.completed.map((match) => {
                  const attrs = match.attributes || {};
                  const teamA = teamMap[attrs.team_a?.data?.id];
                  const teamB = teamMap[attrs.team_b?.data?.id];

                  return (
                    <Link key={match.id} href={`/platform/sports/apl/${match.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <Badge variant="secondary">COMPLETED</Badge>
                            <p className="text-sm text-muted-foreground">
                              Final Score
                            </p>
                          </div>

                          <div className="grid grid-cols-3 gap-4 items-center">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2 overflow-hidden">
                                {teamA?.attributes?.logo ? (
                                  <Image
                                    src={getStrapiMediaUrl(teamA.attributes.logo)!}
                                    alt={teamA.attributes.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-muted-foreground/20 rounded" />
                                )}
                              </div>
                              <p className="font-semibold">{teamA?.attributes?.name || 'TBD'}</p>
                              <p className={`text-2xl font-bold ${attrs.team_a_score > attrs.team_b_score ? 'text-green-600' : 'text-muted-foreground'}`}>
                                {attrs.team_a_score || 0}
                              </p>
                            </div>

                            <div className="text-center">
                              <div className="text-2xl font-bold">VS</div>
                            </div>

                            <div className="text-center">
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2 overflow-hidden">
                                {teamB?.attributes?.logo ? (
                                  <Image
                                    src={getStrapiMediaUrl(teamB.attributes.logo)!}
                                    alt={teamB.attributes.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-muted-foreground/20 rounded" />
                                )}
                              </div>
                              <p className="font-semibold">{teamB?.attributes?.name || 'TBD'}</p>
                              <p className={`text-2xl font-bold ${attrs.team_b_score > attrs.team_a_score ? 'text-green-600' : 'text-muted-foreground'}`}>
                                {attrs.team_b_score || 0}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}