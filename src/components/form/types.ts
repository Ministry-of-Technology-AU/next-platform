import type * as React from "react";
import type { z } from "zod";

/**
 * Props shared by every field. Names match the original `form.tsx` API so
 * existing call sites keep working; everything below `errorMessage` is new.
 */
export interface FieldBaseProps {
  title: string;
  description?: React.ReactNode;
  className?: string;
  isRequired?: boolean;
  /** Error from the parent (react-hook-form, server). Takes precedence over `schema`. */
  errorMessage?: string;

  /** Form field name. Also sets the control id to `field-<name>` for the error summary. */
  name?: string;
  /** Explicit control id. Overrides the id derived from `name`. */
  id?: string;
  disabled?: boolean;
  onBlur?: () => void;
  /**
   * Standalone validation: when set and no `errorMessage` is passed, the field
   * validates itself against this schema on blur, then live after the first
   * error. Use the factories in `@/lib/forms/fields` (`field.email()` …).
   * Not needed inside `<Form>` — the form's resolver handles it there.
   */
  schema?: z.ZodType;
}

/** Option shape for select-style fields. Numbers are accepted and stringified. */
export interface DropdownOption {
  value: string | number;
  label: string;
  /** Kept for backwards compatibility; ignored. Set the default via `value`. */
  isDefault?: boolean;
  /** Kept for backwards compatibility; prefer `onChange`. */
  onClick?: () => void;
  disable?: boolean;
  /** Secondary line under the label (checkbox lists and mobile picker). */
  description?: string;
}
