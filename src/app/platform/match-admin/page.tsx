'use client';

import { useEffect, useState } from 'react';
import { strapiGet, strapiPut, strapiPost, strapiDelete } from '@/lib/apis/strapi';
  import {
  Plus,
  Trash2,
  Loader2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import clsx from 'clsx';
import MatchForm from './form';

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const [saving, setSaving] = useState(false);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/platform/match-admin');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMatches(data);
    } catch (err) {
      console.error('❌ Failed to fetch matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const updateMatch = async (id: number, patch: any) => {
    setSaving(true);
    try {
      const res = await fetch('/api/platform/match-admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, data: patch })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      await fetchMatches();
    } catch (err) {
      console.error('Failed to update match:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleScoreChange = (id: number, team: 'a' | 'b', delta: number) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const key = team === 'a' ? 'team_a_score' : 'team_b_score';
        const current = Number(m[key] ?? 0);
        const newScore = Math.max(0, current + delta);
        updateMatch(id, { [key]: newScore });
        return { ...m, [key]: newScore };
      })
    );
  };



  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this match?')) return;
    try {
      const res = await fetch('/api/platform/match-admin', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setMatches((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Failed to delete match:', err);
    }
  };

  const logoUrl = (media: any): string | null => {
    const data = media?.data;
    const file = Array.isArray(data) ? data[0] : data;
    const url = file?.attributes?.url;
    if (!url) return null;
    const base =
      process.env.STRAPI_URL?.replace(/\/api$/, '') || 'http://localhost:1337';
    return url.startsWith('http') ? url : `${base}${url}`;
  };

  return (
    <div className="min-h-screen p-8 bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Match Admin
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFormOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              <Plus size={18} /> New Match
            </button>
            <button onClick={fetchMatches} className="px-3 py-2 rounded border">
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40 text-neutral-500">
            <Loader2 className="animate-spin mr-2" /> Loading matches…
          </div>
        ) : matches.length === 0 ? (
          <p className="text-neutral-600 dark:text-neutral-400">No matches yet.</p>
        ) : (
          <div className="space-y-4">
            {matches.map((m) => (
              <div
                key={m.id}
                className="bg-white dark:bg-neutral-900 rounded-lg shadow p-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold">{m.match_name}</h2>
                    <p className="text-sm text-neutral-500">
                      {m.league_name} —{' '}
                      {m.date ? new Date(m.date).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === m.id ? null : m.id)
                      }
                      className="px-3 py-1 text-sm rounded border"
                    >
                      {expandedId === m.id ? 'Hide' : 'Manage'}
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-2 rounded hover:bg-rose-100 dark:hover:bg-rose-900/40"
                    >
                      <Trash2 size={16} className="text-rose-600" />
                    </button>
                  </div>
                </div>

                {expandedId === m.id && (
                  <div className="mt-6 border-t border-neutral-200 dark:border-neutral-800 pt-4">
                    <div className="flex flex-col sm:flex-row items-center justify-around gap-8">
                      <TeamBox
                        name={m.team_a_name}
                        logo={logoUrl(m.team_a_logo)}
                        score={m.team_a_score}
                        onScoreChange={(d) => handleScoreChange(m.id, 'a', d)}
                        disabled={m.status === 'completed'}
                      />
                      <div className="text-2xl font-bold text-neutral-600 dark:text-neutral-400 select-none">
                        VS
                      </div>
                      <TeamBox
                        name={m.team_b_name}
                        logo={logoUrl(m.team_b_logo)}
                        score={m.team_b_score}
                        onScoreChange={(d) => handleScoreChange(m.id, 'b', d)}
                        disabled={m.status === 'completed'}
                      />
                    </div>



                    {saving && (
                      <p className="text-center mt-4 text-sm text-neutral-400">
                        Saving changes...
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <MatchForm
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            fetchMatches();
          }}
        />
      )}
    </div>
  );
}

interface TeamBoxProps {
  name: string;
  logo: string | null;
  score: number;
  onScoreChange: (delta: number) => void;
  disabled: boolean;
}

function TeamBox({ name, logo, score, onScoreChange, disabled }: TeamBoxProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {logo && (
        <img
          src={logo}
          alt={name}
          className="w-20 h-20 object-contain opacity-90 drop-shadow-md"
        />
      )}
      <div className="text-lg font-semibold">{name}</div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onScoreChange(+1)}
          disabled={disabled}
          className={clsx(
            'p-3 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <ArrowUp />
        </button>
        <div className="text-5xl font-extrabold">{Number(score ?? 0)}</div>
        <button
          onClick={() => onScoreChange(-1)}
          disabled={disabled}
          className={clsx(
            'p-3 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <ArrowDown />
        </button>
      </div>
    </div>
  );
}
