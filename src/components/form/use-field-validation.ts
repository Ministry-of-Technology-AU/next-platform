"use client";

import * as React from "react";
import type { z } from "zod";
import { firstError } from "@/lib/forms/fields";

interface Options<V> {
  value: V;
  schema?: z.ZodType;
  /** Error supplied by the parent; always wins when set. */
  externalError?: string;
  onBlur?: () => void;
}

/**
 * Standalone validation for a single field.
 *
 * Follows the "reward early, punish late" pattern: nothing is shown while the
 * user is still typing their first attempt; the field validates on blur, and
 * once an error is visible it re-validates on every change so it clears the
 * moment the value becomes valid.
 */
export function useFieldValidation<V>({ value, schema, externalError, onBlur }: Options<V>) {
  const [touched, setTouched] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const validate = React.useCallback(
    (next: V) => {
      if (!schema) return undefined;
      const message = firstError(schema, next);
      setError(message);
      return message;
    },
    [schema],
  );

  const handleBlur = React.useCallback(() => {
    setTouched(true);
    validate(value);
    onBlur?.();
  }, [validate, value, onBlur]);

  /**
   * Blur with an explicit value. For pickers that commit a value and close in
   * the same event, before the parent has re-rendered with the new `value`.
   */
  const blurWith = React.useCallback(
    (next: V) => {
      setTouched(true);
      validate(next);
      onBlur?.();
    },
    [validate, onBlur],
  );

  /** Call from onChange with the new value. */
  const revalidate = React.useCallback(
    (next: V) => {
      if (touched && error !== undefined) validate(next);
    },
    [touched, error, validate],
  );

  return {
    error: externalError || (touched ? error : undefined),
    handleBlur,
    blurWith,
    revalidate,
  };
}
