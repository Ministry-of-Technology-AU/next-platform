'use client';

import { type LucideIcon, Info } from 'lucide-react';
import { Banner, BannerIcon, BannerTitle, BannerAction, BannerClose } from './ui/shadcn-io/banner';
import { Dialog, DialogTrigger } from './ui/dialog';
import FeedbackDialog from './navbar/FeedbackDialog';

/**
 * Props for the NewToolBanner component.
 *
 * All props are optional — the banner renders with sensible defaults out of the box.
 */
export interface NewToolBannerProps {
  /** Main message displayed in the banner. */
  readonly title?: string;
  /** Label for the feedback action button. @default "Submit Feedback" */
  readonly actionLabel?: string;
  /** Icon rendered in the banner. @default Info */
  readonly icon?: LucideIcon;
  /** Additional CSS classes for the banner container. */
  readonly className?: string;
  /** Whether to show the feedback CTA. @default true */
  readonly showFeedback?: boolean;
  /** Page name passed through to FeedbackDialog for page-specific feedback. */
  readonly feedbackPageName?: string;
  /** Whether the banner should bleed edge-to-edge beyond its parent padding. @default true */
  readonly bleed?: boolean;
}

const BLEED_CLASSES =
  'w-[calc(100%+1rem)] -ml-2 -mr-2 xs:w-[calc(100%+1.5rem)] xs:-ml-3 xs:-mr-3 sm:w-[calc(100%+2rem)] sm:-ml-4 sm:-mr-4 md:w-[calc(100%+3rem)] md:-ml-6 md:-mr-6 lg:w-[calc(100%+4rem)] lg:-ml-8 lg:-mr-8';

export function NewToolBanner({
  title = "Welcome! This is a new tool that we've launched. We hope you find this useful. Please do let us know your thoughts!",
  actionLabel = 'Submit Feedback',
  icon: IconComponent = Info,
  className,
  showFeedback = true,
  feedbackPageName,
  bleed = true,
}: NewToolBannerProps) {
  return (
    <Banner
      className={`sticky top-16 z-40 max-w-none bg-primary
        ${bleed ? BLEED_CLASSES : 'w-full'}
        ${className ?? ''}`}
    >
      <BannerIcon icon={IconComponent} />
      <BannerTitle className="text-xs sm:text-sm">{title}</BannerTitle>
      {showFeedback && (
        <Dialog>
          <DialogTrigger asChild>
            <BannerAction className="whitespace-nowrap text-xs sm:text-sm">
              {actionLabel}
            </BannerAction>
          </DialogTrigger>
          <FeedbackDialog pageName={feedbackPageName} />
        </Dialog>
      )}
      <BannerClose />
    </Banner>
  );
}
