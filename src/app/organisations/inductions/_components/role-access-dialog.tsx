'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Users, Plus, X, Loader2, ShieldCheck, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { InductionRole } from '../types';

interface RoleAccessDialogProps {
  role: InductionRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (updatedRole: InductionRole) => void;
}

export function RoleAccessDialog({
  role,
  open,
  onOpenChange,
  onUpdated,
}: RoleAccessDialogProps) {
  const [emails, setEmails] = useState<string[]>(role.accessEmails || []);
  const [newEmail, setNewEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setEmails(role.accessEmails || []);
      setNewEmail('');
    }
  }, [open, role.accessEmails]);

  const handleAddEmail = () => {
    if (!newEmail.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const tokens = newEmail
      .split(/[,;\n]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    if (tokens.length === 0) return;

    const invalid: string[] = [];
    const duplicates: string[] = [];
    const valid: string[] = [];

    tokens.forEach((email) => {
      if (!emailRegex.test(email)) {
        invalid.push(email);
      } else if (emails.includes(email) || valid.includes(email)) {
        duplicates.push(email);
      } else {
        valid.push(email);
      }
    });

    if (invalid.length > 0) {
      toast.error(`Invalid email: ${invalid.join(', ')}`);
    }

    if (duplicates.length > 0 && valid.length === 0) {
      toast.info(`Email already added: ${duplicates.join(', ')}`);
    }

    if (valid.length > 0) {
      setEmails([...emails, ...valid]);
      setNewEmail('');
    }
  };

  const handleRemoveEmail = (indexToRemove: number) => {
    setEmails(emails.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/organisations/inductions/roles/${role.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessEmails: emails }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to update access permissions');
      }

      const updated: InductionRole = {
        ...role,
        accessEmails: emails,
      };

      onUpdated?.(updated);
      toast.success('Access permissions updated');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Could not update access permissions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Role Permissions
            </span>
          </div>
          <DialogTitle>People with Access · {role.name}</DialogTitle>
          <DialogDescription>
            Specify team members who have permission to manage this role, evaluate candidates, and
            edit forms.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Add email input */}
          <div className="space-y-1.5">
            <Label htmlFor="access-email-input" className="text-xs font-semibold flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              Add Member Email
            </Label>
            <div className="flex gap-2">
              <Input
                id="access-email-input"
                type="email"
                placeholder="e.g. member@ashoka.edu.in"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddEmail();
                  }
                }}
                className="text-sm"
              />
              <Button type="button" size="sm" onClick={handleAddEmail} className="shrink-0 gap-1">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
          </div>

          {/* Email list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Members with Access ({emails.length})</span>
              {emails.length > 0 && (
                <button
                  type="button"
                  onClick={() => setEmails([])}
                  className="text-muted-foreground hover:text-destructive text-[11px] underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="min-h-[72px] max-h-[160px] overflow-y-auto rounded-xl border border-border bg-muted/20 p-3">
              {emails.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-2 text-center text-xs text-muted-foreground">
                  <Users className="h-4 w-4 mb-1 text-muted-foreground/60" />
                  <p>No specific member emails set.</p>
                  <p className="text-[11px] text-muted-foreground/75 mt-0.5">
                    All organization core members can access this role by default.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {emails.map((email, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="gap-1.5 px-2.5 py-1 text-xs font-normal bg-background border border-border"
                    >
                      <span className="truncate max-w-[200px]">{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(idx)}
                        className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                        aria-label={`Remove ${email}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Organization administrators always maintain global access to all roles in this cycle.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving} className="gap-1.5 font-medium">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
