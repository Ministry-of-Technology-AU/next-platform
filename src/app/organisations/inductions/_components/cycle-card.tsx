'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Send, BarChart3, CalendarDays, Trash2, ArrowRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { htmlToPlainText } from '@/lib/utils';
import { CycleFormDialog } from './new-cycle-dialog';
import type { InductionCycleSummary } from '../types';
import { CYCLE_STATUS_STYLE, formatCycleDateRange, getDerivedCycleStatus } from '../types';

export function CycleCard({
  cycle,
  activeCycle,
  onDelete,
  onUpdate,
}: {
  cycle: InductionCycleSummary;
  activeCycle?: InductionCycleSummary | null;
  onDelete: (cycle: InductionCycleSummary) => void;
  onUpdate?: (updatedCycle: InductionCycleSummary) => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const status = getDerivedCycleStatus(cycle.status, cycle.startDate, cycle.endDate);

  const rolesCount = cycle.stats.rolesCount || 0;
  const appsCount = cycle.stats.applicantsCount || cycle.stats.totalFills || 0;
  const descriptionText = htmlToPlainText(cycle.description);

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/organisations/inductions/${cycle.id}`}
            className="group inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded min-w-0 flex-1"
          >
            <h3 className="truncate text-lg font-semibold text-foreground group-hover:text-primary transition-colors !text-left">
              {cycle.name}
            </h3>
          </Link>
          <span
            className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${CYCLE_STATUS_STYLE[status]}`}
          >
            {status}
          </span>
        </div>

        {/* Highlighted Timeline Date Pill */}
        <div className="mt-3 flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary dark:text-primary-bright border border-primary/20">
            <CalendarDays className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="whitespace-nowrap">{formatCycleDateRange(cycle.startDate, cycle.endDate)}</span>
          </div>
        </div>

        {/* Cycle Description preview */}
        {descriptionText ? (
          <p className="mt-2.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed !text-left text-left" style={{ textAlign: 'left' }}>
            {descriptionText}
          </p>
        ) : null}
      </div>

      <div>
        {/* Small Responsive Stats at Bottom */}
        <div className="mt-5 mb-4 flex items-center gap-4 text-xs font-medium text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-muted-foreground/70" />
            <span>{rolesCount} role{rolesCount === 1 ? '' : 's'}</span>
          </div>
          <span className="text-muted-foreground/40">•</span>
          <div className="flex items-center gap-1.5">
            <Send className="h-3.5 w-3.5 text-muted-foreground/70" />
            <span>{appsCount} applicant{appsCount === 1 ? '' : 's'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-border/40">
          <Button asChild size="sm" variant="default" className="flex-1 gap-1.5 font-medium">
            <Link href={`/organisations/inductions/${cycle.id}`}>
              View Cycle
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setEditOpen(true)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Cycle settings"
            title="Cycle settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(cycle)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            aria-label="Delete cycle"
            title="Delete cycle"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          {/* Settings Dialog (CycleFormDialog) */}
          <CycleFormDialog
            cycle={cycle}
            activeCycle={activeCycle}
            open={editOpen}
            onOpenChange={setEditOpen}
            onUpdated={(updated) => {
              onUpdate?.(updated);
              setEditOpen(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}

