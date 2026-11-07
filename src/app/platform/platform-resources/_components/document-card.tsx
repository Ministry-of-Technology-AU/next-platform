'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import type { WikiDocument } from '../types';
import { formatUpdated } from '../utils';
import { FavouriteButton } from './favourite-button';

interface DocumentCardProps {
  document: WikiDocument;
  favourited: boolean;
  selected: boolean;
  onOpen: (document: WikiDocument) => void;
  onToggleFavourite: (document: WikiDocument) => void;
}

export function DocumentCard({ document, favourited, selected, onOpen, onToggleFavourite }: DocumentCardProps) {
  const [thumbnailFailed, setThumbnailFailed] = useState(false);

  return (
    <article
      className={cn(
        'group relative flex aspect-square flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-lg focus-within:shadow-lg motion-reduce:transition-none',
        selected && 'border-primary ring-2 ring-primary/30',
      )}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden bg-muted">
        {document.thumbnailUrl && !thumbnailFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={document.thumbnailUrl}
            alt={`First page of ${document.title}`}
            loading="lazy"
            decoding="async"
            onError={() => setThumbnailFailed(true)}
            className="size-full object-contain transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground" aria-hidden>
            <FileText className="size-12 opacity-40" />
          </div>
        )}
        <FavouriteButton
          title={document.title}
          favourited={favourited}
          onToggle={() => onToggleFavourite(document)}
          className="absolute right-1 top-1 z-10 sm:right-2 sm:top-2"
        />
      </div>

      <div className="flex flex-col gap-1.5 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold leading-tight">
          {/* Stretched button: the whole card opens the preview, the heart sits above it. */}
          <button
            type="button"
            onClick={() => {
              void haptic.press();
              onOpen(document);
            }}
            aria-pressed={selected}
            className="text-left outline-none after:absolute after:inset-0 focus-visible:after:rounded-xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
          >
            {document.title}
          </button>
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {document.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="px-1.5 py-0 text-[11px] font-medium">
              {tag}
            </Badge>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">Updated {formatUpdated(document.updatedAt)}</p>
      </div>
    </article>
  );
}
