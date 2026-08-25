'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Building2,
  Briefcase,
  Bookmark,
  BookmarkCheck,
  Clock,
  ClockPlus,
  ArrowRight,
  Layers,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Organization, OpenPosition } from '../../organisations-catalog/types';
import { htmlToPlainText } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface InductionCatalogCardProps {
  organization: Organization;
  isTracking: boolean;
  trackLoading: boolean;
  onTrack: (id: string) => void;
  onUntrack: (id: string) => void;
}

export function InductionCatalogCard({
  organization,
  isTracking,
  trackLoading,
  onTrack,
  onUntrack,
}: InductionCatalogCardProps) {
  const [logoError, setLogoError] = React.useState(false);
  const [expandedRoleIds, setExpandedRoleIds] = React.useState<Set<string>>(new Set());

  const toggleRoleExpand = (roleId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) next.delete(roleId);
      else next.add(roleId);
      return next;
    });
  };

  const positions: OpenPosition[] =
    organization.openPositions && organization.openPositions.length > 0
      ? organization.openPositions
      : [
        {
          id: 'default-pos',
          title: 'General Member Application',
          department: 'Core Team',
        },
      ];

  const deadline = organization.inductionEnd ? new Date(organization.inductionEnd) : null;
  const now = new Date();
  const hasValidDeadline = deadline && !isNaN(deadline.getTime());
  const daysLeft = hasValidDeadline ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isEndingSoon = hasValidDeadline && (daysLeft !== null && daysLeft <= 3);

  const logoUrl = organization.logoUrl || '';
  // Cycle/induction descriptions are authored as rich text — flatten to plain
  // text so the clamped preview never shows raw markup.
  const descriptionText = htmlToPlainText(
    organization.cycleDescription || organization.inductionDescription || organization.description,
  );

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (trackLoading) return;
    if (isTracking) {
      onUntrack(organization.id);
    } else {
      onTrack(organization.id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border/80 hover:border-border hover:shadow-md transition-all duration-200 overflow-hidden group text-left">
      <div className="p-5 flex-1 flex flex-col space-y-4 text-left">
        {/* Header: Org logo, info, bookmark track button */}
        <div className="flex items-start justify-between gap-3 text-left w-full" style={{ textAlign: 'left' }}>
          <div className="flex items-center gap-3 min-w-0 flex-1 text-left" style={{ textAlign: 'left' }}>
            <div className="w-12 h-12 rounded-full bg-red-900 flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden shadow-xs">
              {logoUrl && !logoError ? (
                <img
                  src={logoUrl}
                  alt={organization.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                />
              ) : (
                (organization.name?.charAt(0) || '?').toUpperCase()
              )}
            </div>

            <div className="min-w-0 flex-1 text-left" style={{ textAlign: 'left' }}>
              <h3
                className="font-semibold text-base text-foreground truncate group-hover:text-primary transition-colors !text-left text-left"
                style={{ textAlign: 'left' }}
              >
                {organization.name}
              </h3>
              <div className="flex items-center justify-start gap-2 mt-1 flex-wrap text-left" style={{ textAlign: 'left' }}>
                <Badge
                  variant="secondary"
                  className="capitalize font-medium text-[11px] py-0 px-2 bg-secondary/80 text-foreground !text-left text-left"
                >
                  {organization.type}
                </Badge>
                {organization.cycleName && (
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 px-1.5 font-medium border-primary/30 text-primary bg-primary/5 flex items-center gap-1"
                  >
                    <Layers className="w-2.5 h-2.5" />
                    {organization.cycleName}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Bookmark / Track action button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBookmarkClick}
                  disabled={trackLoading}
                  className={`h-9 w-9 rounded-xl shrink-0 transition-all ${isTracking
                      ? 'text-primary bg-primary/10 hover:bg-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  aria-label={isTracking ? 'Untrack organization' : 'Track organization'}
                >
                  {isTracking ? (
                    <BookmarkCheck className="w-4 h-4 text-primary fill-primary" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">
                  {isTracking ? 'Tracking induction updates' : 'Track for deadline updates'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Prominent Recruitment Deadline Strip */}
        <div className="text-left w-full" style={{ textAlign: 'left' }}>
          {organization.deadlineExtension ? (
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <ClockPlus className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="font-bold truncate">
                  Deadline Extended!
                </span>
              </div>
              <span className="text-[11px] font-semibold opacity-90 shrink-0 ml-2">
                Until {deadline ? deadline.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Extended'}
              </span>
            </div>
          ) : hasValidDeadline ? (
            isEndingSoon ? (
              <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs shadow-2xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
                  <span className="font-bold truncate">
                    {daysLeft === 0 ? 'Closes Today!' : daysLeft === 1 ? 'Closes Tomorrow!' : `Closes in ${daysLeft} days`}
                  </span>
                </div>
                <span className="text-[11px] font-semibold opacity-90 shrink-0 ml-2">
                  {deadline.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-primary/10 border border-primary/25 text-foreground text-xs shadow-2xs">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>Application Deadline</span>
                </div>
                <span className="text-xs font-semibold text-foreground/90 shrink-0 ml-2">
                  {daysLeft !== null && daysLeft > 0 ? `${daysLeft} days left · ` : ''}
                  {deadline.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-muted/40 border border-border/60 text-muted-foreground text-xs">
              <ClockPlus className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="font-medium">Rolling Induction · Applications Open</span>
            </div>
          )}
        </div>

        {/* Induction & Description text directly like before - only if present */}
        {descriptionText ? (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed !text-left text-left" style={{ textAlign: 'left' }}>
            {descriptionText}
          </p>
        ) : null}

        {/* Open Positions List with Name, 1-Line Description + Read More, Department, and Apply CTA */}
        <div className="pt-1 flex flex-col text-left space-y-2.5" style={{ textAlign: 'left' }}>
          <div className="flex items-center justify-between text-left" style={{ textAlign: 'left' }}>
            <h4
              className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground !text-left text-left"
              style={{ textAlign: 'left' }}
            >
              <Briefcase className="w-3.5 h-3.5 text-primary" /> Open Roles ({positions.length})
            </h4>
          </div>

          <div className="flex flex-col gap-2.5 text-left" style={{ textAlign: 'left' }}>
            {positions.map((pos, idx) => {
              const roleKey = pos.id || `${idx}`;
              const isExpanded = expandedRoleIds.has(roleKey);
              const desc = htmlToPlainText(pos.description);
              const isLong = desc.length > 55;

              return (
                <div
                  key={roleKey}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/40 hover:bg-muted/70 rounded-xl p-3 px-3.5 border border-border/70 transition-all text-left group/pos"
                  style={{ textAlign: 'left' }}
                >
                  <div className="min-w-0 flex-1 text-left space-y-1" style={{ textAlign: 'left' }}>
                    {/* Role Name and Department */}
                    <div className="flex items-center gap-2 flex-wrap text-left" style={{ textAlign: 'left' }}>
                      <p className="text-xs sm:text-sm font-bold text-foreground group-hover/pos:text-primary transition-colors !text-left text-left truncate" style={{ textAlign: 'left' }}>
                        {pos.title}
                      </p>
                      {pos.department && (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 font-medium border-border/80 text-muted-foreground flex items-center gap-1 shrink-0"
                        >
                          <Building2 className="w-2.5 h-2.5 text-muted-foreground/70" />
                          {pos.department}
                        </Badge>
                      )}
                    </div>

                    {/* Role Description with 1-line clamp and Read more toggle - only if description exists */}
                    {desc ? (
                      <div className="text-left" style={{ textAlign: 'left' }}>
                        <p
                          className={`text-xs text-muted-foreground leading-relaxed !text-left text-left ${isExpanded ? '' : 'line-clamp-1'
                            }`}
                          style={{ textAlign: 'left' }}
                        >
                          {desc}
                        </p>
                        {isLong && (
                          <button
                            type="button"
                            onClick={(e) => toggleRoleExpand(roleKey, e)}
                            className="text-[11px] font-semibold text-primary hover:underline mt-0.5 cursor-pointer inline-flex items-center gap-0.5"
                          >
                            {isExpanded ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* Apply Button */}
                  <div className="shrink-0 self-end sm:self-center">
                    {pos.formUid ? (
                      <Button
                        asChild
                        size="sm"
                        className="h-8 px-3 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs"
                      >
                        <Link href={`/platform/forms/${pos.formUid}`}>
                          Apply
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    ) : (
                      <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-lg border border-border/60">
                        Opening Soon
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

