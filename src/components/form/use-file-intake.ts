"use client";

import * as React from "react";
import {
  FILE_KINDS,
  MAX_UPLOAD_MB,
  MB,
  compressImage,
  detectFileKind,
  formatBytes,
  matchesAccept,
  verifyFileSignature,
  type CompressOptions,
  type FileKind,
} from "@/lib/forms/fields";
import { haptic } from "@/lib/haptics";

export interface FileIntakeOptions {
  value: File[];
  onChange?: (files: File[]) => void;
  /** HTML accept string. */
  accept?: string;
  /** Restrict to these kinds on top of `accept`. */
  kinds?: readonly FileKind[];
  multiple: boolean;
  /** Per-file limit in MB (capped at MAX_UPLOAD_MB). */
  maxSizeMB: number;
  maxFiles?: number;
  /** Combined limit across all files in MB. */
  maxTotalMB?: number;
  /** Compress images on intake. `false` to keep originals. */
  compress: boolean | CompressOptions;
}

function sameFile(a: File, b: File) {
  return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
}

/**
 * Takes files from a picker, drop or paste and decides what enters form state.
 * Each file must match the accept list, have contents matching its extension
 * (magic bytes), and fit the size limit after compression. Rejections are
 * returned as readable messages instead of being silently dropped.
 */
export function useFileIntake(options: FileIntakeOptions) {
  const { value, onChange, accept, kinds, multiple, maxFiles, maxTotalMB, compress } = options;
  const maxBytes = Math.min(options.maxSizeMB, MAX_UPLOAD_MB) * MB;
  const [busy, setBusy] = React.useState(false);
  const [rejections, setRejections] = React.useState<string[]>([]);
  // Latest value, so two quick drops don't overwrite each other.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  const add = React.useCallback(
    async (incoming: readonly File[]) => {
      if (incoming.length === 0) return;
      setBusy(true);
      const problems: string[] = [];
      const accepted: File[] = [];
      const current = multiple ? valueRef.current : [];
      const limit = multiple ? (maxFiles ?? Infinity) : 1;
      let ignored = 0;

      for (const original of incoming) {
        // Single-file fields keep the first *valid* file from a multi-file drop.
        if (!multiple && accepted.length === 1) {
          ignored += 1;
          continue;
        }
        if (current.length + accepted.length >= limit) {
          problems.push(`You can add up to ${limit} file${limit === 1 ? "" : "s"} — ${original.name} was not added`);
          continue;
        }
        const kind = detectFileKind(original);
        if (!kind || (kinds && !kinds.includes(kind)) || !matchesAccept(original, accept)) {
          problems.push(`${original.name} isn't an allowed file type`);
          continue;
        }
        if (!(await verifyFileSignature(original))) {
          problems.push(`${original.name} doesn't look like a real ${FILE_KINDS[kind].label} — it may be damaged or renamed`);
          continue;
        }
        const file =
          kind === "image" && compress !== false
            ? await compressImage(original, compress === true ? undefined : compress)
            : original;
        if (file.size > maxBytes) {
          problems.push(`${original.name} is ${formatBytes(file.size)} — the limit is ${formatBytes(maxBytes)}`);
          continue;
        }
        if ([...current, ...accepted].some((f) => sameFile(f, file) || sameFile(f, original))) {
          problems.push(`${original.name} is already added`);
          continue;
        }
        accepted.push(file);
      }

      if (ignored > 0 && accepted[0]) {
        problems.push(`Only one file can be added here — kept ${accepted[0].name}`);
      }

      if (maxTotalMB !== undefined && accepted.length > 0) {
        const total = [...current, ...accepted].reduce((sum, f) => sum + f.size, 0);
        if (total > maxTotalMB * MB) {
          problems.push(`Files would add up to ${formatBytes(total)} — the limit is ${maxTotalMB} MB in total`);
          accepted.length = 0;
        }
      }

      setBusy(false);
      setRejections(problems);
      if (accepted.length > 0) {
        onChange?.([...current, ...accepted]);
        void haptic.tap();
      } else if (problems.length > 0) {
        void haptic.error();
      }
    },
    [accept, compress, kinds, maxBytes, maxFiles, maxTotalMB, multiple, onChange],
  );

  const remove = React.useCallback(
    (file: File) => {
      onChange?.(valueRef.current.filter((f) => f !== file));
      setRejections([]);
      void haptic.tap();
    },
    [onChange],
  );

  return { add, remove, busy, rejections, clearRejections: () => setRejections([]) };
}

/**
 * Returns the previous array while its items are unchanged, so callers that
 * pass a fresh `[]` literal every render don't retrigger effects.
 */
function useShallowStable<T>(items: readonly T[]): readonly T[] {
  const ref = React.useRef(items);
  const prev = ref.current;
  const same = prev.length === items.length && prev.every((item, i) => item === items[i]);
  if (!same) ref.current = items;
  return same ? prev : items;
}

/** Stable object URLs for local files, revoked when files leave or on unmount. */
export function useObjectUrls(input: readonly File[]): Map<File, string> {
  const files = useShallowStable(input);
  const [urls, setUrls] = React.useState<Map<File, string>>(() => new Map());

  React.useEffect(() => {
    const next = new Map<File, string>();
    for (const file of files) next.set(file, URL.createObjectURL(file));
    setUrls(next);
    return () => {
      for (const url of next.values()) URL.revokeObjectURL(url);
    };
  }, [files]);

  return urls;
}
