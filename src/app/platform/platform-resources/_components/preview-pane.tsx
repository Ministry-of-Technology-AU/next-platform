'use client';

import { Download, FileText, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { haptic } from '@/lib/haptics';
import type { WikiDocument } from '../types';
import { formatUpdated } from '../utils';
import { FavouriteButton } from './favourite-button';

interface PreviewPaneProps {
  document: WikiDocument;
  favourited: boolean;
  onToggleFavourite: () => void;
  onClose: () => void;
}

/** Full-width viewer. It takes the place of the card grid until it is closed. */
export function PreviewPane({ document, favourited, onToggleFavourite, onClose }: PreviewPaneProps) {
  return (
    <div className="flex h-[calc(100vh-9rem)] min-h-[32rem] flex-col gap-4 rounded-xl border bg-card p-4 shadow-lg">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold leading-snug sm:text-xl">{document.title}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {document.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-medium">
                {tag}
              </Badge>
            ))}
            <span className="ml-1 text-xs text-muted-foreground">Updated {formatUpdated(document.updatedAt)}</span>
          </div>
        </div>

        <FavouriteButton title={document.title} favourited={favourited} onToggle={onToggleFavourite} />

        {document.pdfUrl ? (
          <Button asChild variant="outline" className="h-11 sm:h-9" onClick={() => void haptic.press()}>
            <a href={document.pdfUrl} download>
              <Download /> <span className="hidden sm:inline">Download</span>
            </a>
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              {/* Span so the tooltip still opens on a disabled button. */}
              <span tabIndex={0}>
                <Button variant="outline" disabled className="h-11 sm:h-9" aria-label="Download (not available yet)">
                  <Download /> <span className="hidden sm:inline">Download</span>
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Download works once documents are connected</TooltipContent>
          </Tooltip>
        )}

        <Button
          variant="outline"
          className="h-11 sm:h-9"
          onClick={() => {
            void haptic.tap();
            onClose();
          }}
          aria-label="Close and go back to documents"
        >
          <X /> <span className="hidden sm:inline">Close</span>
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border bg-muted">
        {document.pdfUrl ? (
          <iframe src={document.pdfUrl} title={`Preview of ${document.title}`} className="size-full" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
            <FileText className="size-12 opacity-40" aria-hidden />
            <p className="text-sm">The PDF will show here once documents are connected.</p>
          </div>
        )}
      </div>
    </div>
  );
}
