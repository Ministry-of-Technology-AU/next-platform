"use client";

import * as React from "react";
import { format } from "date-fns";
import type { Matcher } from "react-day-picker";
import { Calendar as CalendarIcon, ChevronDown, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { FieldShell, controlAria, useFieldIds } from "./field-shell";
import type { FieldBaseProps } from "./types";
import { useFieldValidation } from "./use-field-validation";
import { useForwardedRef } from "./utils";

interface CalendarRange {
  /** Earliest selectable day. */
  fromDate?: Date;
  /** Latest selectable day. */
  toDate?: Date;
  /** `dropdown` adds month/year selects — use for birthdays and far-off dates. */
  captionLayout?: "label" | "dropdown";
}

function disabledDays({ fromDate, toDate }: CalendarRange): Matcher[] {
  const matchers: Matcher[] = [];
  if (fromDate) matchers.push({ before: fromDate });
  if (toDate) matchers.push({ after: toDate });
  return matchers;
}

/** Open on today, unless today is outside the selectable range. */
function initialMonth({ fromDate, toDate }: CalendarRange): Date {
  const today = new Date();
  if (fromDate && today < fromDate) return fromDate;
  if (toDate && today > toDate) return toDate;
  return today;
}

function parseIso(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

const triggerClass =
  "flex h-11 w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-3 text-left text-base font-normal shadow-xs outline-none transition-[color,box-shadow] md:h-9 md:text-sm " +
  "cursor-pointer hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Calendar surface: a popover on desktop, a bottom drawer on mobile where a
 * popover would be cramped and far from the thumb.
 */
function CalendarSurface({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <>
        {/* Outside a Radix trigger the button needs its own opener. */}
        {React.cloneElement(trigger, { onClick: () => onOpenChange(true) })}
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>{title || "Pick a date"}</DrawerTitle>
              {description ? <DrawerDescription>{description}</DrawerDescription> : null}
            </DrawerHeader>
            <div className="flex justify-center px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">{children}</div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {children}
      </PopoverContent>
    </Popover>
  );
}

function ClearButton({ onClear, label, disabled }: { onClear: () => void; label: string; disabled?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          aria-label={label}
          className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 md:size-9"
        >
          <X className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

// ---------------------------------------------------------------------------
// Date
// ---------------------------------------------------------------------------

export interface DatePickerProps extends FieldBaseProps, CalendarRange {
  placeholder?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  /** Show a clear button when a date is set. Defaults to `!isRequired`. */
  clearable?: boolean;
  ref?: React.Ref<HTMLElement>;
}

export function DatePicker({
  title,
  description,
  placeholder = "Select date",
  className,
  isRequired = false,
  errorMessage,
  value,
  onChange,
  onBlur,
  disabled = false,
  fromDate,
  toDate,
  captionLayout = "label",
  clearable,
  name,
  id,
  schema,
  ref,
}: DatePickerProps) {
  const ids = useFieldIds(id, name);
  const [open, setOpen] = React.useState(false);
  const forwardRef = useForwardedRef<HTMLButtonElement>(ref);
  const committed = React.useRef<Date | undefined | null>(null);
  const { error, blurWith, revalidate } = useFieldValidation({ value, schema, externalError: errorMessage, onBlur });
  const aria = controlAria(ids, { hasDescription: Boolean(description), error, required: isRequired });
  const canClear = (clearable ?? !isRequired) && value !== undefined && !disabled;

  const commit = (next: Date | undefined) => {
    committed.current = next;
    onChange?.(next);
    revalidate(next);
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) committed.current = null;
    else blurWith(committed.current === null ? value : committed.current);
  };

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
      <div className="flex items-center gap-1">
        <CalendarSurface
          open={open}
          onOpenChange={onOpenChange}
          title={title}
          description={description}
          trigger={
            <button
              ref={forwardRef}
              id={ids.controlId}
              type="button"
              disabled={disabled}
              aria-haspopup="dialog"
              aria-expanded={open}
              {...aria}
              aria-labelledby={title ? `${ids.labelId} ${ids.controlId}` : undefined}
              className={cn(triggerClass, !value && "text-muted-foreground", error && "border-destructive")}
            >
              <span className="flex min-w-0 items-center gap-2">
                <CalendarIcon aria-hidden="true" className="size-4 shrink-0 opacity-70" />
                <span className="truncate">{value ? format(value, "PPP") : placeholder}</span>
              </span>
              <ChevronDown aria-hidden="true" className="size-4 shrink-0 opacity-50" />
            </button>
          }
        >
          <Calendar
            mode="single"
            selected={value}
            defaultMonth={value ?? initialMonth({ fromDate, toDate })}
            onSelect={(d) => {
              commit(d);
              void haptic.select();
              onOpenChange(false);
            }}
            disabled={disabled ? true : disabledDays({ fromDate, toDate })}
            startMonth={captionLayout === "dropdown" ? fromDate : undefined}
            endMonth={captionLayout === "dropdown" ? toDate : undefined}
            captionLayout={captionLayout}
            autoFocus
          />
        </CalendarSurface>
        {canClear ? (
          <ClearButton
            label={`Clear ${title ? title.toLowerCase() : "date"}`}
            onClear={() => {
              commit(undefined);
              blurWith(undefined);
              void haptic.tap();
            }}
          />
        ) : null}
      </div>
    </FieldShell>
  );
}

// ---------------------------------------------------------------------------
// Date + time
// ---------------------------------------------------------------------------

export interface DateTimePickerProps extends FieldBaseProps, CalendarRange {
  placeholder?: string;
  /** ISO string. */
  value?: string;
  onChange?: (value: string) => void;
  /** Time used when a day is picked before a time. Default "12:00". */
  defaultTime?: string;
  ref?: React.Ref<HTMLElement>;
}

export function DateTimePicker({
  title,
  description,
  placeholder = "Select date",
  className,
  isRequired = false,
  errorMessage,
  value,
  onChange,
  onBlur,
  disabled = false,
  fromDate,
  toDate,
  captionLayout = "label",
  defaultTime = "12:00",
  name,
  id,
  schema,
  ref,
}: DateTimePickerProps) {
  const ids = useFieldIds(id, name);
  const timeId = `${ids.controlId}-time`;
  const [open, setOpen] = React.useState(false);
  const forwardRef = useForwardedRef<HTMLButtonElement>(ref);
  const committed = React.useRef<string | null>(null);
  const { error, blurWith, revalidate } = useFieldValidation({ value, schema, externalError: errorMessage, onBlur });
  const aria = controlAria(ids, { hasDescription: Boolean(description), error, required: isRequired });

  const dateValue = parseIso(value);
  const timeValue = dateValue ? format(dateValue, "HH:mm") : defaultTime;

  const commit = (next: string) => {
    committed.current = next;
    onChange?.(next);
    revalidate(next);
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) committed.current = null;
    else blurWith(committed.current ?? value);
  };

  const handleDateChange = (day: Date | undefined) => {
    if (!day) {
      commit("");
      return;
    }
    const [hours = 12, minutes = 0] = timeValue.split(":").map(Number);
    const next = new Date(day);
    next.setHours(hours, minutes, 0, 0);
    commit(next.toISOString());
    void haptic.select();
    onOpenChange(false);
  };

  const handleTimeChange = (time: string) => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(time);
    if (!match) return;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) return;
    const base = dateValue ? new Date(dateValue) : new Date();
    base.setHours(hours, minutes, 0, 0);
    commit(base.toISOString());
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
    >
      <div className="flex flex-col gap-2 xs:flex-row">
        <div className="min-w-0 flex-1">
          <CalendarSurface
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description={description}
            trigger={
              <button
                ref={forwardRef}
                id={ids.controlId}
                type="button"
                disabled={disabled}
                aria-haspopup="dialog"
                aria-expanded={open}
                  {...aria}
                aria-label={dateValue ? `Date: ${format(dateValue, "PPPP")}` : `Date: ${placeholder}`}
                className={cn(triggerClass, !dateValue && "text-muted-foreground", error && "border-destructive")}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <CalendarIcon aria-hidden="true" className="size-4 shrink-0 opacity-70" />
                  <span className="truncate">{dateValue ? format(dateValue, "PPP") : placeholder}</span>
                </span>
                <ChevronDown aria-hidden="true" className="size-4 shrink-0 opacity-50" />
              </button>
            }
          >
            <Calendar
              mode="single"
              selected={dateValue}
              defaultMonth={dateValue ?? initialMonth({ fromDate, toDate })}
              onSelect={handleDateChange}
              disabled={disabled ? true : disabledDays({ fromDate, toDate })}
              startMonth={captionLayout === "dropdown" ? fromDate : undefined}
              endMonth={captionLayout === "dropdown" ? toDate : undefined}
              captionLayout={captionLayout}
              autoFocus
            />
          </CalendarSurface>
        </div>
        <label htmlFor={timeId} className="sr-only">
          Time
        </label>
        <Input
          id={timeId}
          type="time"
          value={timeValue}
          disabled={disabled}
          onChange={(e) => handleTimeChange(e.target.value)}
          onBlur={() => blurWith(committed.current ?? value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? ids.errorId : undefined}
          className={cn("h-11 bg-background tabular-nums xs:w-36 md:h-9", error && "border-destructive")}
        />
      </div>
    </FieldShell>
  );
}
