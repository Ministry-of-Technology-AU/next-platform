import type { ReactNode } from 'react';
import { CalendarDays, Clock, ExternalLink, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogImage,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
  MorphingDialogTrigger,
} from '@/components/ui/morphing-dialog';
import { formatISTDate } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import type { IntercolEvent } from '../types';
import { CATEGORY_LABELS } from '../utils';

function formatDateRange(start: string, end: string | null): string {
  const startText = formatISTDate(start);
  if (!end) return startText;
  return `${startText} – ${formatISTDate(end)}`;
}

interface BannerProps {
  event: IntercolEvent;
  className: string;
}

// Shows the banner image, or a coloured block with the college's initial if there is none.
function Banner({ event, className }: BannerProps) {
  if (event.bannerUrl) {
    return (
      <MorphingDialogImage
        src={event.bannerUrl}
        alt={event.name}
        className={cn('block w-full object-cover', className)}
      />
    );
  }
  return (
    <div
      className={cn(
        'flex w-full items-center justify-center bg-red-900 text-6xl font-bold text-white',
        className
      )}
    >
      {event.hostCollege.charAt(0).toUpperCase()}
    </div>
  );
}

interface DetailRowProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

interface EventCardProps {
  event: IntercolEvent;
}

export function EventCard({ event }: EventCardProps) {
  const categoryLabel = CATEGORY_LABELS[event.category];
  const dateText = formatDateRange(event.startDate, event.endDate);

  return (
    <MorphingDialog
      transition={{ type: 'spring', bounce: 0.05, duration: 0.25 }}
    >
      {/* The card you see in the grid. Clicking it opens the popup below. */}
      <MorphingDialogTrigger
        className="relative flex h-full w-full flex-col overflow-hidden border-2 bg-white text-left shadow-sm transition-all duration-300 hover:shadow-lg"
        style={{ borderRadius: '24px' }}
      >
        <div className="relative w-full">
          <Banner event={event} className="h-80 sm:h-96" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white sm:p-6">
            <Badge className="mb-3 bg-white/90 text-black hover:bg-white">
              {categoryLabel}
            </Badge>
            <MorphingDialogTitle className="text-lg font-semibold leading-tight sm:text-xl">
              {event.name}
            </MorphingDialogTitle>
            <p className="mt-1 text-sm text-white/80">{event.hostCollege}</p>
            <MorphingDialogSubtitle className="mt-2 line-clamp-2 text-sm text-white/90">
              {event.description}
            </MorphingDialogSubtitle>
            <div className="mt-3 flex items-center gap-2 text-xs text-white/80 sm:text-sm">
              <CalendarDays className="h-4 w-4 shrink-0" />
              <span>{dateText}</span>
            </div>
          </div>
        </div>
      </MorphingDialogTrigger>

      {/* The bigger popup with the full details. */}
      <MorphingDialogContainer>
        <MorphingDialogContent
          style={{ borderRadius: '24px' }}
          className="pointer-events-auto relative flex max-h-[90vh] w-[95vw] max-w-3xl flex-col overflow-hidden border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-950"
        >
          <div className="overflow-y-auto">
            <div className="relative">
              <Banner event={event} className="h-56 sm:h-72" />
              <div className="absolute inset-0 bg-black/60" />
              <MorphingDialogClose className="z-30 text-white hover:opacity-80" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
                <Badge className="mb-3 bg-white/90 text-black hover:bg-white">
                  {categoryLabel}
                </Badge>
                <MorphingDialogTitle className="text-2xl font-bold sm:text-3xl">
                  {event.name}
                </MorphingDialogTitle>
                <p className="mt-1 text-white/80">{event.hostCollege}</p>
              </div>
            </div>

            <div className="space-y-6 p-6 text-left sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailRow
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="When"
                  value={dateText}
                />
                <DetailRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Where"
                  value={event.location}
                />
                {event.registrationDeadline && (
                  <DetailRow
                    icon={<Clock className="h-4 w-4" />}
                    label="Register by"
                    value={formatISTDate(event.registrationDeadline)}
                  />
                )}
              </div>

              <MorphingDialogDescription className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {event.fullDescription}
              </MorphingDialogDescription>

              {event.registrationUrl ? (
                <Button asChild className="w-full sm:w-auto">
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Register
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Registration details coming soon.
                </p>
              )}
            </div>
          </div>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}