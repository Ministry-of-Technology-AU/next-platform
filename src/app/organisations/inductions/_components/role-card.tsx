'use client';

import Link from 'next/link';
import { Eye, Send, Target, MoreVertical, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import type { InductionRole } from '../types';
import { TIER_LABELS } from '../types';

function Stat({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: number | string }) {
  return (
    <div className="flex items-center gap-1.5" title={label}>
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}

export function RoleCard({
  role,
  cycleId,
  onDelete,
}: {
  role: InductionRole;
  cycleId: string;
  onDelete: (role: InductionRole) => void;
}) {
  const completionPct = Math.round((role.stats.completionRate || 0) * 100);
  const tierStyle =
    role.tier === 'tier-1'
      ? 'bg-primary/10 text-primary dark:text-primary-bright border-primary/20'
      : role.tier === 'tier-2'
      ? 'bg-secondary/10 text-secondary-extradark dark:text-secondary border-secondary/20'
      : 'bg-muted text-muted-foreground border-border';

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm">
      {/* Header */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <Link
          href={`/organisations/inductions/${cycleId}/${role.id}`}
          className="min-w-0 flex-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <h3 className="truncate text-base font-semibold text-foreground !text-left">{role.name}</h3>
        </Link>
        <Badge variant="outline" className={`flex-shrink-0 text-xs ${tierStyle}`}>
          {TIER_LABELS[role.tier]}
        </Badge>
      </div>

      {/* Department */}
      {role.department && (
        <p className="mb-3 text-xs text-muted-foreground truncate">{role.department}</p>
      )}

      {/* Description */}
      {role.description && (
        <p className="mb-3 text-xs text-muted-foreground line-clamp-2">{role.description}</p>
      )}

      {/* Stats */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <Stat icon={Eye} label="Opens" value={role.stats.opens} />
        <Stat icon={Send} label="Fills" value={role.stats.fills} />
        <Stat icon={Target} label="Completion" value={`${completionPct}%`} />
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2">
        <Button asChild size="sm" variant="outline" className="flex-1 gap-1.5">
          <Link href={`/organisations/inductions/${cycleId}/${role.id}`}>
            <ArrowRight className="h-3.5 w-3.5" />
            View Role
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-9 w-9" aria-label="More actions">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onDelete(role)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
