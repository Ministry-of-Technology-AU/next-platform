"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The frame every form field renders inside: label, helper text, control slot
 * and an animated error line, with all ids wired for assistive tech.
 *
 * Signature detail: a thin "margin rule" sits just left of the field. It turns
 * crimson while any control inside has focus and destructive when invalid, so
 * the active question is findable at a glance in long forms. It is positioned
 * outside the content box, so it never shifts layout.
 */

export interface FieldIds {
  /** id for the primary focusable control (input, trigger, first option). */
  controlId: string;
  labelId: string;
  descriptionId: string;
  errorId: string;
}

/**
 * Stable ids for a field. With `name` the control id is `field-<name>`, which
 * the error summary links to; `id` overrides it entirely.
 */
export function useFieldIds(id?: string, name?: string): FieldIds {
  const reactId = React.useId();
  const controlId = id ?? (name ? `field-${name}` : `field${reactId.replace(/:/g, "-")}`);
  return {
    controlId,
    labelId: `${controlId}-label`,
    descriptionId: `${controlId}-description`,
    errorId: `${controlId}-error`,
  };
}

/** Props accepted by the control element to link it to its label, help and error. */
export function controlAria(
  ids: FieldIds,
  state: { hasDescription: boolean; error?: string; required?: boolean },
) {
  const describedBy = [state.hasDescription ? ids.descriptionId : null, state.error ? ids.errorId : null]
    .filter(Boolean)
    .join(" ");
  return {
    "aria-describedby": describedBy || undefined,
    "aria-invalid": state.error ? true : undefined,
    "aria-required": state.required || undefined,
  } as const;
}

export function RequiredMark() {
  return (
    <>
      <span aria-hidden="true" className="text-destructive-text">
        *
      </span>
      <span className="sr-only">(required)</span>
    </>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    // Always-mounted polite live region: errors are announced when they appear
    // without stealing focus or interrupting the user mid-sentence.
    <div aria-live="polite" aria-atomic="true">
      <AnimatePresence initial={false}>
        {message ? (
          <motion.p
            // Keyed on presence, not text: changing messages update in place,
            // so two elements never share the error id mid-animation.
            key="error"
            id={id}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="flex items-start gap-1.5 text-sm text-destructive-text"
          >
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>{message}</span>
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export interface FieldShellProps {
  ids: FieldIds;
  title?: string;
  description?: React.ReactNode;
  isRequired?: boolean;
  error?: string;
  className?: string;
  /**
   * `label` (default) renders a <label for=controlId>. `group` renders a
   * `role="group"` container labelled by the title, for checkbox lists,
   * date + time pairs and other multi-control fields.
   */
  variant?: "label" | "group";
  /** Extra content on the right of the label row (character counter, etc.). */
  labelAside?: React.ReactNode;
  disabled?: boolean;
  children: React.ReactNode;
}

export function FieldShell({
  ids,
  title,
  description,
  isRequired = false,
  error,
  className,
  variant = "label",
  labelAside,
  disabled,
  children,
}: FieldShellProps) {
  const hasTitle = Boolean(title && title.trim());
  const labelClass = "text-base font-medium leading-snug text-foreground";

  const heading = hasTitle ? (
    <div className="flex items-baseline justify-between gap-3">
      {variant === "label" ? (
        <label id={ids.labelId} htmlFor={ids.controlId} className={cn(labelClass, "cursor-pointer")}>
          {title} {isRequired && <RequiredMark />}
        </label>
      ) : (
        <span id={ids.labelId} className={labelClass}>
          {title} {isRequired && <RequiredMark />}
        </span>
      )}
      {labelAside}
    </div>
  ) : null;

  const body = (
    <>
      {heading}
      {description ? (
        <p id={ids.descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {children}
      <FieldError id={ids.errorId} message={error} />
    </>
  );

  const shellClass = cn(
    "group/field relative space-y-2",
    // Margin rule — see component doc.
    "before:pointer-events-none before:absolute before:-left-2.5 before:top-0.5 before:bottom-0.5 before:w-0.5 before:rounded-full before:bg-transparent before:transition-colors before:duration-200",
    "focus-within:before:bg-primary/70 data-[invalid=true]:before:bg-destructive",
    "data-[disabled=true]:opacity-70",
    className,
  );

  if (variant === "group") {
    return (
      <div
        role="group"
        aria-labelledby={hasTitle ? ids.labelId : undefined}
        aria-describedby={description ? ids.descriptionId : undefined}
        data-invalid={error ? true : undefined}
        data-disabled={disabled || undefined}
        className={shellClass}
      >
        {body}
      </div>
    );
  }

  return (
    <div data-invalid={error ? true : undefined} data-disabled={disabled || undefined} className={shellClass}>
      {body}
    </div>
  );
}
