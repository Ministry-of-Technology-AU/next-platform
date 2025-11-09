'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { strapiPost, strapiPut } from '@/lib/apis/strapi';
import clsx from 'clsx';


export default function MatchForm({ existing, onClose, onSaved }: any) {
  const [form, setForm] = useState({
    match_name: existing?.attributes.match_name || '',
    league_name: existing?.attributes.league_name || '',
    team_a_name: existing?.attributes.team_a_name || '',
    team_b_name: existing?.attributes.team_b_name || '',
    team_a_score: existing?.attributes.team_a_score || 0,
    team_b_score: existing?.attributes.team_b_score || 0,
    date: existing?.attributes.date?.split('T')[0] || '',
    status: existing?.attributes.status || 'upcoming',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (existing) {
        await strapiPut(`/match-scores/${existing.id}`, { data: form });
      } else {
        await strapiPost('/match-scores', { data: form });
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save match:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
            {existing ? 'Edit Match' : 'Add Match'}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'match_name', label: 'Match Name' },
            { key: 'league_name', label: 'League Name' },
            { key: 'team_a_name', label: 'Team A Name' },
            { key: 'team_b_name', label: 'Team B Name' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input
                type="text"
                value={form[key as keyof typeof form] as string}
                onChange={(e) =>
                  setForm({ ...form, [key]: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-100"
              />
            </div>
          ))}

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Team A Score</label>
              <input
                type="number"
                value={form.team_a_score}
                onChange={(e) =>
                  setForm({ ...form, team_a_score: parseInt(e.target.value) })
                }
                className="w-full border rounded-lg px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Team B Score</label>
              <input
                type="number"
                value={form.team_b_score}
                onChange={(e) =>
                  setForm({ ...form, team_b_score: parseInt(e.target.value) })
                }
                className="w-full border rounded-lg px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
            >
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={clsx(
              'w-full flex justify-center items-center gap-2 mt-4 px-4 py-2 rounded-lg font-medium text-white transition',
              saving
                ? 'bg-indigo-400 cursor-wait'
                : 'bg-indigo-600 hover:bg-indigo-700'
            )}
          >
            {saving ? <Loader2 className="animate-spin" /> : 'Save Match'}
          </button>
        </form>
      </div>
    </div>
  );
}
