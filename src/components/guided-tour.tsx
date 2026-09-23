"use client";
import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
  useId,
} from "react";
import { Slot } from "@radix-ui/react-slot";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { platform } from "@/lib/platform-logger";

// --- Types ---
export type TourPosition = "top" | "bottom" | "left" | "right";

export interface TourStepConfig {
  id: string;
  title: string;
  content: string;
  position?: TourPosition;
  order: number;
  onOpen?: () => void; // Called before the step is shown (e.g. open a sidebar)
  selector?: string; // Target element selector, useful for portals
  triggerSelector?: string; // Element to auto-click to open sidebar/dialog
}

interface TourProviderProps {
  children: ReactNode;
  autoStart?: boolean;
  ranOnce?: boolean;
  storageKey?: string;
  shouldStart?: boolean;
  onTourComplete?: () => void;
  onTourSkip?: () => void;
  onStepChange?: (step: TourStepConfig | null) => void;
}

interface TourContextType {
  registerStep: (stepConfig: TourStepConfig, ownerId: string) => void;
  unregisterStep: (id: string, ownerId: string) => void;
  startTour: () => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  resetTourCompletion: () => void;
  isActive: boolean;
  currentStepId: string | null;
  currentStepIndex: number;
  totalSteps: number;
  currentStepData: TourStepConfig | null;
}

interface RegisteredStep {
  config: TourStepConfig;
  ownerId: string;
}

interface PopoverPlacement {
  top: number;
  left: number;
  position: TourPosition;
}

// --- Constants ---
const DEFAULT_STORAGE_KEY = "rigidui-tour-completed";
const ELEMENT_WAIT_TIMEOUT_MS = 2000;
const AUTO_START_DELAY_MS = 500;
const SCROLL_SETTLE_MS = 350;
const POPOVER_MARGIN = 16;
const HIGHLIGHT_PADDING = 8;
const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// --- Helpers ---
const safeQuery = (selector: string): HTMLElement | null => {
  if (typeof document === "undefined") return null;
  try {
    return document.querySelector<HTMLElement>(selector);
  } catch (error) {
    platform.warn(`[guided-tour] Invalid selector "${selector}"`, error);
    return null;
  }
};

const escapeAttr = (value: string) =>
  typeof CSS !== "undefined" && typeof CSS.escape === "function"
    ? CSS.escape(value)
    : value.replace(/"/g, '\\"');

const resolveStepTarget = (
  step: Pick<TourStepConfig, "id" | "selector"> | null
): HTMLElement | null => {
  if (!step) return null;
  if (step.selector) return safeQuery(step.selector);
  return safeQuery(`[data-tour-step="${escapeAttr(step.id)}"]`);
};

// localStorage can throw (private mode, disabled storage, SSR)
const storage = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      platform.warn("[guided-tour] Unable to write localStorage", error);
    }
  },
  remove(key: string) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      platform.warn("[guided-tour] Unable to clear localStorage", error);
    }
  },
};

/**
 * Polls (via rAF) until the step's target is in the DOM, or gives up after
 * ELEMENT_WAIT_TIMEOUT_MS. Returns a cancel function.
 */
const waitForStepTarget = (
  step: TourStepConfig,
  onFound: (element: HTMLElement) => void,
  onTimeout: () => void
): (() => void) => {
  const deadline = performance.now() + ELEMENT_WAIT_TIMEOUT_MS;
  let frame = 0;
  let cancelled = false;

  const tick = () => {
    if (cancelled) return;
    const element = resolveStepTarget(step);
    if (element) {
      onFound(element);
      return;
    }
    if (performance.now() > deadline) {
      onTimeout();
      return;
    }
    frame = requestAnimationFrame(tick);
  };

  tick();
  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
  };
};

// --- Helper Hook to lock body scroll (compensates for scrollbar width) ---
const useScrollLock = (locked: boolean) => {
  useEffect(() => {
    if (!locked) return;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [locked]);
};

const TourContext = createContext<TourContextType | null>(null);

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
};

