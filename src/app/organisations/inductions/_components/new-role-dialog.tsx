'use client';

import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RoleTier, InductionRole } from '../types';

interface NewRoleDialogProps {
  cycleId?: string;
  autoOpen?: boolean;
  onCreated?: (role: InductionRole) => void;
}

export function NewRoleDialog({ cycleId, autoOpen = false, onCreated }: NewRoleDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [tier, setTier] = useState<RoleTier>('tier-1');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

  const create = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Give this role a name');
      return;
    }

    setCreating(true);
    try {
      if (cycleId) {
        const res = await fetch(`/api/organisations/inductions/${cycleId}/roles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: trimmed,
            tier,
            department: department.trim() || null,
            description: description.trim() || null,
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to create role');
        }

        const created: InductionRole = json.data;
        onCreated?.(created);
      } else {
        // Fallback for mock if cycleId not provided
        const newRole: InductionRole = {
          id: crypto.randomUUID(),
          name: trimmed,
          tier,
          department: department.trim() || null,
          description: description.trim() || null,
          stats: { opens: 0, fills: 0, completionRate: 0, topUtm: null },
          createdAt: new Date().toISOString(),
        };
        onCreated?.(newRole);
      }

      toast.success('Role created');
      setOpen(false);
      setName('');
      setTier('tier-1');
      setDepartment('');
      setDescription('');
    } catch (err: any) {
      toast.error(err.message || 'Could not create the role');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Role
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a role</DialogTitle>
          <DialogDescription>
            Create a new role for this induction cycle. You can configure application rounds and
            forms after the role is created.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-role-name">Role name</Label>
            <Input
              id="new-role-name"
              value={name}
              autoFocus
              placeholder="e.g. Content Writer"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void create();
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-role-tier">Tier</Label>
            <Select value={tier} onValueChange={(v) => setTier(v as RoleTier)}>
              <SelectTrigger id="new-role-tier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tier-1">Tier 1</SelectItem>
                <SelectItem value="tier-2">Tier 2</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-role-department">Department (optional)</Label>
            <Input
              id="new-role-department"
              value={department}
              placeholder="e.g. Editorial"
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-role-description">Description (optional)</Label>
            <Textarea
              id="new-role-description"
              value={description}
              placeholder="What does this role involve?"
              rows={3}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={creating}>
            Cancel
          </Button>
          <Button onClick={() => void create()} disabled={creating} className="gap-1.5">
            {creating && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
