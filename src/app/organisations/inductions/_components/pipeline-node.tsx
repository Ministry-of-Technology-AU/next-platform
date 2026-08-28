'use client';

import Link from 'next/link';
import { FileText, Mic, Trash2, Pencil, Link as LinkIcon, Sparkles, Trophy, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PipelineRound, PipelineRoundType } from '../types';

function formatDeadline(dateStr: string | null): string {
  if (!dateStr) return 'No deadline';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const TYPE_CONFIG: Record<
  PipelineRoundType,
  {
    icon: typeof FileText;
    label: string;
    borderAccent: string;
    iconStyle: string;
  }
> = {
  form: {
    icon: FileText,
    label: 'Form',
    borderAccent: 'bg-primary',
    iconStyle: 'bg-primary/10 text-primary border-primary/20',
  },
  interview: {
    icon: Mic,
    label: 'Interview',
    borderAccent: 'bg-secondary-dark dark:bg-secondary',
    iconStyle: 'bg-secondary/15 text-secondary-extradark dark:text-secondary border-secondary/30',
  },
  results: {
    icon: Trophy,
    label: 'Results',
    borderAccent: 'bg-green-dark dark:bg-green',
    iconStyle: 'bg-green/15 text-green-dark dark:text-green-light border-green/30',
  },
};

export function PipelineNode({
  round,
  index,
  formTitle,
  formTitles,
  isLocked = false,
  onEdit,
  onDelete,
  onConfigureSchedule,
}: {
  round: PipelineRound;
  index: number;
  formTitle?: string | null;
  formTitles?: string[];
  isLocked?: boolean;
  onEdit: (round: PipelineRound) => void;
  onDelete: (roundId: string) => void;
  onConfigureSchedule?: (round: PipelineRound) => void;
}) {
  const config = TYPE_CONFIG[round.type] || TYPE_CONFIG.form;
  const Icon = config.icon;
  const isInterview = round.type === 'interview';
  const isResults = round.type === 'results';
  const isForm = round.type === 'form';
  const slotCount = round.interviewConfig?.selectedSlots?.length || 0;
  const formCount = round.formIds?.length || 0;

  return (
    <div
      className="group relative w-72 flex-shrink-0 cursor-pointer"
      onClick={() => onEdit(round)}
    >
      <div className="flex items-stretch rounded-xl border border-border bg-white dark:bg-gray-dark/15 shadow-sm transition-all hover:shadow-md hover:border-primary/40">
        {/* Left accent bar */}
        <div className={`w-1.5 rounded-l-xl flex-shrink-0 ${config.borderAccent}`} />

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col gap-2 min-w-0">
          <div className="flex items-start justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${config.iconStyle}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <h4 className="text-sm font-semibold text-foreground truncate !text-left">
                    {round.label}
                  </h4>
                  {isInterview && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-secondary/40 text-secondary-extradark dark:text-secondary font-medium">
                      {slotCount > 0 ? `${slotCount} slots` : 'No slots'}
                    </Badge>
                  )}
                  {isResults && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green/40 text-green-dark dark:text-green-light font-medium">
                      Results
                    </Badge>
                  )}
                  {isLocked && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                      <Lock className="h-2.5 w-2.5" />
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground !text-left truncate">
                  Round {index + 1} · {formatDeadline(round.deadline)}
                </p>
              </div>
            </div>

            {/* Delete button — disabled on active/locked rounds */}
            {!isLocked && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(round.id);
                  }}
                  aria-label="Delete round"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* Footer: type-specific info */}
          {isInterview ? (
            <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground truncate">
                <Sparkles className="h-3 w-3 text-secondary-dark dark:text-secondary flex-shrink-0" />
                <span className="text-[11px] truncate">
                  {slotCount > 0
                    ? `${slotCount} available slots`
                    : 'Schedule not configured'}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onConfigureSchedule) {
                    onConfigureSchedule(round);
                  } else {
                    onEdit(round);
                  }
                }}
                className="flex items-center gap-1 text-secondary-extradark dark:text-secondary hover:underline text-[11px] font-semibold ml-auto"
              >
                <Pencil className="h-3 w-3" />
                {slotCount > 0 ? 'Edit Grid' : 'Set Grid'}
              </button>
            </div>
          ) : isResults ? (
            <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground truncate">
                <Trophy className="h-3 w-3 text-green-dark dark:text-green-light flex-shrink-0" />
                <span className="text-[11px] truncate">
                  {round.resultsConfig?.emailTemplate
                    ? 'Email template configured'
                    : 'No template yet'}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(round);
                }}
                className="flex items-center gap-1 text-green-dark dark:text-green-light hover:underline text-[11px] font-semibold ml-auto"
              >
                <Pencil className="h-3 w-3" />
                Configure
              </button>
            </div>
          ) : (
            /* Form type */
            (() => {
              const formId = round.formIds?.[0] ?? round.formId;
              const hasForm = Boolean(formId && formId !== '[object Object]' && formId !== 'none');

              return (
                <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs">
                  {hasForm ? (
                    <div className="flex items-center gap-1 text-muted-foreground truncate">
                      <LinkIcon className="h-3 w-3 text-primary flex-shrink-0" />
                      <span className="truncate max-w-[140px] font-medium text-foreground">
                        {formTitle || '1 form linked'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic text-[11px]">No form linked</span>
                  )}

                  {hasForm && formId && (
                    <Link
                      href={`/organisations/inductions/forms/${encodeURIComponent(formId)}/edit`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-primary hover:underline text-[11px] font-medium ml-auto"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit Form
                    </Link>
                  )}
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}
