"use client";

import * as React from "react";
import { z } from "zod";
import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cleanIndianPhone, field } from "@/lib/forms/fields";
import { cn } from "@/lib/utils";
import { FieldShell, controlAria, useFieldIds } from "./field-shell";
import type { FieldBaseProps } from "./types";
import { useFieldValidation } from "./use-field-validation";
import { useForwardedRef } from "./utils";

export interface PhoneInputProps extends Omit<FieldBaseProps, "title"> {
  title?: string;
  placeholder?: string;
  defaultCountryCode?: string;
  /** Kept for backwards compatibility; the country code is always fixed. */
  countryCodeLocked?: boolean;
  value?: string;
  /** Receives the cleaned national number: digits only, at most 10. */
  onChange?: (value: string) => void;
  /** Kept for backwards compatibility. Validation now runs on blur, then live. */
  validateOnChange?: boolean;
  /** Return an error message, or null when valid. Replaces the built-in Indian mobile check. */
  customValidation?: (value: string) => string | null;
  ref?: React.Ref<HTMLElement>;
}

/**
 * Indian mobile number. Accepts pasted numbers in any common format
 * (`+91 98765-43210`, `09876543210`) and keeps only the 10 national digits.
 * Validates itself with `field.phone()` unless a parent passes `errorMessage`
 * or a custom `schema` / `customValidation`.
 */
export function PhoneInput({
  title = "Contact Number",
  description = "Provide a valid 10-digit mobile number",
  placeholder = "9876543210",
  defaultCountryCode = "+91",
  className,
  isRequired = false,
  errorMessage,
  value = "",
  onChange,
  onBlur,
  customValidation,
  disabled,
  name,
  id,
  schema,
  ref,
}: PhoneInputProps) {
  const ids = useFieldIds(id, name);
  const prefixId = `${ids.controlId}-prefix`;
  const forwardRef = useForwardedRef<HTMLInputElement>(ref);

  const effectiveSchema = React.useMemo<z.ZodType>(() => {
    if (schema) return schema;
    if (customValidation) {
      return z
        .string()
        .optional()
        .superRefine((v, ctx) => {
          const message = customValidation(v ?? "");
          if (message) ctx.addIssue({ code: "custom", message });
        });
    }
    return field.phone({ required: isRequired, label: title });
  }, [schema, customValidation, isRequired, title]);

  const { error, handleBlur, revalidate } = useFieldValidation({
    value,
    schema: effectiveSchema,
    externalError: errorMessage,
    onBlur,
  });

  const aria = controlAria(ids, { hasDescription: Boolean(description), error, required: isRequired });

  return (
    <FieldShell
      ids={ids}
      title={title}
      description={description}
      isRequired={isRequired}
      error={error}
      className={className}
      disabled={disabled}
    >
      <div className="flex">
        <div
          id={prefixId}
          className="flex shrink-0 items-center gap-2 rounded-l-md border border-r-0 border-border bg-muted px-3 text-sm font-medium text-foreground"
        >
          <Phone aria-hidden="true" className="size-4 text-muted-foreground" />
          <span>
            <span className="sr-only">Country code </span>
            {defaultCountryCode}
          </span>
        </div>
        <Input
          ref={forwardRef}
          id={ids.controlId}
          name={name}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const next = cleanIndianPhone(e.target.value);
            onChange?.(next);
            revalidate(next);
          }}
          onBlur={handleBlur}
          {...aria}
          aria-describedby={[prefixId, aria["aria-describedby"]].filter(Boolean).join(" ")}
          className={cn("h-11 rounded-l-none tabular-nums tracking-wide md:h-9", error && "border-destructive")}
        />
      </div>
    </FieldShell>
  );
}
