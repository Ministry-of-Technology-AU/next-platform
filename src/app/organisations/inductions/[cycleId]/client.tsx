'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { BarChart3, Users2, Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoleCard } from '../_components/role-card';
import { NewRoleDialog } from '../_components/new-role-dialog';
import type { InductionCycleSummary, InductionRole } from '../types';
import { PLACEHOLDER_ROLE_STATS } from '../types';

// Stat card (reusable)
function StatCard({
  label,
  value,
  accent = 'primary',
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-5">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <h3 className="text-2xl font-bold text-foreground mt-1">{value}</h3>
    </div>
  );
}

export function CycleClient({
  cycleId,
  cycle,
  initialRoles,
}: {
  cycleId: string;
  cycle: InductionCycleSummary;
  initialRoles: InductionRole[];
}) {
  const [roles, setRoles] = useState<InductionRole[]>(initialRoles);
  const [pendingDelete, setPendingDelete] = useState<InductionRole | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [hashAdd, setHashAdd] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#add') {
      setHashAdd(true);
    }
  }, []);

  const handleRoleCreated = (role: InductionRole) => {
    setRoles((prev) => [role, ...prev]);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/organisations/inductions/roles/${pendingDelete.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Could not delete role');
      }

      setRoles((prev) => prev.filter((r) => r.id !== pendingDelete.id));
      toast.success('Role deleted');
      setPendingDelete(null);
    } catch (err: any) {
      toast.error(err.message || 'Could not delete the role');
    } finally {
      setDeleting(false);
    }
  };

  // Chart data: role-wise distribution
  const chartData = roles.map((r) => ({
    name: r.name.length > 12 ? r.name.slice(0, 12) + '…' : r.name,
    applications: r.stats?.fills || 0,
    opens: r.stats?.opens || 0,
  }));

  const completionPct = Math.round((cycle.stats?.completionRate || 0) * 100);

  return (
    <div className="mt-6 space-y-8">
      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Opens" value={cycle.stats?.totalOpens || 0} />
        <StatCard label="Total Fills" value={cycle.stats?.totalFills || 0} />
        <StatCard label="Overall Completion Rate" value={`${completionPct}%`} />
      </div>

      {/* Role-wise distribution chart */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-gray-dark/15 rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-primary dark:text-primary-bright !text-left">
              Role-wise Application Distribution
            </h3>
            <Badge className="bg-primary/10 text-primary border border-primary/20 dark:bg-secondary-dark/20 dark:text-secondary-light dark:border-secondary-dark/30 px-2.5 py-0.5 rounded text-xs font-semibold">
              {roles.length} role{roles.length === 1 ? '' : 's'}
            </Badge>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5' }}
                />
                <Bar dataKey="applications" name="Applications" fill="#87281b" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="opens" name="Opens" fill="#ffcd74" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Roles section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold !text-left">Roles</h3>
            <p className="text-sm text-muted-foreground">
              {roles.length === 0 ? 'No roles yet.' : `${roles.length} role${roles.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <NewRoleDialog cycleId={cycleId} autoOpen={hashAdd} onCreated={handleRoleCreated} />
        </div>

        {roles.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users2 className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-semibold">Add your first role</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Define the positions you&apos;re recruiting for — each role gets its own application
              pipeline, forms, and applicant tracking.
            </p>
            <div className="mt-5">
              <NewRoleDialog cycleId={cycleId} onCreated={handleRoleCreated} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {roles.map((role) => (
              <RoleCard key={role.id} role={role} cycleId={cycleId} onDelete={setPendingDelete} />
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this role?</DialogTitle>
            <DialogDescription>
              &ldquo;{pendingDelete?.name}&rdquo; and all its pipeline rounds and form data will be
              permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={deleting}
              className="gap-1.5"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
