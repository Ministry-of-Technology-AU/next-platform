'use client';

import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Mail, X, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import type { InductionRole } from '../types';

interface RoleAccessBarProps {
  role: InductionRole;
  onUpdated?: (updatedRole: InductionRole) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RoleAccessBar({ role, onUpdated }: RoleAccessBarProps) {
  const [emails, setEmails] = useState<string[]>(role.accessEmails || []);
  const [inputValue, setInputValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEmails(role.accessEmails || []);
  }, [role.accessEmails]);

  // Persist updated emails to backend
  const persistEmails = async (nextEmails: string[]) => {
    setEmails(nextEmails);
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch(`/api/organisations/inductions/roles/${role.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessEmails: nextEmails }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to update access permissions');
      }

      onUpdated?.({
        ...role,
        accessEmails: nextEmails,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      toast.error(err.message || 'Could not update access permissions');
      // Revert local state on error
      setEmails(role.accessEmails || []);
    } finally {
      setSaving(false);
    }
  };

  // Helper to parse, sanitize, validate, and add raw email tokens
  const addEmailTokens = (rawString: string) => {
    if (!rawString.trim()) return;

    // Split by commas or semicolons or spaces or newlines
    const tokens = rawString
      .split(/[,;\n]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    if (tokens.length === 0) return;

    const invalidEmails: string[] = [];
    const duplicateEmails: string[] = [];
    const newValidEmails: string[] = [];

    tokens.forEach((email) => {
      if (!EMAIL_REGEX.test(email)) {
        invalidEmails.push(email);
      } else if (emails.includes(email) || newValidEmails.includes(email)) {
        duplicateEmails.push(email);
      } else {
        newValidEmails.push(email);
      }
    });

    if (invalidEmails.length > 0) {
      toast.error(`Invalid email address: ${invalidEmails.join(', ')}`);
    }

    if (duplicateEmails.length > 0 && newValidEmails.length === 0) {
      toast.info(`Email already added: ${duplicateEmails.join(', ')}`);
    }

    if (newValidEmails.length > 0) {
      const next = [...emails, ...newValidEmails];
      void persistEmails(next);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmailTokens(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && emails.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      e.preventDefault();
      const next = emails.slice(0, -1);
      void persistEmails(next);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData('text');
    if (pasteData.includes(',') || pasteData.includes(';') || pasteData.includes('\n') || pasteData.includes(' ')) {
      e.preventDefault();
      addEmailTokens(pasteData);
    }
  };

  const handleRemove = (indexToRemove: number) => {
    const next = emails.filter((_, idx) => idx !== indexToRemove);
    void persistEmails(next);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-3 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-left">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              People with Access
              <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0 border-primary/30 text-primary bg-primary/5">
                {emails.length === 0 ? 'All Admins' : `${emails.length} Member${emails.length === 1 ? '' : 's'}`}
              </Badge>
            </h4>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {saving ? (
            <span className="flex items-center gap-1 text-primary text-xs font-medium">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving...
            </span>
          ) : savedSuccess ? (
            <span className="flex items-center gap-1 text-green-dark dark:text-green text-xs font-medium">
              <Check className="h-3.5 w-3.5" />
              Saved
            </span>
          ) : null}
        </div>
      </div>

      {/* Tag-Input Box */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="min-h-[48px] w-full rounded-xl border border-input bg-background/60 hover:bg-background focus-within:bg-background focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all p-2 flex flex-wrap items-center gap-1.5 cursor-text"
      >
        <Mail className="h-4 w-4 text-muted-foreground ml-1.5 mr-1 flex-shrink-0" />

        {/* Email Tags */}
        {emails.map((email, idx) => (
          <Badge
            key={idx}
            variant="secondary"
            className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 text-xs font-medium bg-muted text-foreground border border-border/60 hover:bg-muted/80 transition-colors"
          >
            <span className="truncate max-w-[220px]">{email}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(idx);
              }}
              className="rounded-full p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label={`Remove ${email}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => {
            if (inputValue.trim()) {
              addEmailTokens(inputValue);
            }
          }}
          placeholder={
            emails.length === 0
              ? 'Add emails separated by comma (e.g. member1@ashoka.edu.in, member2@ashoka.edu.in)...'
              : 'Add another email...'
          }
          className="flex-1 min-w-[200px] bg-transparent border-0 outline-none text-xs text-foreground placeholder:text-muted-foreground/70 px-1 py-1"
        />
      </div>

      <p className="text-[11px] text-muted-foreground !text-left leading-relaxed">
        Only organization accounts can manage access permissions. Members added here can view candidates, evaluate submissions, and conduct interviews for this role.
      </p>
    </div>
  );
}
