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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import type { InductionCycleSummary, CycleStatus } from '../types';
import { getDerivedCycleStatus } from '../types';

export interface CycleFormDialogProps {
  /** If provided, editing existing cycle; otherwise creating a new one */
  cycle?: InductionCycleSummary | null;
  /** Custom trigger element */
  trigger?: React.ReactNode;
  /** Controlled open state */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When true the dialog opens automatically (e.g. from #add hash). */
  autoOpen?: boolean;
  onCreated?: (cycle: InductionCycleSummary) => void;
  onUpdated?: (cycle: InductionCycleSummary) => void;
}

export function NewCycleDialog(props: CycleFormDialogProps) {
  return <CycleFormDialog {...props} />;
}

export function CycleFormDialog({
  cycle,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  autoOpen = false,
  onCreated,
  onUpdated,
}: CycleFormDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (isControlled) {
      setControlledOpen?.(val);
    } else {
      setInternalOpen(val);
    }
  };

  const isEditing = Boolean(cycle);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<CycleStatus>('draft');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync initial state when editing cycle or opening dialog
  useEffect(() => {
    if (cycle) {
      setName(cycle.name || '');
      setDescription(cycle.description || '');
      const sDate = cycle.startDate ? cycle.startDate.slice(0, 10) : '';
      const eDate = cycle.endDate ? cycle.endDate.slice(0, 10) : '';
      setStartDate(sDate);
      setEndDate(eDate);
      setStatus(getDerivedCycleStatus(cycle.status || 'draft', sDate, eDate));
    } else {
      setName('');
      setDescription('');
      setStatus('draft');
      setStartDate('');
      setEndDate('');
    }
  }, [cycle, open]);

  // Auto-open from hash
  useEffect(() => {
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (status !== 'archived') {
      setStatus(getDerivedCycleStatus(status, val, endDate));
    }
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    if (status !== 'archived') {
      setStatus(getDerivedCycleStatus(status, startDate, val));
    }
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Give your cycle a name');
      return;
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    const calculatedStatus = getDerivedCycleStatus(status, startDate, endDate);

    setLoading(true);
    try {
      if (isEditing && cycle) {
        // PUT update cycle
        const res = await fetch(`/api/organisations/inductions/${cycle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: trimmed,
            description: description.trim() || null,
            status: calculatedStatus,
            startDate: startDate || null,
            endDate: endDate || null,
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to update cycle');
        }

        const updated: InductionCycleSummary = json.data;
        onUpdated?.(updated);
        toast.success('Cycle updated');
        setOpen(false);
      } else {
        // POST create cycle
        const res = await fetch('/api/organisations/inductions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: trimmed,
            description: description.trim() || null,
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
        setDescription('');
        setStartDate('');
        setEndDate('');

        // Navigate to the new cycle
        router.push(`/organisations/inductions/${created.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || `Could not ${isEditing ? 'update' : 'create'} the cycle`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : !isControlled ? (
        <DialogTrigger asChild>
          <Button className="gap-1.5 rounded-xl font-semibold">
            <Plus className="h-4 w-4" />
            New Cycle
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="text-left font-bold text-lg">{isEditing ? 'Cycle Settings' : 'Create an induction cycle'}</DialogTitle>
          <DialogDescription className="text-left text-xs">
            {isEditing
              ? 'Update cycle details, recruitment status, and timeline.'
              : 'Set up a new induction cycle with a name and timeline. You can add roles and configure rounds once created.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-left">
          <div className="space-y-1.5">
            <Label htmlFor="cycle-form-name" className="text-xs font-semibold">Cycle name</Label>
            <Input
              id="cycle-form-name"
              value={name}
              autoFocus
              placeholder="e.g. Monsoon 2026 Inductions"
              className="rounded-xl h-9 text-xs sm:text-sm border-border/80"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleSubmit();
              }}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="cycle-form-description" className="text-xs font-semibold">Cycle description</Label>
              <span className="text-[11px] text-muted-foreground">Keep it short</span>
            </div>
            <Textarea
              id="cycle-form-description"
              value={description}
              placeholder="Brief 1-2 sentence overview of this recruitment cycle..."
              rows={2}
              className="resize-none rounded-xl text-xs sm:text-sm border-border/80"
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground/80">
              Displayed as the cycle overview on the student induction catalog.
            </p>
          </div>

          {isEditing && (
            <div className="space-y-1.5">
              <Label htmlFor="cycle-form-status" className="text-xs font-semibold">Status</Label>
              <Select value={status} onValueChange={(val: CycleStatus) => setStatus(val)}>
                <SelectTrigger id="cycle-form-status" className="capitalize rounded-xl h-9 text-xs sm:text-sm border-border/80">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="cycle-form-start" className="text-xs font-semibold">Start date</Label>
              <DatePicker
                id="cycle-form-start"
                value={startDate}
                onChange={(_, dateStr) => handleStartDateChange(dateStr)}
                placeholder="Select start date"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cycle-form-end" className="text-xs font-semibold">End date</Label>
              <DatePicker
                id="cycle-form-end"
                value={endDate}
                onChange={(_, dateStr) => handleEndDateChange(dateStr)}
                placeholder="Select end date"
                minDate={startDate ? new Date(startDate) : undefined}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button variant="outline" className="rounded-xl text-xs" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={loading} className="gap-1.5 rounded-xl text-xs font-semibold">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create Cycle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

