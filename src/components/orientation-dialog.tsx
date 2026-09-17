'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, X, type LucideIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/**
 * Props for the OrientationDialog component.
 *
 * Supports both **uncontrolled** (self-managing) and **controlled** modes:
 * - Uncontrolled (default): mounts, detects portrait on small screens, shows itself.
 * - Controlled: pass `open` and `onOpenChange` to manage visibility externally.
 *
 * Dismissal is **mount-scoped**: once dismissed, it stays hidden until the
 * component remounts (page navigation, reload). Re-renders from state updates
 * will not re-trigger the dialog.
 */
export interface OrientationDialogProps {
  /** Custom dialog title. */
  readonly title?: string;
  /** Custom description text shown below the icon. */
  readonly description?: string;
  /** Label for the dismiss button. */
  readonly dismissLabel?: string;
  /** Viewport width breakpoint (px) below which the dialog may appear. @default 768 */
  readonly breakpoint?: number;
  /** Icon rendered in the dialog body. @default RotateCcw */
  readonly icon?: LucideIcon;
  /** Controlled open state. When provided, the component becomes controlled. */
  readonly open?: boolean;
  /** Callback when the open state changes (controlled mode). */
  readonly onOpenChange?: (open: boolean) => void;
}

export function OrientationDialog({
  title = 'Rotate Your Device',
  description = 'For the best viewing experience, please rotate your device to landscape orientation.',
  dismissLabel = 'Continue Anyway',
  breakpoint = 768,
  icon: Icon = RotateCcw,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: OrientationDialogProps) {
  const isControlled = controlledOpen !== undefined;

  const [internalOpen, setInternalOpen] = useState(false);
  // Tracks whether the user has explicitly dismissed the dialog during this mount.
  // Resets automatically when the component unmounts (navigation / reload).
  const dismissedThisMount = useRef(false);

  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setIsOpen = useCallback(
    (nextOpen: boolean) => {
      if (isControlled) {
        controlledOnOpenChange?.(nextOpen);
      } else {
        setInternalOpen(nextOpen);
      }
    },
    [isControlled, controlledOnOpenChange],
  );

  // Detect orientation and show/hide the dialog
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // In controlled mode, the parent manages visibility — skip auto-detection.
    if (isControlled) return;

    const checkOrientation = () => {
      // Once dismissed during this mount cycle, never re-show
      if (dismissedThisMount.current) return;

      const isPortrait = window.innerHeight > window.innerWidth;
      const isSmallScreen = window.innerWidth < breakpoint;

      if (isPortrait && isSmallScreen) {
        setInternalOpen(true);
      } else {
        // Auto-close when the user rotates to landscape
        setInternalOpen(false);
      }
    };

    // Small delay to ensure proper initialisation after mount
    const timer = setTimeout(checkOrientation, 100);

    window.addEventListener('resize', checkOrientation);

    // orientationchange can report stale dimensions — debounce it
    const handleOrientationChange = () => {
      setTimeout(checkOrientation, 300);
    };
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [breakpoint, isControlled]);

  const handleDismiss = useCallback(() => {
    dismissedThisMount.current = true;
    setIsOpen(false);
  }, [setIsOpen]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        // Treat any close action (overlay click, escape) the same as dismiss
        handleDismiss();
      } else {
        setIsOpen(true);
      }
    },
    [handleDismiss, setIsOpen],
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-24 border-2 border-dashed border-muted-foreground rounded-lg mb-2">
                <Icon className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              {dismissLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
