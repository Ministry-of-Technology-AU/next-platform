"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cleanDecimal, cleanEmail, cleanText } from "@/lib/forms/fields";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { FieldShell, controlAria, useFieldIds } from "./field-shell";
import type { FieldBaseProps } from "./types";
import { useFieldValidation } from "./use-field-validation";
import { useForwardedRef } from "./utils";

export type TextInputType = "text" | "email" | "password" | "number" | "datetime-local" | "url" | "search";

export interface TextInputProps extends FieldBaseProps {
  placeholder?: string;
  /** Render a growing textarea instead of a single-line input. */
  isParagraph?: boolean;
  /** Legacy alias for `disabled`. */
  isDisabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  type?: TextInputType;
  /** Shows a live character counter; the schema enforces the limit. */
  maxLength?: number;
  autoComplete?: React.InputHTMLAttributes<HTMLInputElement>["autoComplete"];
  /**
   * Tidy the value when the field loses focus: trim and collapse whitespace
   * (lower-case for email). Defaults to true; passwords are never touched.
   */
  cleanOnBlur?: boolean;
  /** Number inputs only. */
  min?: number;
  max?: number;
  step?: number;
  /** Textarea only: minimum visible rows. */
  rows?: number;
  ref?: React.Ref<HTMLElement>;
}

function clamp(n: number, min?: number, max?: number) {
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
}

/** Round away float noise from repeated stepping (0.1 + 0.2). */
function roundToStep(n: number, step: number) {
  const decimals = (String(step).split(".")[1] ?? "").length;
  return Number(n.toFixed(decimals));
}

export function TextInput({
  title,
  description,
  placeholder,
  className,
  isRequired = false,
  errorMessage,
  isParagraph = false,
  isDisabled = false,
  disabled,
  value = "",
  onChange,
  onBlur,
  type = "text",
  maxLength,
  autoComplete,
  cleanOnBlur = true,
  min,
  max,
  step = 1,
  rows = 4,
  name,
  id,
  schema,
  ref,
}: TextInputProps) {
  const ids = useFieldIds(id, name);
  const isDisabledFinal = disabled ?? isDisabled;
  const isNumber = type === "number" && !isParagraph;
  const [revealed, setRevealed] = React.useState(false);
  const forwardRef = useForwardedRef<HTMLInputElement | HTMLTextAreaElement>(ref);

  const { error, handleBlur, revalidate } = useFieldValidation({ value, schema, externalError: errorMessage, onBlur });

  const emit = (next: string) => {
    onChange?.(next);
    revalidate(next);
  };

  const clean = (raw: string): string => {
    if (type === "password" || !cleanOnBlur) return raw;
    if (type === "email") return cleanEmail(raw);
    if (isNumber) return cleanDecimal(raw).replace(/^(-?)\.$/, "").replace(/\.$/, "");
    if (type === "datetime-local") return raw;
    return cleanText(raw, { multiline: isParagraph });
  };

  const onFieldBlur = () => {
    const cleaned = clean(value);
    if (cleaned !== value) emit(cleaned);
    handleBlur();
  };

  const stepBy = (direction: 1 | -1, multiplier = 1) => {
    const current = Number(cleanDecimal(value)) || 0;
    const next = roundToStep(clamp(current + direction * step * multiplier, min, max), step);
    emit(String(next));
    void haptic.select();
  };

  const aria = controlAria(ids, { hasDescription: Boolean(description), error, required: isRequired });
  const length = value.length;
  const counter =
    maxLength !== undefined ? (
      <span
        className={cn(
          "shrink-0 text-xs tabular-nums text-muted-foreground",
          length > maxLength && "font-medium text-destructive-text",
        )}
      >
        {length}/{maxLength}
        <span className="sr-only"> characters used</span>
      </span>
    ) : undefined;

  const shared = {
    id: ids.controlId,
    name,
    placeholder,
    disabled: isDisabledFinal,
    onBlur: onFieldBlur,
    ...aria,
  };

  let control: React.ReactNode;

  if (isParagraph) {
    control = (
      <Textarea
        {...shared}
        ref={forwardRef}
        rows={rows}
        value={value}
        onChange={(e) => emit(e.target.value)}
        className={cn(
          "field-sizing-content min-h-[100px] max-h-[60vh] resize-y border-border bg-background text-base font-normal md:text-sm",
          "focus-visible:ring-[3px] focus-visible:ring-ring/50",
          error && "border-destructive",
        )}
      />
    );
  } else if (isNumber) {
    control = (
      <div className="relative flex items-center">
        <Input
          {...shared}
          ref={forwardRef}
          type="text"
          inputMode={step % 1 === 0 && (min === undefined || min >= 0) ? "numeric" : "decimal"}
          autoComplete={autoComplete ?? "off"}
          value={value}
          onChange={(e) => emit(cleanDecimal(e.target.value, { allowNegative: min === undefined || min < 0 }))}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
              stepBy(e.key === "ArrowUp" ? 1 : -1, e.shiftKey ? 10 : 1);
            }
          }}
          className={cn("h-11 pr-10 font-medium tabular-nums md:h-9", error && "border-destructive")}
        />
        {/* Pointer steppers; keyboard users get ArrowUp/ArrowDown (Shift = ×10). Hidden on touch, where the numeric keypad is faster. */}
        <div className="absolute right-1 flex flex-col items-center justify-center border-l border-border pl-1 [@media(pointer:coarse)]:hidden">
          {([1, -1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              tabIndex={-1}
              disabled={isDisabledFinal || (dir === 1 ? max !== undefined && Number(value) >= max : min !== undefined && Number(value) <= min)}
              onClick={() => stepBy(dir)}
              aria-label={dir === 1 ? `Increase ${title || "value"}` : `Decrease ${title || "value"}`}
              className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              {dir === 1 ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>
          ))}
        </div>
      </div>
    );
  } else if (type === "password") {
    control = (
      <div className="relative flex items-center">
        <Input
          {...shared}
          ref={forwardRef}
          type={revealed ? "text" : "password"}
          autoComplete={autoComplete ?? "current-password"}
          autoCapitalize="none"
          spellCheck={false}
          value={value}
          onChange={(e) => emit(e.target.value)}
          className={cn("h-11 pr-12 md:h-9", error && "border-destructive")}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => {
                setRevealed((r) => !r);
                void haptic.tap();
              }}
              aria-pressed={revealed}
              aria-controls={ids.controlId}
              aria-label={revealed ? "Hide password" : "Show password"}
              disabled={isDisabledFinal}
              className="absolute right-0 flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground md:size-9"
            >
              {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </TooltipTrigger>
          <TooltipContent>{revealed ? "Hide password" : "Show password as plain text"}</TooltipContent>
        </Tooltip>
      </div>
    );
  } else {
    const isEmail = type === "email";
    control = (
      <Input
        {...shared}
        ref={forwardRef}
        type={type}
        inputMode={isEmail ? "email" : type === "url" ? "url" : undefined}
        autoComplete={autoComplete ?? (isEmail ? "email" : type === "url" ? "url" : undefined)}
        autoCapitalize={isEmail || type === "url" ? "none" : undefined}
        spellCheck={isEmail || type === "url" ? false : undefined}
        value={value}
        onChange={(e) => emit(e.target.value)}
        className={cn("h-11 bg-background font-normal md:h-9", error && "border-destructive")}
      />
    );
  }

  return (
    <FieldShell
      ids={ids}
      title={title}
      description={description}
      isRequired={isRequired}
      error={error}
      className={className}
      labelAside={counter}
      disabled={isDisabledFinal}
    >
      {control}
    </FieldShell>
  );
}
