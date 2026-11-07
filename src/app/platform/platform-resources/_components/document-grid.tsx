'use client';

import { Skeleton } from '@/components/ui/skeleton';
import type { WikiDocument } from '../types';
import { DocumentCard } from './document-card';

const GRID_CLASS = 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3';

interface DocumentGridProps {
  documents: WikiDocument[];
  favouriteIds: ReadonlySet<string>;
  selectedId: string | null;
  onOpen: (document: WikiDocument) => void;
  onToggleFavourite: (document: WikiDocument) => void;
}

export function DocumentGrid({ documents, favouriteIds, selectedId, onOpen, onToggleFavourite }: DocumentGridProps) {
  return (
    <div className={GRID_CLASS}>
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          favourited={favouriteIds.has(document.id)}
          selected={document.id === selectedId}
          onOpen={onOpen}
          onToggleFavourite={onToggleFavourite}
        />
      ))}
    </div>
  );
}

/** Same grid and card height as the real thing, so nothing shifts when it lands. */
export function DocumentGridSkeleton() {
  return (
    <div className={GRID_CLASS} aria-busy="true">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex aspect-square flex-col overflow-hidden rounded-xl border bg-card">
          <Skeleton className="min-h-0 w-full flex-1 rounded-none" />
          <div className="space-y-1.5 p-3">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
