'use client';

import Link from 'next/link';
import { Eye, Send, Users, CalendarDays, MoreVertical, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import type { InductionCycleSummary } from '../types';
import { CYCLE_STATUS_STYLE } from '../types';

function Stat({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: number | string }) {
  return (
    <div className="flex items-center gap-1.5" title={label}>
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function CycleCard({
  cycle,
  onDelete,
}: {
  cycle: InductionCycleSummary;
  onDelete: (cycle: InductionCycleSummary) => void;
}) {
  const completionPct = Math.round((cycle.stats.completionRate || 0) * 100);

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <Link
          href={`/organisations/inductions/${cycle.id}`}
          className="min-w-0 flex-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <h3 className="truncate text-base font-semibold text-foreground !text-left">{cycle.name}</h3>
        </Link>
        <span
          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${CYCLE_STATUS_STYLE[cycle.status]}`}
        >
          {cycle.status}
        </span>
      </div>

      {/* Timeline */}
      <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarDays className="h-3.5 w-3.5" />
        <span>{formatDate(cycle.startDate)} → {formatDate(cycle.endDate)}</span>
      </div>

      {/* Stats */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <Stat icon={Eye} label="Opens" value={cycle.stats.totalOpens} />
        <Stat icon={Send} label="Fills" value={cycle.stats.totalFills} />
        <Stat icon={Users} label="Roles" value={cycle.stats.rolesCount} />
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2">
        <Button asChild size="sm" variant="outline" className="flex-1 gap-1.5">
          <Link href={`/organisations/inductions/${cycle.id}`}>
            <ArrowRight className="h-3.5 w-3.5" />
            View Cycle
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
              onClick={() => onDelete(cycle)}
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
