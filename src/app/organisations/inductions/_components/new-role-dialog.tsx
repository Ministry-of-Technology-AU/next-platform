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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RoleTier, InductionRole } from '../types';

export interface RoleFormDialogProps {
  /** If provided, editing existing role; otherwise creating a new one */
  role?: InductionRole | null;
  cycleId?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  autoOpen?: boolean;
  onCreated?: (role: InductionRole) => void;
  onUpdated?: (role: InductionRole) => void;
}

export function NewRoleDialog(props: RoleFormDialogProps) {
  return <RoleFormDialog {...props} />;
}

export function RoleFormDialog({
  role,
  cycleId,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  autoOpen = false,
  onCreated,
  onUpdated,
}: RoleFormDialogProps) {
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

  const isEditing = Boolean(role);

  const [name, setName] = useState('');
  const [tier, setTier] = useState<RoleTier>('tier-1');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [sendResponseNotifications, setSendResponseNotifications] = useState(true);
  const [loading, setLoading] = useState(false);

  // Sync initial state when editing role or opening dialog
  useEffect(() => {
    if (role) {
      setName(role.name || '');
      setTier(role.tier || 'tier-1');
      setDepartment(role.department || '');
      setDescription(role.description || '');
      setSendResponseNotifications(role.sendResponseNotifications ?? true);
    } else {
      setName('');
      setTier('tier-1');
      setDepartment('');
      setDescription('');
      setSendResponseNotifications(true);
    }
  }, [role, open]);

  useEffect(() => {
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Give this role a name');
      return;
    }

    setLoading(true);
    try {
      if (isEditing && role) {
        // PUT update role
        const res = await fetch(`/api/organisations/inductions/roles/${role.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: trimmed,
            tier,
            department: department.trim() || null,
            description: description.trim() || null,
            sendResponseNotifications,
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to update role');
        }

        const updated: InductionRole = json.data;
        onUpdated?.(updated);
        toast.success('Role updated');
        setOpen(false);
      } else if (cycleId) {
        // POST create role under cycle
        const res = await fetch(`/api/organisations/inductions/${cycleId}/roles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: trimmed,
            tier,
            department: department.trim() || null,
            description: description.trim() || null,
            sendResponseNotifications,
          }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to create role');
        }

        const created: InductionRole = json.data;
        onCreated?.(created);
        toast.success('Role created');
        setOpen(false);
        setName('');
        setTier('tier-1');
        setDepartment('');
        setDescription('');
      } else {
        // Fallback for mock if cycleId not provided
        const newRole: InductionRole = {
          id: crypto.randomUUID(),
          name: trimmed,
          tier,
          department: department.trim() || null,
          description: description.trim() || null,
          stats: { opens: 0, fills: 0, drafts: 0, completionRate: 0, topUtm: null },
          createdAt: new Date().toISOString(),
        };
        onCreated?.(newRole);
        toast.success('Role created');
        setOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || `Could not ${isEditing ? 'update' : 'create'} the role`);
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
          <Button className="gap-1.5 font-semibold rounded-xl">
            <Plus className="h-4 w-4" />
            Add Role
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="text-left font-bold text-lg">
            {isEditing ? 'Role Settings' : 'Add a role'}
          </DialogTitle>
          <DialogDescription className="text-left text-xs">
            {isEditing
              ? 'Update the role name, circle, department, and description.'
              : 'Create a new role for this induction cycle. You can configure application rounds and forms once created.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1 text-left">
          <div className="space-y-1.5">
            <Label htmlFor="role-form-name" className="text-xs font-semibold">
              Role name
            </Label>
            <Input
              id="role-form-name"
              value={name}
              autoFocus
              placeholder="e.g. Creative Director, Content Writer"
              className="rounded-xl h-9 text-xs sm:text-sm border-border/80"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleSubmit();
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role-form-tier" className="text-xs font-semibold">
              Circle
            </Label>
            <Select value={tier} onValueChange={(v) => setTier(v as RoleTier)}>
              <SelectTrigger id="role-form-tier" className="rounded-xl h-9 text-xs sm:text-sm border-border/80">
                <SelectValue placeholder="Select circle" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="tier-1">Circle 1 (Leadership)</SelectItem>
                <SelectItem value="tier-2">Circle 2 (Core Team)</SelectItem>
                <SelectItem value="other">Circle 3 (General)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role-form-department" className="text-xs font-semibold">
              Department (optional)
            </Label>
            <Input
              id="role-form-department"
              value={department}
              placeholder="e.g. Design, Operations, Editorial"
              className="rounded-xl h-9 text-xs sm:text-sm border-border/80"
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="role-form-description" className="text-xs font-semibold">
                Role Description (optional)
              </Label>
              <span className="text-[11px] text-muted-foreground">Keep it short</span>
            </div>
            <Textarea
              id="role-form-description"
              value={description}
              placeholder="What does this role involve? Key responsibilities and expectations..."
              rows={3}
              className="resize-none rounded-xl text-xs sm:text-sm border-border/80"
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground/80">
              Displayed as the role overview on the student induction catalog.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-3.5 bg-muted/20">
            <div className="space-y-0.5">
              <Label htmlFor="role-form-notifications" className="cursor-pointer text-xs font-semibold">
                Send Email Notifications for Every Response
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Receive an email notification whenever an applicant submits a response for this role.
              </p>
            </div>
            <Checkbox
              id="role-form-notifications"
              checked={sendResponseNotifications}
              onCheckedChange={(checked) => setSendResponseNotifications(!!checked)}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            variant="outline"
            className="rounded-xl text-xs"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={loading}
            className="gap-1.5 rounded-xl text-xs font-semibold"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
