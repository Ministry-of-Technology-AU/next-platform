'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { strapiPost, strapiPut } from '@/lib/apis/strapi';
import clsx from 'clsx';


export default function MatchForm({ existing, onClose, onSaved }: any) {
  const [form, setForm] = useState({
    match_name: '',
    sport: '',
    league_name: '',
    team_a_name: '',
    team_b_name: '',
    team_a_score: 0,
    team_b_score: 0,
    team_a_color: '#0000ff', // Default blue
    team_b_color: '#ff0000', // Default red
    date: new Date().toISOString().split('T')[0],
    match_status: 'upcoming',
  });
  
  const [teamALogo, setTeamALogo] = useState<File | null>(null);
  const [teamBLogo, setTeamBLogo] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add the main form data
      formData.append('data', JSON.stringify(form));
      
      // Add logo files if they exist
      if (teamALogo) {
        formData.append('files.team_a_logo', teamALogo);
      }
      if (teamBLogo) {
        formData.append('files.team_b_logo', teamBLogo);
      }

      const res = await fetch('/api/platform/match-admin', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to save match');
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save match:', err);
      alert('Failed to save match. Please try again.');
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
          {/* Match Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Match Name</label>
              <input
                type="text"
                value={form.match_name}
                onChange={(e) => setForm({ ...form, match_name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sport</label>
              <input
                type="text"
                value={form.sport}
                onChange={(e) => setForm({ ...form, sport: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">League Name</label>
              <input
                type="text"
                value={form.league_name}
                onChange={(e) => setForm({ ...form, league_name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-100"
                required
              />
            </div>
          </div>

          {/* Team A Details */}
          <div className="space-y-4 pb-4 border-b dark:border-neutral-700">
            <div>
              <label className="block text-sm font-medium mb-1">Team A Name</label>
              <input
                type="text"
                value={form.team_a_name}
                onChange={(e) => setForm({ ...form, team_a_name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-100"
                required
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Team A Score</label>
                <input
                  type="number"
                  value={form.team_a_score}
                  onChange={(e) => setForm({ ...form, team_a_score: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                  min="0"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Team A Color</label>
                <input
                  type="color"
                  value={form.team_a_color}
                  onChange={(e) => setForm({ ...form, team_a_color: e.target.value })}
                  className="w-full border rounded-lg h-[42px] px-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Team A Logo</label>
              <input
                type="file"
                onChange={(e) => setTeamALogo(e.target.files?.[0] || null)}
                accept="image/*"
                className="w-full border rounded-lg px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
              />
            </div>
          </div>

          {/* Team B Details */}
          <div className="space-y-4 pb-4 border-b dark:border-neutral-700">
            <div>
              <label className="block text-sm font-medium mb-1">Team B Name</label>
              <input
                type="text"
                value={form.team_b_name}
                onChange={(e) => setForm({ ...form, team_b_name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-100"
                required
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Team B Score</label>
                <input
                  type="number"
                  value={form.team_b_score}
                  onChange={(e) => setForm({ ...form, team_b_score: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                  min="0"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Team B Color</label>
                <input
                  type="color"
                  value={form.team_b_color}
                  onChange={(e) => setForm({ ...form, team_b_color: e.target.value })}
                  className="w-full border rounded-lg h-[42px] px-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Team B Logo</label>
              <input
                type="file"
                onChange={(e) => setTeamBLogo(e.target.files?.[0] || null)}
                accept="image/*"
                className="w-full border rounded-lg px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
              />
            </div>
          </div>

          {/* Match Status and Date */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                required
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={form.match_status}
                onChange={(e) => setForm({ ...form, match_status: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                required
              >
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
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
