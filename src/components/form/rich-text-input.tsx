"use client";

import * as React from "react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { htmlToPlainText, stripUnsafeHtml } from "@/lib/forms/fields";
import { cn } from "@/lib/utils";
import { FieldShell, useFieldIds } from "./field-shell";
import type { FieldBaseProps } from "./types";
import { useFieldValidation } from "./use-field-validation";
import { assignRef } from "./utils";

export interface RichTextInputProps extends FieldBaseProps {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  /** Shows a counter of visible characters (tags excluded). */
  maxChars?: number;
  ref?: React.Ref<HTMLElement>;
}

/**
 * Rich-text answer. Script-capable markup is stripped as the value leaves the
 * editor; server routes must still run `sanitizeHtml()` before storing it.
 */
export function RichTextInput({
  title,
  description,
  className,
  isRequired = false,
  errorMessage,
  value = "",
  placeholder = "Start typing…",
  onChange,
  onBlur,
  maxChars,
  disabled,
  name,
  id,
  schema,
  ref,
}: RichTextInputProps) {
  const ids = useFieldIds(id, name);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const { error, handleBlur, revalidate } = useFieldValidation({ value, schema, externalError: errorMessage, onBlur });

  // Hand the editable surface (not the wrapper) to the parent so
  // react-hook-form can focus it when this field is the first invalid one.
  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    const editable = wrapper?.querySelector<HTMLElement>('[contenteditable="true"]') ?? wrapper;
    assignRef(ref, editable ?? null);
    if (editable && editable !== wrapper) {
      editable.id = ids.controlId;
      editable.setAttribute("role", "textbox");
      editable.setAttribute("aria-multiline", "true");
      editable.setAttribute("aria-labelledby", ids.labelId);
      const describedBy = [description ? ids.descriptionId : null, error ? ids.errorId : null].filter(Boolean).join(" ");
      if (describedBy) editable.setAttribute("aria-describedby", describedBy);
      else editable.removeAttribute("aria-describedby");
      if (error) editable.setAttribute("aria-invalid", "true");
      else editable.removeAttribute("aria-invalid");
      if (isRequired) editable.setAttribute("aria-required", "true");
    }
    return () => assignRef(ref, null);
  }, [ref, ids, description, error, isRequired]);

  const plainLength = maxChars !== undefined ? htmlToPlainText(value).length : 0;

  return (
    <FieldShell
      ids={ids}
      title={title}
      description={description}
      isRequired={isRequired}
      error={error}
      className={className}
      variant="group"
      disabled={disabled}
      labelAside={
        maxChars !== undefined ? (
          <span className={cn("text-xs tabular-nums text-muted-foreground", plainLength > maxChars && "font-medium text-destructive-text")}>
            {plainLength}/{maxChars}
            <span className="sr-only"> characters used</span>
          </span>
        ) : undefined
      }
    >
      <div
        ref={wrapperRef}
        onBlur={(e) => {
          // Only count as blur when focus leaves the whole editor (toolbar included).
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) handleBlur();
        }}
        className={cn(disabled && "pointer-events-none")}
        aria-disabled={disabled || undefined}
      >
        <RichTextEditor
          value={value}
          onChange={(html) => {
            const next = stripUnsafeHtml(html);
            onChange?.(next);
            revalidate(next);
          }}
          placeholder={placeholder}
          className={error ? "border-destructive" : undefined}
        />
      </div>
    </FieldShell>
  );
}
