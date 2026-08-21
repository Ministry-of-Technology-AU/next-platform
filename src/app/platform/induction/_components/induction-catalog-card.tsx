import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Building2, Briefcase, Plus, Check, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Organization, OpenPosition } from '../../organisations-catalog/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const positions: OpenPosition[] = organization.openPositions && organization.openPositions.length > 0
    ? organization.openPositions
    : [
        { id: '1', title: 'Core Member', department: 'General' },
      ];

  return (
    <div className="flex flex-col bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-md transition-shadow h-full">
      <div className="p-5 flex-grow">
        {/* Org Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {organization.logoUrl ? (
              <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100 flex-shrink-0">
                <Image src={organization.logoUrl} alt={organization.name} width={48} height={48} className="object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                {organization.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 truncate">{organization.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="secondary" className="capitalize font-normal text-xs">
                  {organization.type}
                </Badge>
                {organization.inductionEnd && (
                  <span className="text-xs text-neutral-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Due {new Date(organization.inductionEnd).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Org Description */}
        <div className="mb-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
            {organization.inductionDescription || organization.description || 'Looking for passionate individuals to join our team.'}
          </p>
        </div>

        {/* Open Positions */}
        <div>
          <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-primary" /> Open Positions ({positions.length})
          </h4>
          <div className="flex flex-col gap-2.5">
            {positions.map((pos, idx) => (
              <div
                key={pos.id || idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3 border border-neutral-100 dark:border-neutral-800 transition-colors hover:border-primary/30"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{pos.title}</span>
                  </div>
                  {pos.department && (
                    <span className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3" /> {pos.department}
                    </span>
                  )}
                  {pos.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{pos.description}</p>
                  )}
                </div>

                {/* Apply Button for each position */}
                <div className="flex-shrink-0">
                  {pos.formUid ? (
                    <Button asChild size="sm" className="w-full sm:w-auto h-8 px-3 text-xs gap-1.5 font-medium shadow-none">
                      <Link href={`/platform/forms/${pos.formUid}`}>
                        Apply
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </Button>
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic bg-muted/60 px-2 py-1 rounded-md">
                      Opening Soon
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Track button */}
      <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800">
        <Button
          variant={isTracking ? 'default' : 'outline'}
          size="sm"
          className={`w-full gap-2 transition-all ${
            isTracking
              ? 'bg-primary text-white hover:bg-primary-dark'
              : 'bg-white hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800'
          }`}
          onClick={() => (isTracking ? onUntrack(organization.id) : onTrack(organization.id))}
          disabled={trackLoading}
        >
          {isTracking ? (
            <>
              <Check className="w-4 h-4" /> Tracking Updates
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Track Organization
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
