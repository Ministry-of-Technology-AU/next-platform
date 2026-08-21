'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Layers, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CycleStatsBar } from './_components/cycle-stats';
import { CycleCard } from './_components/cycle-card';
import { NewCycleDialog } from './_components/new-cycle-dialog';
import type { InductionCycleSummary, CycleStats } from './types';
import { PLACEHOLDER_CYCLE_STATS } from './types';

function aggregateStats(cycles: InductionCycleSummary[]): CycleStats {
  if (cycles.length === 0) return PLACEHOLDER_CYCLE_STATS;
  return {
    totalOpens: cycles.reduce((a, c) => a + (c.stats?.totalOpens || 0), 0),
    totalFills: cycles.reduce((a, c) => a + (c.stats?.totalFills || 0), 0),
    completionRate:
      cycles.reduce((a, c) => a + (c.stats?.completionRate || 0), 0) / Math.max(cycles.length, 1),
    rolesCount: cycles.reduce((a, c) => a + (c.stats?.rolesCount || 0), 0),
    applicantsCount: cycles.reduce((a, c) => a + (c.stats?.applicantsCount || 0), 0),
  };
}

export function InductionsClient({
  initialCycles,
}: {
  initialCycles: InductionCycleSummary[];
}) {
  const [cycles, setCycles] = useState<InductionCycleSummary[]>(initialCycles);
  const [pendingDelete, setPendingDelete] = useState<InductionCycleSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [hashAdd, setHashAdd] = useState(false);

  // Detect #add on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#add') {
      setHashAdd(true);
    }
  }, []);

  const handleCreated = (newCycle: InductionCycleSummary) => {
    setCycles((prev) => [newCycle, ...prev]);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/organisations/inductions/${pendingDelete.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete cycle');
      }

      setCycles((prev) => prev.filter((c) => c.id !== pendingDelete.id));
      toast.success('Cycle deleted');
      setPendingDelete(null);
    } catch (err: any) {
      toast.error(err.message || 'Could not delete the cycle');
    } finally {
      setDeleting(false);
    }
  };

  const aggregated = aggregateStats(cycles);

  return (
    <div className="mt-6 space-y-6">
      {/* Stats overview */}
      <CycleStatsBar stats={aggregated} />

      {/* List header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {cycles.length === 0
            ? 'No induction cycles yet.'
            : `${cycles.length} cycle${cycles.length === 1 ? '' : 's'}`}
        </p>
        <NewCycleDialog autoOpen={hashAdd} onCreated={handleCreated} />
      </div>

      {/* Grid / empty state */}
      {cycles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Layers className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold">Create your first induction cycle</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Set up a cycle, add roles, configure application rounds, and start accepting applicants
            — all from one place.
          </p>
          <div className="mt-5">
            <NewCycleDialog onCreated={handleCreated} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cycles.map((cycle) => (
            <CycleCard key={cycle.id} cycle={cycle} onDelete={setPendingDelete} />
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this cycle?</DialogTitle>
            <DialogDescription>
              &ldquo;{pendingDelete?.name}&rdquo; and all its roles, rounds, and form data will be
              permanently removed. This action cannot be undone.
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
