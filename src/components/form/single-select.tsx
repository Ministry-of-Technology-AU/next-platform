"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { FieldShell, controlAria, useFieldIds } from "./field-shell";
import type { DropdownOption, FieldBaseProps } from "./types";
import { useFieldValidation } from "./use-field-validation";
import { optionValue, useForwardedRef } from "./utils";

export interface SingleSelectProps extends FieldBaseProps {
  placeholder: string;
  items: DropdownOption[];
  value?: string | number;
  onChange?: (value: string) => void;
  ref?: React.Ref<HTMLElement>;
}

/**
 * One choice from a list.
 * Desktop: Radix listbox with type-ahead. Mobile: the native `<select>`, which
 * opens the OS picker wheel/sheet — faster to thumb through and fully
 * accessible without extra work.
 */
export function SingleSelect({
  title,
  description,
  placeholder,
  className,
  isRequired = false,
  errorMessage,
  items,
  value = "",
  onChange,
  onBlur,
  disabled,
  name,
  id,
  schema,
  ref,
}: SingleSelectProps) {
  const ids = useFieldIds(id, name);
  const isMobile = useIsMobile();
  const current = optionValue(value);
  const forwardRef = useForwardedRef<HTMLElement>(ref);
  // Radix reserves "" for "no selection".
  const options = React.useMemo(() => items.filter((item) => optionValue(item.value) !== ""), [items]);

  const { error, handleBlur, blurWith, revalidate } = useFieldValidation({
    value: current,
    schema,
    externalError: errorMessage,
    onBlur,
  });
  const committed = React.useRef<string | null>(null);

  const select = (next: string) => {
    committed.current = next;
    onChange?.(next);
    revalidate(next);
    void haptic.select();
  };

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
      {isMobile ? (
        <div className="relative">
          <select
            ref={forwardRef}
            id={ids.controlId}
            name={name}
            value={current}
            disabled={disabled}
            onChange={(e) => select(e.target.value)}
            onBlur={handleBlur}
            {...aria}
            className={cn(
              "h-11 w-full appearance-none rounded-md border border-border bg-background px-3 pr-10 text-base text-foreground shadow-xs outline-none",
              "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
              current === "" && "text-muted-foreground",
              error && "border-destructive",
            )}
          >
            <option value="" disabled={isRequired}>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={optionValue(option.value)} value={optionValue(option.value)} disabled={option.disable}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 opacity-50" />
        </div>
      ) : (
        <Select
          value={current}
          onValueChange={select}
          disabled={disabled}
          name={name}
          onOpenChange={(open) => {
            if (open) {
              committed.current = null;
              return;
            }
            // Treat closing the list as leaving the field. Radix can report the
            // close before `onValueChange`, so wait a tick for the new value to
            // land in the parent (react-hook-form validates its own copy on blur).
            setTimeout(() => blurWith(committed.current ?? current), 0);
          }}
        >
          <SelectTrigger
            ref={forwardRef}
            id={ids.controlId}
            {...aria}
            className={cn(
              "h-11 cursor-pointer border-border text-base md:h-9 md:text-sm",
              "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-0",
              error && "border-destructive",
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-[min(24rem,var(--radix-select-content-available-height))]">
            {options.map((option) => (
              <SelectItem
                key={optionValue(option.value)}
                value={optionValue(option.value)}
                disabled={option.disable}
                className="min-h-9 cursor-pointer"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FieldShell>
  );
}
