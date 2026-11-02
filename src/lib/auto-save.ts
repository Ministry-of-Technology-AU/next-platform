/**
 * Debounced auto-save, without React. `src/hooks/use-auto-save.ts` wraps it for components;
 * use this directly in non-React code or when one saver must outlive a component.
 *
 * How it behaves:
 * - `update(value)` records the latest value. The save runs once edits pause for `delay` ms,
 *   or after `maxWait` ms of continuous edits, whichever comes first.
 * - One save at a time. Edits made during a save are saved after it, and only the latest
 *   value is sent. Intermediate values are skipped.
 * - A value equal to the last saved one is never sent, so undoing an edit cancels its save.
 * - A failed save keeps the changes dirty. The next edit or `flush()` tries again, and
 *   `retry` adds automatic attempts with exponential backoff.
 */

export type AutoSaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

export interface AutoSaveSnapshot {
  status: AutoSaveStatus;
  /** True while there are changes the server hasn't confirmed. */
  isDirty: boolean;
  /** Epoch ms of the last successful save in this session. */
  lastSavedAt: number | null;
  /** The last save's failure. Cleared by the next successful save. */
  error: unknown;
}

export interface AutoSaveOptions<T> {
  /** Sends the value. Throw (or reject) to mark the save as failed. */
  save: (value: T) => Promise<void>;
  /** Quiet period after the last edit before saving. */
  delay?: number;
  /** Longest a change waits while edits keep coming. Off by default. */
  maxWait?: number;
  /** Equality against the last saved value. Defaults to comparing `JSON.stringify` output. */
  isEqual?: (a: T, b: T) => boolean;
  /** Automatic retries after a failed save. Attempt n waits `delay * 2^(n-1)` ms. */
  retry?: { attempts: number; delay: number };
  onSuccess?: (value: T) => void;
  onError?: (error: unknown, value: T) => void;
}

export interface AutoSaver<T> {
  /** Records the latest value and schedules a save if it differs from the saved one. */
  update(value: T): void;
  /** Saves pending changes now. Resolves true when nothing is left unsaved. */
  flush(): Promise<boolean>;
  /** Drops the scheduled save. The changes stay dirty until the next `update` or `flush`. */
  cancel(): void;
  /** Treats `value` as already saved, e.g. the copy just loaded from the server. */
  markSaved(value: T): void;
  /** Says the server has nothing yet, so the next value seen is saved even if it never changes. */
  markUnsaved(): void;
  /** Swaps the options in place, so callers can pass a fresh `save` closure each render. */
  setOptions(options: AutoSaveOptions<T>): void;
  getSnapshot(): AutoSaveSnapshot;
  subscribe(listener: () => void): () => void;
}

export const DEFAULT_AUTO_SAVE_DELAY = 5000;

const jsonEqual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * `baseline` is what the server already has. Leave it out to treat the first value passed to
 * `update` as saved, or pass `null` when the server has nothing yet.
 */
export function createAutoSaver<T>(initialOptions: AutoSaveOptions<T>, baseline?: T | null): AutoSaver<T> {
  let options = initialOptions;
  let saved: { value: T } | null = baseline === undefined || baseline === null ? null : { value: baseline };
  // Without a baseline, the first value seen is taken as saved: loading isn't an edit.
  let adoptFirst = baseline === undefined;
  let latest: { value: T } | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let maxWaitTimer: ReturnType<typeof setTimeout> | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let retryAttempt = 0;
  let inFlight: Promise<void> | null = null;
  let snapshot: AutoSaveSnapshot = { status: "idle", isDirty: false, lastSavedAt: null, error: null };
  const listeners = new Set<() => void>();

  const setSnapshot = (next: Partial<AutoSaveSnapshot>) => {
    snapshot = { ...snapshot, ...next };
    listeners.forEach((listener) => listener());
  };

  const equalsSaved = (value: T) => saved !== null && (options.isEqual ?? jsonEqual)(value, saved.value);
  const hasUnsaved = () => latest !== null && !equalsSaved(latest.value);

  const clearTimers = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (maxWaitTimer) clearTimeout(maxWaitTimer);
    if (retryTimer) clearTimeout(retryTimer);
    debounceTimer = maxWaitTimer = retryTimer = null;
  };

  const schedule = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => void run(), options.delay ?? DEFAULT_AUTO_SAVE_DELAY);
    if (options.maxWait && !maxWaitTimer) maxWaitTimer = setTimeout(() => void run(), options.maxWait);
  };

  const scheduleRetry = () => {
    const retry = options.retry;
    if (!retry || retryAttempt >= retry.attempts) return;
    retryAttempt += 1;
    retryTimer = setTimeout(() => void run(), retry.delay * 2 ** (retryAttempt - 1));
  };

  async function run(): Promise<void> {
    clearTimers();
    // A save is already running; it re-checks for newer changes when it finishes.
    if (inFlight) return inFlight;
    if (!latest || !hasUnsaved()) {
      setSnapshot({ isDirty: false, status: snapshot.lastSavedAt ? "saved" : "idle" });
      return;
    }

    const { value } = latest;
    setSnapshot({ status: "saving", isDirty: true });
    inFlight = (async () => {
      try {
        await options.save(value);
        saved = { value };
        retryAttempt = 0;
        setSnapshot({ lastSavedAt: Date.now(), error: null });
        options.onSuccess?.(value);
      } catch (error) {
        setSnapshot({ status: "error", error });
        options.onError?.(error, value);
        scheduleRetry();
        return;
      } finally {
        inFlight = null;
      }
      // Edits made while saving go out next, after their own quiet period.
      if (hasUnsaved()) {
        setSnapshot({ status: "pending", isDirty: true });
        schedule();
      } else {
        setSnapshot({ status: "saved", isDirty: false });
      }
    })();
    return inFlight;
  }

  return {
    update(value) {
      latest = { value };
      if (adoptFirst) {
        adoptFirst = false;
        saved = { value };
      }
      if (!hasUnsaved()) {
        if (!inFlight) {
          if (debounceTimer || maxWaitTimer) clearTimers();
          if (snapshot.isDirty) setSnapshot({ isDirty: false, status: snapshot.lastSavedAt ? "saved" : "idle" });
        }
        return;
      }
      retryAttempt = 0;
      if (!inFlight) setSnapshot({ status: "pending", isDirty: true });
      schedule();
    },

    async flush() {
      clearTimers();
      if (inFlight) await inFlight;
      if (hasUnsaved()) await run();
      return !hasUnsaved();
    },

    cancel() {
      clearTimers();
    },

    markSaved(value) {
      adoptFirst = false;
      saved = { value };
      latest = { value };
      clearTimers();
      if (!inFlight) setSnapshot({ isDirty: false, status: snapshot.lastSavedAt ? "saved" : "idle", error: null });
    },

    markUnsaved() {
      adoptFirst = false;
      saved = null;
    },

    setOptions(next) {
      options = next;
    },

    getSnapshot: () => snapshot,

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
