'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Announcement, AnnouncementTitle, AnnouncementTag } from '@/components/ui/shadcn-io/announcement';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

/**
 * Generates a deterministic localStorage key from a given href.
 * e.g. `/platform/ashokan-around` → `"new-tool-alert:/platform/ashokan-around"`
 */
function deriveStorageKey(href: string): string {
  return `new-tool-alert:${href}`;
}

const WHATS_NEW_STORAGE_KEY = 'whats-new-dismissed-version';

/**
 * Props for the NewToolAlert component.
 *
 * The only required prop is `href`. Everything else has sensible defaults.
 * The component auto-derives a localStorage key from `href` so you don't have
 * to invent and track storage keys manually.
 *
 * It also auto-dismisses when the user navigates to the target page, so there
 * is no need for a companion `<DismissNewToolAlert />` component.
 */
export interface NewToolAlertProps {
  /** The page this alert links to. Also used to auto-derive the storage key. */
  readonly href: string;
  /** Display name for the feature. @default "our new feature" */
  readonly title?: string;
  /** Additional CSS classes for the outer container. */
  readonly className?: string;
  /**
   * Explicit localStorage key to check/persist dismissal state.
   * When omitted, a key is derived automatically from `href`.
   */
  readonly storageKey?: string;
  /**
   * When true, hides this alert if the WhatsNewModal hasn't been dismissed yet
   * (to avoid showing both at the same time).
   * @default false
   */
  readonly hideUntilWhatsNewDismissed?: boolean;
  /** Text shown inside the tag pill. @default "New Feature Added!" */
  readonly tagText?: string;
  /** Text shown on the link button. Defaults to `"Check out {title}!"`. */
  readonly linkText?: string;
  /** Fully custom content — replaces the default Announcement body. */
  readonly children?: React.ReactNode;
}

export function NewToolAlert({
  href,
  title = 'our new feature',
  className,
  storageKey: explicitStorageKey,
  hideUntilWhatsNewDismissed = false,
  tagText = 'New Feature Added!',
  linkText,
  children,
}: NewToolAlertProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const resolvedStorageKey = explicitStorageKey ?? deriveStorageKey(href);

  // Auto-dismiss when the user navigates to the target page
  useEffect(() => {
    if (pathname === href || pathname.startsWith(href + '/')) {
      try {
        localStorage.setItem(resolvedStorageKey, 'true');
      } catch {
        // localStorage unavailable
      }
    }
  }, [pathname, href, resolvedStorageKey]);

  useEffect(() => {
    // Don't show the alert if we're already on the page it's linking to
    if (pathname === href || pathname.startsWith(href + '/')) {
      return;
    }

    // Check if user has already seen/dismissed this alert
    try {
      const hasSeen = localStorage.getItem(resolvedStorageKey);
      if (hasSeen === 'true') return;
    } catch {
      // localStorage unavailable — show the alert anyway
    }

    // If configured, hide while WhatsNewModal is still pending
    if (hideUntilWhatsNewDismissed) {
      try {
        const dismissedVersion = localStorage.getItem(WHATS_NEW_STORAGE_KEY);
        if (!dismissedVersion) return;
      } catch {
        // localStorage unavailable
      }
    }

    // Show the component (off-screen initially)
    setIsVisible(true);
    // Animate in after a brief delay to ensure the initial render is committed
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [pathname, href, resolvedStorageKey, hideUntilWhatsNewDismissed]);

  const handleDismiss = useCallback(() => {
    setIsAnimating(false);
    try {
      localStorage.setItem(resolvedStorageKey, 'true');
    } catch {
      // localStorage unavailable
    }
    // Wait for slide-out animation to complete
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  }, [resolvedStorageKey]);

  const handleNavigate = useCallback(() => {
    router.push(href);
  }, [router, href]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed z-[100] transition-all duration-300 ease-out
        top-20 right-4
        max-w-[calc(100vw-2rem)] md:max-w-none
        ${isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${className ?? ''}`}
    >
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-background border border-border hover:bg-destructive hover:text-destructive-foreground z-10 shadow-md"
          aria-label="Dismiss notification"
        >
          <X className="h-3 w-3" />
        </Button>
        {children ?? (
          <Announcement className="bg-green/20 shadow-lg border-green/30">
            <AnnouncementTitle>
              <AnnouncementTag className="bg-green/50 ml-1 hidden xs:block">{tagText}</AnnouncementTag>
              <Button
                variant="animatedGhost"
                className="text-left underline text-sm hover:text-primary whitespace-normal"
                onClick={handleNavigate}
              >
                {linkText ?? `Check out ${title}!`}
              </Button>
            </AnnouncementTitle>
          </Announcement>
        )}
      </div>
    </div>
  );
}