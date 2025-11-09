'use client';

import { useEffect, useState, useMemo } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import clsx from 'clsx';

interface MatchScore {
  id: number;
  match_name: string;
  league_name: string;
  sport?: string;
  match_status?: 'upcoming' | 'live' | 'paused' | 'completed' | 'cancelled';
  team_a_name: string;
  team_b_name: string;
  team_a_score: number;
  team_b_score: number;
  team_a_color?: string;
  team_b_color?: string;
  date?: string;
  team_a_logo?: any;
  team_b_logo?: any;
}

export default function StadiumDisplayPage() {
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [activeMatch, setActiveMatch] = useState<MatchScore | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  
  // Filter states
  const [leagueFilter, setLeagueFilter] = useState<string>('all');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // ✅ Reuse STRAPI_URL, strip /api for media
  const STRAPI_BASE_URL = (process.env.STRAPI_URL?.replace(/\/api$/, '') || 'http://localhost:1337');

  const getMediaUrl = (media: any): string | null => {
    const data = media?.data;
    if (!data) return null;
    const file = Array.isArray(data) ? data[0] : data;
    const url = file?.attributes?.url;
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${STRAPI_BASE_URL}${url}`;
  };

  // 🧭 Fetch matches
  const fetchMatches = async (silent = false) => {
    try {
      const res = await fetch('/api/platform/match-scores');
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      setMatches(data);

      // Set active match to the first match that matches current filters
      if (data?.length > 0) {
        const filtered = filterMatches(data);
        if (filtered.length > 0) {
          setActiveMatch(filtered[0]);
        }
      }

      setLoading(false);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('❌ Failed to fetch matches:', err);
      setLoading(false);
    }
  };

  // Initial load + interval refetch
  useEffect(() => {
    fetchMatches();
    const interval = setInterval(() => fetchMatches(true), 15000);
    return () => clearInterval(interval);
  }, []);

  // SSE (live update)
  useEffect(() => {
    let source = new EventSource('/api/strapi-stream');
    let isActive = true;
    
    source.onmessage = (event) => {
      if (!isActive || event.data === 'connected') return;
      try {
        const data = JSON.parse(event.data);
        if (data.model === 'match-score' && data.entry) {
          setMatches(prev => prev.map(m => 
            m.id === data.entry.id ? { ...m, ...data.entry } : m
          ));
          if (activeMatch?.id === data.entry.id) {
            setActiveMatch(prev => prev ? { ...prev, ...data.entry } : prev);
          }
          setLastUpdated(new Date());
        }
      } catch (err) {
        console.error('Failed to parse SSE data:', err);
      }
    };

    source.onerror = () => {
      if (!isActive) return;
      source.close();
      setTimeout(() => {
        if (isActive) {
          source = new EventSource('/api/strapi-stream');
        }
      }, 1000);
    };

    return () => {
      isActive = false;
      source.close();
    };
  }, [activeMatch?.id]);

  // Get unique values for filters
  const { leagues, sports, statuses } = useMemo(() => {
    const leagues = new Set<string>();
    const sports = new Set<string>();
    const statuses = new Set<string>();

    matches.forEach(m => {
      if (m.league_name) leagues.add(m.league_name);
      if (m.sport) sports.add(m.sport);
      if (m.match_status) statuses.add(m.match_status);
    });

    return {
      leagues: Array.from(leagues).sort(),
      sports: Array.from(sports).sort(),
      statuses: Array.from(statuses).sort()
    };
  }, [matches]);

  const filterMatches = (matchesToFilter: MatchScore[]) => {
    return matchesToFilter
      .filter((m) => {
        // Text search
        const query = search.toLowerCase();
        const matchesSearch = 
          m.match_name?.toLowerCase().includes(query) ||
          m.league_name?.toLowerCase().includes(query) ||
          m.team_a_name?.toLowerCase().includes(query) ||
          m.team_b_name?.toLowerCase().includes(query);

        // Filter conditions
        const matchesLeague = leagueFilter === 'all' || m.league_name === leagueFilter;
        const matchesSport = sportFilter === 'all' || m.sport === sportFilter;
        const matchesStatus = statusFilter === 'all' || m.match_status === statusFilter;

        return matchesSearch && matchesLeague && matchesSport && matchesStatus;
      })
      .sort((a, b) => {
        const da = new Date(a.date || 0).getTime();
        const db = new Date(b.date || 0).getTime();
        return db - da;
      });
  };

  const filteredMatches = useMemo(() => filterMatches(matches), 
    [matches, search, leagueFilter, sportFilter, statusFilter]
  );

  // Update active match when filters change if current one doesn't match
  useEffect(() => {
    if (activeMatch && !filteredMatches.some(m => m.id === activeMatch.id)) {
      setActiveMatch(filteredMatches[0] || null);
    }
  }, [filteredMatches, activeMatch]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const statusColor = (status?: MatchScore['match_status']) => {
    switch (status?.toLowerCase()) {
      case 'live':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'upcoming':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'paused':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'completed':
        return 'bg-neutral-100 dark:bg-neutral-900/30 text-neutral-700 dark:text-neutral-300';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default:
        return 'bg-neutral-100 dark:bg-neutral-900/30 text-neutral-700 dark:text-neutral-300';
    }
  };

  const Box = ({
    name,
    score,
    logo,
    color,
  }: {
    name: string;
    score: number | string;
    logo: string | null;
    color: string;
  }) => {
    // Create a darker version of the color for the gradient
    const darkerColor = color + "dd"; // Adding transparency
    
    return (
      <div
        className="relative flex flex-col items-center justify-center rounded-3xl shadow-md p-8 md:p-10 w-80 md:w-96 text-white overflow-hidden border border-white/10 dark:border-neutral-800"
        style={{
          background: `linear-gradient(135deg, ${color}cc, ${darkerColor})`,
        }}
      >
        {logo && (
          <img
            src={logo}
            alt={name}
            style={{ opacity: 0.15 }}
            className="absolute inset-0 m-auto w-2/3 h-2/3 object-contain pointer-events-none select-none brightness-50 saturate-50 blur-[1px]"
          />
        )}
        <div className="absolute inset-0 bg-black/30 dark:bg-black/40" />
        <div className="relative z-10 flex flex-col items-center justify-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-center drop-shadow-lg tracking-wide">
            {name}
          </h2>
          <div className="text-7xl md:text-8xl font-extrabold drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
            {score}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-neutral-500 dark:text-neutral-400">
        Loading matches…
      </div>
    );
  }

  if (!activeMatch) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-neutral-500 dark:text-neutral-400">
        <p>No matches available.</p>
      </div>
    );
  }

  const logoA = getMediaUrl(activeMatch.team_a_logo);
  const logoB = getMediaUrl(activeMatch.team_b_logo);

  return (
    <div className="fixed inset-0 bg-white dark:bg-black" style={{ margin: 0, padding: 0 }}>
      {/* Main content - Full screen mode */}
      <div className="flex flex-1 h-screen items-center justify-center" style={{ margin: 0, padding: 0 }}>
        <div className="flex flex-col items-center space-y-12 px-4">
          <div className="text-center space-y-4">
            <h1 className="text-6xl md:text-8xl font-extrabold uppercase text-black dark:text-white leading-tight drop-shadow-sm">
              {activeMatch.league_name}
            </h1>
            <h2 className="text-3xl md:text-5xl font-semibold text-neutral-800 dark:text-neutral-100">
              {activeMatch.match_name}
            </h2>
            <p className="text-lg md:text-xl text-neutral-500 dark:text-neutral-400">
              {formatDate(activeMatch.date)}{' '}
              {activeMatch.match_status && (
                <span className={clsx('ml-2 font-medium px-3 py-1 rounded-full', statusColor(activeMatch.match_status))}>
                  {activeMatch.match_status}
                </span>
              )}
            </p>
            {lastUpdated && (
              <p className="text-sm text-neutral-400 dark:text-neutral-500">
                Updated {lastUpdated.toLocaleTimeString('en-IN')}
              </p>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16">
            <Box
              name={activeMatch.team_a_name}
              score={activeMatch.team_a_score}
              logo={logoA}
              color={activeMatch.team_a_color || '#1e3a8a'}
            />
            <div className="text-4xl md:text-5xl font-semibold text-neutral-600 dark:text-neutral-400 select-none">
              vs
            </div>
            <Box
              name={activeMatch.team_b_name}
              score={activeMatch.team_b_score}
              logo={logoB}
              color={activeMatch.team_b_color || '#881337'}
            />
          </div>
        </div>
      </div>

      {/* Filter Button */}
      <button
        onClick={() => setFilterMenuOpen(true)}
        className="fixed bottom-6 right-6 bg-neutral-900 dark:bg-white text-white dark:text-black p-3 rounded-full shadow-lg hover:opacity-90 transition-opacity"
        title="Show Filters"
      >
        <SlidersHorizontal size={24} />
      </button>

      {/* Filter Menu Modal */}
      {filterMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setFilterMenuOpen(false)}>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
                Match Filters
              </h3>
              <button
                onClick={() => setFilterMenuOpen(false)}
                className="text-neutral-600 dark:text-neutral-400 hover:opacity-80"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Search matches..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <select
                value={leagueFilter}
                onChange={(e) => setLeagueFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
              >
                <option value="all">All Leagues</option>
                {leagues.map(league => (
                  <option key={league} value={league}>{league}</option>
                ))}
              </select>

              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
              >
                <option value="all">All Sports</option>
                {sports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
              >
                <option value="all">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="mt-6 space-y-2">
              {filteredMatches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setActiveMatch(m);
                    setFilterMenuOpen(false);
                  }}
                  className={clsx(
                    'w-full text-left rounded-xl px-4 py-3 transition-all border',
                    activeMatch.id === m.id
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-transparent'
                  )}
                >
                  <div className="font-semibold">{m.match_name}</div>
                  <div className="text-sm opacity-80">
                    {m.team_a_name} vs {m.team_b_name}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    {m.league_name && (
                      <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {m.league_name}
                      </span>
                    )}
                    {m.match_status && (
                      <span className={clsx('px-2 py-0.5 rounded', statusColor(m.match_status))}>
                        {m.match_status}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}