'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { InductionCycleSummary } from '../types';

interface NewCycleDialogProps {
  /** When true the dialog opens automatically (e.g. from #add hash). */
  autoOpen?: boolean;
  onCreated?: (cycle: InductionCycleSummary) => void;
}

export function NewCycleDialog({ autoOpen = false, onCreated }: NewCycleDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [creating, setCreating] = useState(false);

  // Auto-open from hash
  useEffect(() => {
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

  const create = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Give your cycle a name');
      return;
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/organisations/inductions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmed,
          startDate: startDate || null,
          endDate: endDate || null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to create induction cycle');
      }

      const created: InductionCycleSummary = json.data;
      onCreated?.(created);
      toast.success('Induction cycle created');
      setOpen(false);
      setName('');
      setStartDate('');
      setEndDate('');

      // Navigate to the new cycle
      router.push(`/organisations/inductions/${created.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Could not create the cycle');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Cycle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create an induction cycle</DialogTitle>
          <DialogDescription>
            Set up a new induction cycle with a name and timeline. You can add roles and configure
            rounds once the cycle is created.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-cycle-name">Cycle name</Label>
            <Input
              id="new-cycle-name"
              value={name}
              autoFocus
              placeholder="e.g. Monsoon 2026 Inductions"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void create();
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-cycle-start">Start date</Label>
              <Input
                id="new-cycle-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-cycle-end">End date</Label>
              <Input
                id="new-cycle-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={creating}>
            Cancel
          </Button>
          <Button onClick={() => void create()} disabled={creating} className="gap-1.5">
            {creating && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Cycle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
