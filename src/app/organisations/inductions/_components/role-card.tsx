'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Trash2, ArrowRight, Users, ShieldCheck, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoleAccessDialog } from './role-access-dialog';
import type { InductionRole } from '../types';
import { TIER_LABELS } from '../types';

export function RoleCard({
  role,
  cycleId,
  onDelete,
  onUpdate,
}: {
  role: InductionRole;
  cycleId: string;
  onDelete: (role: InductionRole) => void;
  onUpdate?: (updatedRole: InductionRole) => void;
}) {
  const [accessOpen, setAccessOpen] = useState(false);
  const tierLabel = TIER_LABELS[role.tier] || 'Other';
  const accessCount = role.accessEmails?.length || 0;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all">
      <div>
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Person Icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0 mt-0.5">
            <User className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <Link
              href={`/organisations/inductions/${cycleId}/${role.id}`}
              className="group inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              <h3 className="truncate text-base font-semibold text-foreground group-hover:text-primary transition-colors !text-left">
                {role.name}
              </h3>
            </Link>

            {/* Subtext: Tier & Department */}
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-foreground/75">{tierLabel}</span>
              {role.department && (
                <>
                  <span className="text-muted-foreground/50">·</span>
                  <span className="truncate">{role.department}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Description */}
        {role.description && (
          <p className="mt-3.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {role.description}
          </p>
        )}

        {/* Access info bar */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground/70" />
            <span className="font-medium text-foreground/80">
              {accessCount === 0 ? 'All Admins Access' : `${accessCount} with access`}
            </span>
          </div>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setAccessOpen(true)}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Access
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex items-center gap-2 pt-3 border-t border-border/40">
        <Button asChild size="sm" variant="default" className="flex-1 gap-1.5 font-medium">
          <Link href={`/organisations/inductions/${cycleId}/${role.id}`}>
            View Role
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>

        {role.primaryFormId && (
          <Button asChild size="sm" variant="outline" className="gap-1.5 font-medium">
            <Link href={`/organisations/inductions/forms/${role.primaryFormId}/responses?cycleId=${cycleId}&roleId=${role.id}`}>
              <ClipboardList className="h-3.5 w-3.5" />
              Responses
            </Link>
          </Button>
        )}

        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(role)}
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          aria-label="Delete role"
          title="Delete role"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Role Access Management Modal */}
      <RoleAccessDialog
        role={role}
        open={accessOpen}
        onOpenChange={setAccessOpen}
        onUpdated={onUpdate}
      />
    </div>
  );
}
