'use client';

import { Heart } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';

interface FavouriteButtonProps {
  title: string;
  favourited: boolean;
  onToggle: () => void;
  className?: string;
}

export function FavouriteButton({ title, favourited, onToggle, className }: FavouriteButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            void haptic.tap();
            onToggle();
          }}
          aria-pressed={favourited}
          aria-label={favourited ? `Remove ${title} from favourites` : `Add ${title} to favourites`}
          className={cn('flex size-11 items-center justify-center rounded-full sm:size-9', className)}
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-transform active:scale-90 motion-reduce:transition-none">
            <Heart className={cn('size-4', favourited && 'fill-primary text-primary')} />
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{favourited ? 'Remove from favourites' : 'Add to favourites'}</TooltipContent>
    </Tooltip>
  );
}
