"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import MultipleSelector, { type MultipleSelectorRef, type Option } from "@/components/ui/multi-select";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { FieldError, FieldShell, RequiredMark, controlAria, useFieldIds } from "./field-shell";
import type { DropdownOption, FieldBaseProps } from "./types";
import { useFieldValidation } from "./use-field-validation";
import { assignRef, optionValue, useForwardedRef } from "./utils";

/** Fires `onLeave` when focus moves outside `container` entirely. */
function onFocusLeave(onLeave: () => void) {
  return (e: React.FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onLeave();
  };
}

// ---------------------------------------------------------------------------
// Multi select — checkbox list
// ---------------------------------------------------------------------------

export interface MultiSelectCheckboxProps extends FieldBaseProps {
  items: DropdownOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  /** Lay options out in two columns from `sm` up. Good for 6+ short options. */
  columns?: 1 | 2;
  ref?: React.Ref<HTMLElement>;
}

export function MultiSelectCheckbox({
  title,
  description,
  className,
  isRequired = false,
  errorMessage,
  items,
  value = [],
  onChange,
  onBlur,
  columns = 1,
  disabled,
  name,
  id,
  schema,
  ref,
}: MultiSelectCheckboxProps) {
  const ids = useFieldIds(id, name);
  const forwardRef = useForwardedRef<HTMLButtonElement>(ref);
  const { error, handleBlur, revalidate } = useFieldValidation({ value, schema, externalError: errorMessage, onBlur });

  const toggle = (itemValue: string, checked: boolean) => {
    const next = checked ? [...value.filter((v) => v !== itemValue), itemValue] : value.filter((v) => v !== itemValue);
    // Keep the order of `items` so the output is stable regardless of click order.
    const order = items.map((i) => optionValue(i.value));
    next.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    onChange?.(next);
    revalidate(next);
    void haptic.tap();
  };

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
        value.length > 0 ? (
          <span className="text-xs tabular-nums text-muted-foreground">{value.length} selected</span>
        ) : undefined
      }
    >
      <ul
        onBlur={onFocusLeave(handleBlur)}
        aria-describedby={error ? ids.errorId : undefined}
        className={cn("grid gap-x-4", columns === 2 && "sm:grid-cols-2")}
      >
        {items.map((item, index) => {
          const itemValue = optionValue(item.value);
          const itemId = index === 0 ? ids.controlId : `${ids.controlId}-${index}`;
          const checked = value.includes(itemValue);
          const itemDisabled = disabled || item.disable;
          return (
            <li key={itemValue}>
              <label
                htmlFor={itemId}
                className={cn(
                  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md px-1 py-2.5 transition-colors hover:bg-muted/60 md:min-h-9 md:py-2",
                  itemDisabled && "cursor-not-allowed opacity-60 hover:bg-transparent",
                )}
              >
                <Checkbox
                  ref={index === 0 ? forwardRef : undefined}
                  id={itemId}
                  name={name}
                  value={itemValue}
                  checked={checked}
                  disabled={itemDisabled}
                  aria-invalid={error ? true : undefined}
                  onCheckedChange={(c) => toggle(itemValue, c === true)}
                  className="mt-0.5 size-[18px] rounded-[5px] border-2"
                />
                <span className="grid gap-0.5">
                  <span className="text-sm font-normal leading-snug text-foreground">{item.label}</span>
                  {item.description ? <span className="text-xs text-muted-foreground">{item.description}</span> : null}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </FieldShell>
  );
}

// ---------------------------------------------------------------------------
// Multi select — searchable dropdown
// ---------------------------------------------------------------------------

export interface MultiSelectDropdownProps extends FieldBaseProps {
  placeholder: string;
  items: Option[];
  value?: string[];
  onChange?: (value: string[]) => void;
  /** Cap on selections; extra picks are refused with a message. */
  maxSelected?: number;
  ref?: React.Ref<HTMLElement>;
}

export function MultiSelectDropdown({
  title,
  description,
  placeholder,
  className,
  isRequired = false,
  errorMessage,
  items,
  value = [],
  onChange,
  onBlur,
  maxSelected,
  disabled,
  name,
  id,
  schema,
  ref,
}: MultiSelectDropdownProps) {
  const ids = useFieldIds(id, name);
  // Expose the search input so react-hook-form can focus it.
  const selectorRef = React.useCallback(
    (instance: MultipleSelectorRef | null) => assignRef<HTMLElement>(ref, instance?.input ?? null),
    [ref],
  );
  const { error, handleBlur, revalidate } = useFieldValidation({ value, schema, externalError: errorMessage, onBlur });
  const [limitNotice, setLimitNotice] = React.useState<string | undefined>(undefined);
  const aria = controlAria(ids, { hasDescription: Boolean(description), error, required: isRequired });

  const selected = React.useMemo(() => items.filter((item) => value.includes(item.value)), [items, value]);

  return (
    <FieldShell
      ids={ids}
      title={title}
      description={description}
      isRequired={isRequired}
      error={error ?? limitNotice}
      className={className}
      disabled={disabled}
    >
      <div onBlur={onFocusLeave(handleBlur)}>
        <MultipleSelector
          ref={selectorRef}
          defaultOptions={items}
          options={items}
          placeholder={placeholder}
          value={selected}
          disabled={disabled}
          maxSelected={maxSelected}
          onMaxSelected={(limit) => {
            setLimitNotice(`You can choose up to ${limit}`);
            void haptic.error();
          }}
          onChange={(next) => {
            const values = next.map((item) => item.value);
            setLimitNotice(undefined);
            onChange?.(values);
            revalidate(values);
            void haptic.select();
          }}
          inputProps={{
            id: ids.controlId,
            name,
            ...aria,
          }}
          className={cn("min-h-11 border-border md:min-h-9", error && "border-destructive")}
          emptyIndicator={<p className="py-6 text-center text-sm text-muted-foreground">No options match your search</p>}
        />
      </div>
    </FieldShell>
  );
}

// ---------------------------------------------------------------------------
// Single checkbox
// ---------------------------------------------------------------------------

export interface CheckboxComponentProps extends FieldBaseProps {
  value?: boolean;
  onChange?: (checked: boolean) => void;
  ref?: React.Ref<HTMLElement>;
}

/** Stand-alone yes/no or consent checkbox. The whole row is the hit target. */
export function CheckboxComponent({
  title,
  description,
  value = false,
  onChange,
  onBlur,
  className,
  isRequired = false,
  errorMessage,
  disabled,
  name,
  id,
  schema,
  ref,
}: CheckboxComponentProps) {
  const ids = useFieldIds(id, name);
  const forwardRef = useForwardedRef<HTMLButtonElement>(ref);
  const { error, handleBlur, revalidate } = useFieldValidation({ value, schema, externalError: errorMessage, onBlur });
  const aria = controlAria(ids, { hasDescription: Boolean(description), error, required: isRequired });

  return (
    <div
      data-invalid={error ? true : undefined}
      className={cn(
        "group/field relative space-y-1.5",
        "before:pointer-events-none before:absolute before:-left-2.5 before:top-0.5 before:bottom-0.5 before:w-0.5 before:rounded-full before:bg-transparent before:transition-colors before:duration-200",
        "focus-within:before:bg-primary/70 data-[invalid=true]:before:bg-destructive",
        className,
      )}
    >
      <label
        htmlFor={ids.controlId}
        className={cn("flex min-h-11 cursor-pointer items-start gap-3 py-1 md:min-h-0", disabled && "cursor-not-allowed opacity-70")}
      >
        <Checkbox
          ref={forwardRef}
          id={ids.controlId}
          name={name}
          checked={value}
          disabled={disabled}
          onBlur={handleBlur}
          onCheckedChange={(c) => {
            const next = c === true;
            onChange?.(next);
            revalidate(next);
            void haptic.tap();
          }}
          {...aria}
          className="mt-1 size-[18px] rounded-[5px] border-2"
        />
        <span className="grid gap-1 leading-none">
          <span id={ids.labelId} className="text-base font-medium leading-snug">
            {title} {isRequired && <RequiredMark />}
          </span>
          {description ? (
            <span id={ids.descriptionId} className="text-sm leading-normal text-muted-foreground">
              {description}
            </span>
          ) : null}
        </span>
      </label>
      <FieldError id={ids.errorId} message={error} />
    </div>
  );
}