// --- TourOverlay Component ---
const TourOverlay: React.FC = () => {
  const { isActive, currentStepData } = useTour();
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  useScrollLock(isActive);

  useEffect(() => {
    if (!isActive || !currentStepData) {
      setHighlightRect(null);
      return;
    }

    const target = resolveStepTarget(currentStepData);
    if (!target) {
      setHighlightRect(null);
      return;
    }

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setHighlightRect(target.getBoundingClientRect());
      });
    };

    setHighlightRect(target.getBoundingClientRect());

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    resizeObserver?.observe(target);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isActive, currentStepData]);

  if (!isActive || !highlightRect) {
    return null;
  }

  const top = highlightRect.top - HIGHLIGHT_PADDING;
  const left = highlightRect.left - HIGHLIGHT_PADDING;
  const width = highlightRect.width + HIGHLIGHT_PADDING * 2;
  const height = highlightRect.height + HIGHLIGHT_PADDING * 2;
  const right = left + width;
  const bottom = top + height;

  const shadeClass =
    "absolute bg-black/30 backdrop-blur-sm pointer-events-auto transition-all duration-300";

  return (
    <div
      className="fixed inset-0 z-[10000] pointer-events-none"
      aria-hidden="true"
      data-tour-overlay=""
    >
      {/* Top */}
      <div
        className={cn(shadeClass, "top-0 left-0 right-0")}
        style={{ height: Math.max(0, top) }}
      />
      {/* Bottom */}
      <div
        className={cn(shadeClass, "left-0 right-0")}
        style={{ top: Math.max(0, bottom), bottom: 0 }}
      />
      {/* Left */}
      <div
        className={cn(shadeClass, "left-0")}
        style={{ top: Math.max(0, top), height, width: Math.max(0, left) }}
      />
      {/* Right */}
      <div
        className={cn(shadeClass, "right-0")}
        style={{ top: Math.max(0, top), height, left: Math.max(0, right) }}
      />
      {/* Border outline */}
      <div
        className="absolute rounded-xl pointer-events-none transition-all duration-300 border-2 border-primary/50 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        style={{ left, top, width, height }}
      />
    </div>
  );
};

