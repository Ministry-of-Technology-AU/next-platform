"use client";

import * as React from "react";

/** Write `value` into a callback or object ref. */
export function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.RefObject<T | null>).current = value;
}

/**
 * Stable callback ref that forwards the element to a consumer `ref` prop
 * (react-hook-form uses this to focus the first invalid field on submit).
 */
export function useForwardedRef<T extends HTMLElement>(ref: React.Ref<HTMLElement> | undefined) {
  return React.useCallback(
    (el: T | null) => {
      assignRef<HTMLElement>(ref, el);
    },
    [ref],
  );
}

/** Coerce legacy `string | number` option values to the string the DOM uses. */
export function optionValue(value: string | number): string {
  return typeof value === "number" ? String(value) : value;
}
