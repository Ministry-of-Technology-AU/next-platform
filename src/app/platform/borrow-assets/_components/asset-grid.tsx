import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Asset } from '../types';
import { AssetCard } from './asset-card';

const GRID = 'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6';

interface AssetSectionProps {
  title: string;
  assets: Asset[];
  showOwner: boolean;
  onBorrow: (asset: Asset) => void;
  onToggleBookmark: (asset: Asset) => void;
}

export function AssetSection({ title, assets, showOwner, onBorrow, onToggleBookmark }: AssetSectionProps) {
  if (assets.length === 0) return null;
  const headingId = `section-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="mb-3 flex items-baseline gap-2 !text-left !text-base !font-semibold sm:mb-4 sm:!text-lg">
        {title}
        <span className="text-sm font-normal text-muted-foreground">{assets.length}</span>
      </h2>
      <div className={GRID}>
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            showOwner={showOwner}
            onBorrow={onBorrow}
            onToggleBookmark={onToggleBookmark}
          />
        ))}
      </div>
    </section>
  );
}

/** Same grid and card proportions as the loaded page, so nothing shifts when data lands. */
export function AssetGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={GRID}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border bg-card">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-2 p-3 sm:p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="mt-3 h-10 w-full sm:h-9" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-12 text-center sm:py-16">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">{icon}</div>
      <p className="font-heading font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