// --- GlobalTourPopover Component ---
const GlobalTourPopover: React.FC = () => {
  const {
    isActive,
    currentStepIndex,
    totalSteps,
    nextStep,
    prevStep,
    stopTour,
    currentStepData,
  } = useTour();

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [placement, setPlacement] = useState<PopoverPlacement | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const calculateOptimalPosition = useCallback(
    (
      targetRect: DOMRect,
      preferredPosition: TourPosition = "bottom"
    ): PopoverPlacement => {
      const popoverWidth = popoverRef.current?.offsetWidth || 320;
      const popoverHeight = popoverRef.current?.offsetHeight || 200;
      const margin = POPOVER_MARGIN;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const isMobile = viewportWidth < 768;

      const spaceTop = targetRect.top;
      const spaceBottom = viewportHeight - targetRect.bottom;

      let position: TourPosition = preferredPosition;
      let top = 0;
      let left = 0;

      if (isMobile) {
        left = (viewportWidth - popoverWidth) / 2;

        const positionsToTry: ("top" | "bottom")[] = ["bottom", "top"];
        if (preferredPosition === "top") {
          positionsToTry.reverse();
        }

        let placed = false;
        for (const pos of positionsToTry) {
          if (pos === "bottom" && spaceBottom >= popoverHeight + margin) {
            top = targetRect.bottom + margin;
            position = "bottom";
            placed = true;
            break;
          }
          if (pos === "top" && spaceTop >= popoverHeight + margin) {
            top = targetRect.top - popoverHeight - margin;
            position = "top";
            placed = true;
            break;
          }
        }

        if (!placed) {
          position = "bottom";
          top = viewportHeight - popoverHeight - margin;
        }
      } else {
        const spaceLeft = targetRect.left;
        const spaceRight = viewportWidth - targetRect.right;
        const positionsToTry: TourPosition[] = [
          preferredPosition,
          "bottom",
          "top",
          "right",
          "left",
        ];
        const uniquePositions = [...new Set(positionsToTry)];

        let placed = false;
        for (const p of uniquePositions) {
          if (p === "bottom" && spaceBottom >= popoverHeight + margin) {
            position = "bottom";
            top = targetRect.bottom + margin;
            left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
            placed = true;
            break;
          }
          if (p === "top" && spaceTop >= popoverHeight + margin) {
            position = "top";
            top = targetRect.top - popoverHeight - margin;
            left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
            placed = true;
            break;
          }
          if (p === "right" && spaceRight >= popoverWidth + margin) {
            position = "right";
            top = targetRect.top + targetRect.height / 2 - popoverHeight / 2;
            left = targetRect.right + margin;
            placed = true;
            break;
          }
          if (p === "left" && spaceLeft >= popoverWidth + margin) {
            position = "left";
            top = targetRect.top + targetRect.height / 2 - popoverHeight / 2;
            left = targetRect.left - popoverWidth - margin;
            placed = true;
            break;
          }
        }

        if (!placed) {
          top = (viewportHeight - popoverHeight) / 2;
          left = (viewportWidth - popoverWidth) / 2;
        }
      }

      top = Math.max(
        margin,
        Math.min(top, viewportHeight - popoverHeight - margin)
      );
      left = Math.max(
        margin,
        Math.min(left, viewportWidth - popoverWidth - margin)
      );

      return { top, left, position };
    },
    []
  );

  // Resolve the target element for the current step
  useEffect(() => {
    if (!isActive || !currentStepData) {
      setTargetElement(null);
      return;
    }
    setTargetElement(resolveStepTarget(currentStepData));
  }, [isActive, currentStepData]);

  // Position the popover once it is mounted (ref available), keep it in sync
  // with scroll/resize, and re-measure after the smooth scroll settles.
  useLayoutEffect(() => {
    if (!targetElement || !currentStepData) {
      setPlacement(null);
      return;
    }

    const preferred = currentStepData.position;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setPlacement(
          calculateOptimalPosition(
            targetElement.getBoundingClientRect(),
            preferred
          )
        );
      });
    };

    setPlacement(
      calculateOptimalPosition(targetElement.getBoundingClientRect(), preferred)
    );
    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });

    const settleTimer = setTimeout(update, SCROLL_SETTLE_MS);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      clearTimeout(settleTimer);
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [targetElement, currentStepData, calculateOptimalPosition]);

  // Focus management: remember focus when the tour opens, restore when it closes
  useEffect(() => {
    if (!isActive) return;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    return () => {
      previousFocusRef.current?.focus?.({ preventScroll: true });
      previousFocusRef.current = null;
    };
  }, [isActive]);

  // Move focus into the popover on each step so screen readers announce it
  useEffect(() => {
    if (!targetElement) return;
    const frame = requestAnimationFrame(() => {
      popoverRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [targetElement, currentStepData]);

  const isLastStep = currentStepIndex === totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        nextStep();
        break;
      case "ArrowLeft":
        if (!isFirstStep) {
          event.preventDefault();
          prevStep();
        }
        break;
      case "Tab": {
        // Trap focus inside the popover while the tour is active
        const focusables = popoverRef.current?.querySelectorAll<HTMLElement>(
          FOCUSABLE_SELECTOR
        );
        if (!focusables || focusables.length === 0) break;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (event.shiftKey && (active === first || active === popoverRef.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
        break;
      }
      default:
        break;
    }
  };

  if (!isActive || !currentStepData || !targetElement) {
    return null;
  }

  const progressValue =
    totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      data-tour-popover=""
      data-position={placement?.position ?? "bottom"}
      className="fixed z-[10003] w-[min(20rem,calc(100vw-2rem))] outline-none"
      style={{
        top: `${placement?.top ?? 0}px`,
        left: `${placement?.left ?? 0}px`,
        opacity: placement ? 1 : 0,
        pointerEvents: placement ? "auto" : "none",
        transition: "top 0.3s ease, left 0.3s ease, opacity 0.15s ease",
      }}
    >
      <Card className="border-2 border-primary/20 backdrop-blur-sm shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold"
                aria-hidden="true"
              >
                {currentStepIndex + 1}
              </div>
              <CardTitle id={titleId} className="text-lg">
                <span className="sr-only">
                  Step {currentStepIndex + 1} of {totalSteps}:{" "}
                </span>
                {currentStepData.title}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={stopTour}
              aria-label="Close tour"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <Progress
            value={progressValue}
            className="h-1.5 bg-muted"
            aria-label={`Tour progress: step ${currentStepIndex + 1} of ${totalSteps}`}
          />
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription
            id={descriptionId}
            className="text-sm leading-relaxed mb-4"
          >
            {currentStepData.content}
          </CardDescription>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={stopTour}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip Tour
            </Button>
            {!isFirstStep && (
              <Button variant="outline" size="sm" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
                Back
              </Button>
            )}
            <Button size="sm" onClick={nextStep}>
              {isLastStep ? "Finish" : "Next"}
              {!isLastStep && (
                <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// --- TourProvider Component ---
export const TourProvider: React.FC<TourProviderProps> = ({
  children,
  autoStart = false,
  ranOnce = true,
  storageKey = DEFAULT_STORAGE_KEY,
  shouldStart = true,
  onTourComplete,
  onTourSkip,
  onStepChange,
}) => {
  const [steps, setSteps] = useState<Map<string, RegisteredStep>>(new Map());
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeSteps, setActiveSteps] = useState<TourStepConfig[]>([]);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  // Latest-value refs so the memoized actions never read stale state
  const stepsRef = useRef(steps);
  const isActiveRef = useRef(false);
  const activeStepsRef = useRef<TourStepConfig[]>([]);
  const currentStepRef = useRef(0);
  const shownAnyStepRef = useRef(false);
  const cancelPendingRef = useRef<(() => void) | null>(null);
  const callbacksRef = useRef({ onTourComplete, onTourSkip, onStepChange });

  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  useEffect(() => {
    callbacksRef.current = { onTourComplete, onTourSkip, onStepChange };
  }, [onTourComplete, onTourSkip, onStepChange]);

  const cancelPending = useCallback(() => {
    cancelPendingRef.current?.();
    cancelPendingRef.current = null;
  }, []);

  // Cancel any in-flight element wait on unmount
  useEffect(() => cancelPending, [cancelPending]);

  const registerStep = useCallback(
    (stepConfig: TourStepConfig, ownerId: string) => {
      setSteps((prev) => {
        const existing = prev.get(stepConfig.id);
        if (existing && existing.ownerId !== ownerId) {
          platform.warn(
            `[guided-tour] Duplicate TourStep id "${stepConfig.id}"; the latest registration wins.`
          );
        }
        const next = new Map(prev);
        next.set(stepConfig.id, { config: stepConfig, ownerId });
        return next;
      });
    },
    []
  );

  const unregisterStep = useCallback((id: string, ownerId: string) => {
    setSteps((prev) => {
      const existing = prev.get(id);
      // Only the instance that owns the registration may remove it
      if (!existing || existing.ownerId !== ownerId) return prev;
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const endTour = useCallback(
    (completed: boolean) => {
      cancelPending();
      if (!isActiveRef.current) return;

      isActiveRef.current = false;
      activeStepsRef.current = [];
      currentStepRef.current = 0;
      setIsActive(false);
      setCurrentStep(0);
      setActiveSteps([]);

      const callbacks = callbacksRef.current;
      callbacks.onStepChange?.(null);

      if (completed) {
        if (ranOnce) {
          storage.set(storageKey, "true");
        }
        callbacks.onTourComplete?.();
        window.dispatchEvent(
          new CustomEvent("tourCompleted", { detail: { storageKey } })
        );
      } else {
        callbacks.onTourSkip?.();
      }
    },
    [cancelPending, ranOnce, storageKey]
  );

  // Ref so goToStep can recurse (skip missing steps) without self-reference
  const goToStepRef = useRef<
    (stepList: TourStepConfig[], index: number, direction: 1 | -1) => void
  >(() => { });

  /**
   * Move to `index`, running the step's trigger/onOpen first and waiting for its
   * target to appear. Steps whose target never shows up are skipped in
   * `direction`; walking off the end finishes the tour.
   */
  const goToStep = useCallback(
    (stepList: TourStepConfig[], index: number, direction: 1 | -1) => {
      cancelPending();
      if (!isActiveRef.current) return;

      if (index >= stepList.length) {
        // Only count as completed if the user actually saw a step
        endTour(shownAnyStepRef.current);
        return;
      }
      if (index < 0) return;

      const step = stepList[index];
      if (step.triggerSelector) {
        safeQuery(step.triggerSelector)?.click();
      }
      step.onOpen?.();

      cancelPendingRef.current = waitForStepTarget(
        step,
        () => {
          cancelPendingRef.current = null;
          shownAnyStepRef.current = true;
          currentStepRef.current = index;
          setCurrentStep(index);
        },
        () => {
          cancelPendingRef.current = null;
          platform.warn(
            `[guided-tour] Target for step "${step.id}" not found; skipping.`
          );
          goToStepRef.current(stepList, index + direction, direction);
        }
      );
    },
    [cancelPending, endTour]
  );

  useEffect(() => {
    goToStepRef.current = goToStep;
  }, [goToStep]);

  const startTour = useCallback(() => {
    if (isActiveRef.current) return;

    const sortedSteps = Array.from(stepsRef.current.values())
      .map((entry) => entry.config)
      .sort((a, b) => a.order - b.order);

    if (sortedSteps.length === 0) {
      platform.warn("[guided-tour] startTour called with no registered steps");
      return;
    }

    shownAnyStepRef.current = false;
    isActiveRef.current = true;
    activeStepsRef.current = sortedSteps;
    currentStepRef.current = 0;
    setActiveSteps(sortedSteps);
    setCurrentStep(0);
    setIsActive(true);
    goToStepRef.current(sortedSteps, 0, 1);
  }, []);

  const stopTour = useCallback(() => endTour(false), [endTour]);

  const nextStep = useCallback(() => {
    if (!isActiveRef.current) return;
    const stepList = activeStepsRef.current;
    const index = currentStepRef.current;
    if (index >= stepList.length - 1) {
      endTour(true);
      return;
    }
    goToStepRef.current(stepList, index + 1, 1);
  }, [endTour]);

  const prevStep = useCallback(() => {
    if (!isActiveRef.current) return;
    const index = currentStepRef.current;
    if (index <= 0) return;
    goToStepRef.current(activeStepsRef.current, index - 1, -1);
  }, []);

  const resetTourCompletion = useCallback(() => {
    if (!ranOnce) return;
    storage.remove(storageKey);
    setHasAutoStarted(false);
    window.dispatchEvent(
      new CustomEvent("tourReset", { detail: { storageKey } })
    );
  }, [ranOnce, storageKey]);

  // --- Auto start ---
  useEffect(() => {
    if (!autoStart || hasAutoStarted || !shouldStart || steps.size === 0) {
      return;
    }
    if (ranOnce && storage.get(storageKey) === "true") {
      setHasAutoStarted(true);
      return;
    }
    const timer = setTimeout(() => {
      setHasAutoStarted(true);
      startTour();
    }, AUTO_START_DELAY_MS);
    return () => clearTimeout(timer);
  }, [autoStart, hasAutoStarted, shouldStart, steps, ranOnce, storageKey, startTour]);

  // Escape always exits the tour, so users can never get stuck with a locked page
  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        endTour(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, endTour]);

  const currentStepData = activeSteps[currentStep] ?? null;

  useEffect(() => {
    if (isActive && currentStepData) {
      callbacksRef.current.onStepChange?.(currentStepData);
    }
  }, [isActive, currentStepData]);

  const contextValue = useMemo<TourContextType>(
    () => ({
      registerStep,
      unregisterStep,
      startTour,
      stopTour,
      nextStep,
      prevStep,
      resetTourCompletion,
      isActive,
      currentStepId: currentStepData?.id ?? null,
      currentStepIndex: currentStep,
      totalSteps: activeSteps.length,
      currentStepData,
    }),
    [
      registerStep,
      unregisterStep,
      startTour,
      stopTour,
      nextStep,
      prevStep,
      resetTourCompletion,
      isActive,
      currentStepData,
      currentStep,
      activeSteps.length,
    ]
  );

  return (
    <TourContext.Provider value={contextValue}>
      {children}
      <TourOverlay />
      <GlobalTourPopover />
    </TourContext.Provider>
  );
};

// --- TourStep Component ---
interface TourStepProps extends TourStepConfig {
  children?: ReactNode;
  className?: string;
}

export const TourStep: React.FC<TourStepProps> = ({
  children,
  id,
  title,
  content,
  order,
  position,
  onOpen,
  selector,
  triggerSelector,
  className,
}) => {
  const { registerStep, unregisterStep } = useTour();
  const ownerId = useId();

  // Keep the latest onOpen without re-registering on every render when
  // callers pass an inline arrow function
  const onOpenRef = useRef(onOpen);
  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);
  const stableOnOpen = useCallback(() => onOpenRef.current?.(), []);

  useEffect(() => {
    registerStep(
      {
        id,
        title,
        content,
        order,
        position,
        selector,
        triggerSelector,
        onOpen: stableOnOpen,
      },
      ownerId
    );
    return () => {
      unregisterStep(id, ownerId);
    };
  }, [
    id,
    title,
    content,
    order,
    position,
    selector,
    triggerSelector,
    stableOnOpen,
    ownerId,
    registerStep,
    unregisterStep,
  ]);

  if (!children && selector) {
    return null; // Purely logical registration for a remote/portal target
  }

  return (
    <div data-tour-step={id} className={className}>
      {children}
    </div>
  );
};

// --- TourTrigger Component ---
interface TourTriggerProps {
  children: ReactNode;
  className?: string;
  hideAfterComplete?: boolean;
  storageKey?: string;
  /** Render the child as the trigger instead of wrapping it in a button */
  asChild?: boolean;
}

export const TourTrigger: React.FC<TourTriggerProps> = ({
  children,
  className,
  hideAfterComplete = false,
  storageKey = DEFAULT_STORAGE_KEY,
  asChild = false,
}) => {
  const { startTour } = useTour();
  const [tourCompleted, setTourCompleted] = useState(false);

  useEffect(() => {
    if (!hideAfterComplete) return;

    setTourCompleted(storage.get(storageKey) === "true");

    const matchesKey = (event: Event) => {
      const detail = (event as CustomEvent<{ storageKey?: string }>).detail;
      return (detail?.storageKey ?? DEFAULT_STORAGE_KEY) === storageKey;
    };
    const handleTourComplete = (event: Event) => {
      if (matchesKey(event)) setTourCompleted(true);
    };
    const handleTourReset = (event: Event) => {
      if (matchesKey(event)) setTourCompleted(false);
    };

    window.addEventListener("tourCompleted", handleTourComplete);
    window.addEventListener("tourReset", handleTourReset);
    return () => {
      window.removeEventListener("tourCompleted", handleTourComplete);
      window.removeEventListener("tourReset", handleTourReset);
    };
  }, [hideAfterComplete, storageKey]);

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    startTour();
  };

  if (hideAfterComplete && tourCompleted) {
    return null;
  }

  if (asChild) {
    return (
      <Slot onClick={handleClick} className={className} data-tour-trigger="">
        {children}
      </Slot>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      data-tour-trigger=""
    >
      {children}
    </button>
  );
};

export default TourProvider;
