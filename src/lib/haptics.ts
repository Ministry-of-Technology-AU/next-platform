/**
 * Shared haptic feedback helper.
 * One place — never ad-hoc imports in components.
 *
 * Reasons for this wrapper over direct library import:
 *   1. SSR safety: web-haptics touches window on init; the guard lives here once, not in every component.
 *   2. Singleton: one WebHaptics instance shared across the app.
 *   3. Named semantic presets: call `haptic.tap()` instead of `triggerHaptic("light")` everywhere.
 *
 * Silent no-op on desktop or browsers that don't support the Vibration API.
 */

import type { HapticInput } from "web-haptics";

let instance: import("web-haptics").WebHaptics | null = null;

async function getInstance(): Promise<import("web-haptics").WebHaptics | null> {
  if (typeof window === "undefined") return null;
  if (instance) return instance;
  const { WebHaptics } = await import("web-haptics");
  if (!WebHaptics.isSupported) return null;
  instance = new WebHaptics();
  return instance;
}

/** Low-level trigger — accepts any HapticInput the library supports. */
export async function triggerHaptic(type: HapticInput = "medium"): Promise<void> {
  const h = await getInstance();
  if (!h) return;
  await h.trigger(type);
}

/**
 * Named semantic presets — prefer these at call sites.
 *
 * Usage:
 *   import { haptic } from "@/lib/haptics";
 *   <button onClick={() => void haptic.tap()}>Click</button>
 */
export const haptic = {
  /** Light tap — secondary buttons, small toggles, subtle interactions. */
  tap: () => triggerHaptic("light"),
  /** Standard press — primary buttons, card clicks, committed actions. */
  press: () => triggerHaptic("medium"),
  /** Discrete tick — tabs, pickers, segment switches. */
  select: () => triggerHaptic("selection"),
  /** Positive outcome — form saved, action confirmed. */
  confirm: () => triggerHaptic("success"),
  /** Negative outcome — validation failure, network error. */
  error: () => triggerHaptic("error"),
  /** Cautionary — destructive action ahead, irreversible step. */
  warn: () => triggerHaptic("warning"),
};
