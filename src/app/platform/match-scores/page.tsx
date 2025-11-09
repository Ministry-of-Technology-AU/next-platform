'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { strapiGet } from '@/lib/apis/strapi';
import clsx from 'clsx';
import { X } from 'lucide-react';

interface MatchScore {
  id: number;
  match_name: string;
  league_name: string;
  sport?: string;
  status?: string;
  team_a_name: string;
  team_b_name: string;
  team_a_score: number;
  team_b_score: number;
  date?: string;
  team_a_logo?: any;
  team_b_logo?: any;
}

export default function MatchScoresPage() {
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [activeMatch, setActiveMatch] = useState<MatchScore | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Ref to store persistent active match ID (avoids re-render resets)
  const activeMatchIdRef = useRef<number | null>(null);

  // ✅ Reuse STRAPI_URL, strip /api for media
  const STRAPI_BASE_URL =
    (process.env.STRAPI_URL?.replace(/\/api$/, '') || 'http://localhost:1337');

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
      const res = await strapiGet('/match-scores', {
        populate: {
          team_a_logo: { fields: ['url'] },
          team_b_logo: { fields: ['url'] },
        },
        sort: ['date:desc'],
        pagination: { limit: 50 },
      });

      const data = res?.data?.map((d: any) => ({
        id: d.id,
        ...d.attributes,
      }));

      setMatches(data || []);

      if (data?.length > 0) {
        const currentId = activeMatchIdRef.current;
        const stillExists = data.find((m) => m.id === currentId);
        if (stillExists) {
          // ✅ Match still exists → keep it active
          setActiveMatch(stillExists);
          setActiveId(stillExists.id);
        } else if (!currentId) {
          // ✅ No match selected yet → pick the first one
          setActiveMatch(data[0]);
          setActiveId(data[0].id);
          activeMatchIdRef.current = data[0].id;
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
    const sse = new EventSource('/api/strapi-stream');
    sse.onmessage = (event) => {
      if (event.data === 'ping') return;
      console.log('📡 SSE update received:', event.data);
      fetchMatches(true);
    };
    sse.onerror = (err) => console.error('SSE connection error:', err);
    return () => sse.close();
  }, []);

  // Persistent localStorage (optional)
  useEffect(() => {
    const saved = localStorage.getItem('activeMatchId');
    if (saved) {
      activeMatchIdRef.current = parseInt(saved);
      setActiveId(parseInt(saved));
    }
  }, []);

  useEffect(() => {
    if (activeMatchIdRef.current) {
      localStorage.setItem('activeMatchId', String(activeMatchIdRef.current));
    }
  }, [activeMatchIdRef.current]);

  // 🧩 When user selects a match manually
  const handleMatchSelect = (match: MatchScore) => {
    setActiveMatch(match);
    setActiveId(match.id);
    activeMatchIdRef.current = match.id;
  };

  const filteredMatches = useMemo(() => {
    return matches
      .filter((m) => {
        const query = search.toLowerCase();
        return (
          m.match_name?.toLowerCase().includes(query) ||
          m.league_name?.toLowerCase().includes(query) ||
          m.team_a_name?.toLowerCase().includes(query) ||
          m.team_b_name?.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const da = new Date(a.date || 0).getTime();
        const db = new Date(b.date || 0).getTime();
        return db - da;
      });
  }, [matches, search]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const statusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'live':
        return 'text-green-600 dark:text-green-400';
      case 'paused':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'completed':
        return 'text-neutral-600 dark:text-neutral-400';
      default:
        return 'text-neutral-500 dark:text-neutral-500';
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-var(--app-header-height,64px))] items-center justify-center text-neutral-500 dark:text-neutral-400">
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

  const Box = ({
    name,
    score,
    logo,
    gradient,
  }: {
    name: string;
    score: number | string;
    logo: string | null;
    gradient: string;
  }) => (
    <div
      className={`relative flex flex-col items-center justify-center rounded-3xl shadow-md p-8 md:p-10 w-64 md:w-80 text-white overflow-hidden border border-white/10 dark:border-neutral-800 ${gradient}`}
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
        <h2 className="text-xl md:text-2xl font-semibold mb-3 text-center drop-shadow-lg tracking-wide">
          {name}
        </h2>
        <div className="text-6xl md:text-7xl font-extrabold drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
          {score}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 flex flex-col md:flex-row"
      style={{
        paddingTop: 'var(--app-header-height, 64px)',
        paddingLeft: 'var(--app-sidebar-width, 72px)',
      }}
    >
      {/* Main content */}
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="flex flex-col items-center space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-extrabold uppercase text-black dark:text-white leading-tight drop-shadow-sm">
              {activeMatch.league_name}
            </h1>
            <h2 className="text-2xl md:text-4xl font-semibold text-neutral-800 dark:text-neutral-100">
              {activeMatch.match_name}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {formatDate(activeMatch.date)}{' '}
              {activeMatch.status && (
                <span className={clsx('ml-2 font-medium', statusColor(activeMatch.status))}>
                  {activeMatch.status}
                </span>
              )}
            </p>
            {lastUpdated && (
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                Updated {lastUpdated.toLocaleTimeString('en-IN')}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Box
              name={activeMatch.team_a_name}
              score={activeMatch.team_a_score}
              logo={logoA}
              gradient="bg-gradient-to-br from-blue-900/80 to-indigo-950/80 dark:from-blue-800/80 dark:to-indigo-900/80"
            />
            <div className="text-2xl font-semibold text-neutral-600 dark:text-neutral-400 select-none">
              vs
            </div>
            <Box
              name={activeMatch.team_b_name}
              score={activeMatch.team_b_score}
              logo={logoB}
              gradient="bg-gradient-to-br from-rose-900/80 to-pink-950/80 dark:from-rose-800/80 dark:to-pink-900/80"
            />
          </div>
        </div>
      </div>

      {/* Right Sidebar (Desktop) */}
      <aside className="hidden md:flex w-80 border-l border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/40 backdrop-blur-sm overflow-y-auto p-4 flex-col">
        <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-3 px-2">
          All Matches
        </h3>

        <input
          type="text"
          placeholder="Search matches..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3 w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {filteredMatches.map((m) => (
          <button
            key={m.id}
            onClick={() => handleMatchSelect(m)}
            className={clsx(
              'w-full text-left rounded-xl px-4 py-3 transition-all border mb-2',
              activeMatch.id === m.id
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-neutral-50/60 dark:bg-neutral-900/40 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60 border-transparent'
            )}
          >
            <div className="text-sm font-semibold truncate">{m.match_name}</div>
            <div className="text-xs opacity-80 truncate">
              {m.team_a_name} vs {m.team_b_name}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] uppercase tracking-wide opacity-70">
              <span>{formatDate(m.date)}</span>
              {m.status && (
                <span className={clsx('font-medium', statusColor(m.status))}>
                  {m.status}
                </span>
              )}
            </div>
          </button>
        ))}
      </aside>

      {/* 🧭 Mobile Modal Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end">
          <div className="bg-white dark:bg-neutral-950 rounded-t-2xl p-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                Other Matches
              </h3>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-neutral-600 dark:text-neutral-400"
              >
                <X size={20} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Search matches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full mb-4 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {filteredMatches.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  handleMatchSelect(m);
                  setMobileMenuOpen(false);
                }}
                className={clsx(
                  'w-full text-left rounded-xl px-4 py-3 transition-all border mb-2',
                  activeMatch.id === m.id
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-neutral-100 dark:bg-neutral-900/40 text-neutral-800 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800/60 border-transparent'
                )}
              >
                <div className="text-sm font-semibold truncate">{m.match_name}</div>
                <div className="text-xs opacity-80 truncate">
                  {m.team_a_name} vs {m.team_b_name}
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] uppercase tracking-wide opacity-70">
                  <span>{formatDate(m.date)}</span>
                  {m.status && (
                    <span className={clsx('font-medium', statusColor(m.status))}>
                      {m.status}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ⚡ Floating button (mobile only) */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-medium px-6 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition"
      >
        Other Matches
      </button>
    </div>
  );
}
