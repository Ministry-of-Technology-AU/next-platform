'use client';

import { useState } from 'react';
import { ArrowRight, Bookmark, CheckCircle2, Clock, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import type { Asset } from '../types';
import { assetImageSrcSet, assetImageUrl, categoryLabel, unavailableLabel } from '../utils';

interface AssetCardProps {
  asset: Asset;
  /** Show who lends it. Only useful on tabs that mix lenders. */
  showOwner: boolean;
  onBorrow: (asset: Asset) => void;
  onToggleBookmark: (asset: Asset) => void;
}

const IMAGE_SIZES = '(min-width: 1280px) 22vw, (min-width: 1024px) 28vw, (min-width: 768px) 30vw, 46vw';

export function AssetCard({ asset, showOwner, onBorrow, onToggleBookmark }: AssetCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const isAvailable = asset.status === 'available';
  const canRequest = isAvailable && !asset.pendingForMe;
  const subtitle = [showOwner ? asset.owner : null, asset.model].filter(Boolean).join(' · ');

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground transition-shadow',
        canRequest && 'hover:shadow-md focus-within:shadow-md',
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {asset.image && !imageFailed ? (
          // Cloudinary does the resizing (next.config sets images.unoptimized), so a plain img with srcSet.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={assetImageUrl(asset.image.url, 640)}
            srcSet={assetImageSrcSet(asset.image.url)}
            sizes={IMAGE_SIZES}
            alt={asset.image.alt}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className={cn(
              'size-full object-cover transition-transform duration-300 motion-reduce:transition-none',
              canRequest && 'group-hover:scale-[1.03]',
              !isAvailable && 'opacity-60 grayscale',
            )}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <Package className="size-8 opacity-50" aria-hidden />
          </div>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => {
                void haptic.tap();
                onToggleBookmark(asset);
              }}
              aria-pressed={asset.bookmarked}
              aria-label={asset.bookmarked ? `Remove ${asset.name} from saved` : `Save ${asset.name}`}
              className="absolute right-1 top-1 z-10 flex size-11 items-center justify-center rounded-full sm:right-2 sm:top-2 sm:size-9"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-transform active:scale-90 motion-reduce:transition-none">
                <Bookmark className={cn('size-4', asset.bookmarked && 'fill-primary text-primary')} />
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent>{asset.bookmarked ? 'Remove from Saved' : 'Save to find it later in the Saved tab'}</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <span className="w-fit rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {categoryLabel(asset.type)}
        </span>
        <h3 className="mt-1 break-words !text-left !text-sm !font-semibold leading-snug">{asset.name}</h3>
        {subtitle && <p className="break-words text-xs text-muted-foreground">{subtitle}</p>}
        {asset.description && (
          <p className="mt-0.5 hidden text-xs text-muted-foreground sm:line-clamp-2">{asset.description}</p>
        )}

        <div className="mt-auto pt-3">
          {canRequest ? (
            <Button
              size="sm"
              className="h-10 w-full sm:h-9 after:absolute after:inset-0 after:content-['']"
              onClick={() => {
                void haptic.press();
                onBorrow(asset);
              }}
              aria-label={`Borrow ${asset.name}`}
            >
              Borrow
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </Button>
          ) : (
            <p className="flex h-10 items-center gap-1.5 text-xs text-muted-foreground sm:h-9 sm:text-sm">
              {asset.pendingForMe ? (
                <>
                  <CheckCircle2 className="size-4 shrink-0 text-green" aria-hidden />
                  <span className="line-clamp-1">Requested. Check your email.</span>
                </>
              ) : (
                <>
                  <Clock className={cn('size-4 shrink-0', asset.status === 'overdue' && 'text-destructive')} aria-hidden />
                  <span className="line-clamp-1">{unavailableLabel(asset)}</span>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
