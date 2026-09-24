"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useFormContext, type FieldValues } from "react-hook-form";
import { Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMac } from "@/hooks/useIsMac";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { useSubmitInterceptor } from "./form-root";

// ---------------------------------------------------------------------------
// Submit button
// ---------------------------------------------------------------------------

export interface SubmitButtonProps {
  text?: string;
  /** Shown while submitting. Default "Submitting…". */
  loadingText?: string;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
  /** Why the button is disabled — shown as a tooltip, since touch has no hover-only hints. */
  disabledReason?: string;
  onClick?: () => void;
  description?: string;
}

function useSafeFormContext() {
  // useFormContext returns null outside a provider despite its type.
  return useFormContext() as ReturnType<typeof useFormContext> | null;
}

/**
 * Primary submit. Inside `<Form>` it follows the form's pending state and shows
 * the ⌘↵ / Ctrl+Enter shortcut in its tooltip.
 */
export function SubmitButton({
  text = "Submit",
  loadingText = "Submitting…",
  className,
  isLoading = false,
  disabled = false,
  disabledReason,
  onClick,
  description,
}: SubmitButtonProps) {
  const form = useSafeFormContext();
  const isMac = useIsMac();
  const descriptionId = React.useId();
  const pending = isLoading || Boolean(form?.formState.isSubmitting);
  const shortcut = form ? (isMac ? "⌘↵" : "Ctrl+Enter") : null;

  const button = (
    <Button
      type="submit"
      variant="animated"
      aria-busy={pending || undefined}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        "h-11 w-full rounded-md bg-primary px-4 py-2 text-base text-primary-foreground hover:bg-primary/90 md:h-10",
        className,
      )}
      disabled={disabled || pending}
      onClick={() => {
        // Inside <Form> the result haptic (success / error) is the feedback.
        if (!form) void haptic.press();
        onClick?.();
      }}
    >
      {pending ? (
        <>
          <Spinner className="size-4" aria-hidden="true" />
          {loadingText}
        </>
      ) : (
        text
      )}
    </Button>
  );

  const tooltip = disabled && disabledReason ? disabledReason : !pending && shortcut ? `${text} · ${shortcut}` : null;

  return (
    <div className="space-y-2">
      {description ? (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            {/* Disabled buttons don't fire pointer events; the wrapper keeps the tooltip reachable. */}
            <span className="block" tabIndex={disabled ? 0 : undefined}>
              {button}
            </span>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2">
            {disabled && disabledReason ? (
              disabledReason
            ) : (
              <>
                {text}
                <kbd className="rounded border border-border px-1 font-sans text-[11px]">{shortcut}</kbd>
              </>
            )}
          </TooltipContent>
        </Tooltip>
      ) : (
        button
      )}
      {disabled && disabledReason ? <p className="sr-only">{disabledReason}</p> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Containers
// ---------------------------------------------------------------------------

export interface FormContainerProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
  description?: string;
}

/** Legacy card-body form wrapper for hand-managed state. Prefer `<Form>` for new work. */
export function FormContainer({ children, onSubmit, className, description }: FormContainerProps) {
  return (
    <CardContent>
      <form onSubmit={onSubmit} className={cn("space-y-4", className)}>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        {children}
      </form>
    </CardContent>
  );
}

export interface FormSectionProps {
  title: string;
  description?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Groups related fields under a real `<fieldset>`/`<legend>` so screen readers announce the group. */
export function FormSection({ title, description, className, children }: FormSectionProps) {
  return (
    <fieldset className={cn("min-w-0 space-y-5 border-0 p-0", className)}>
      <legend className="mb-1 w-full border-b border-border pb-2">
        <span className="block font-heading text-lg font-bold text-foreground">{title}</span>
        {description ? <span className="mt-0.5 block text-sm font-normal text-muted-foreground">{description}</span> : null}
      </legend>
      {children}
    </fieldset>
  );
}

export interface InstructionsFieldProps {
  heading: string;
  subheading?: string;
  body: string | string[];
  className?: string;
  description?: string;
  defaultOpen?: boolean;
}

/** Collapsible instructions block shown above a form. */
export function InstructionsField({ heading, subheading, body, className, description, defaultOpen = false }: InstructionsFieldProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const paragraphs = Array.isArray(body) ? body : [body];

  return (
    <CardHeader className={className}>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      <Collapsible
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          void haptic.tap();
        }}
        className="min-w-0 flex-1 rounded-md border border-border bg-primary-extralight/20 p-3 dark:bg-primary-dark/30"
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex min-h-11 w-full min-w-0 items-center justify-between gap-2 rounded-md px-2 text-left font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <span className="truncate text-lg">{heading}</span>
            <ChevronDown
              aria-hidden="true"
              className={cn("size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none", open && "rotate-180")}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-2 px-2 sm:px-4">
          {subheading ? <h5 className="!text-left font-bold">{subheading}</h5> : null}
          {paragraphs.map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </CardHeader>
  );
}

// ---------------------------------------------------------------------------
// Stepper
// ---------------------------------------------------------------------------

export interface FormStep<TValues extends FieldValues> {
  id: string;
  title: string;
  description?: string;
  /** Fields validated before leaving this step. */
  fields: readonly (keyof TValues & string)[];
  content: React.ReactNode;
}

export interface FormStepperProps<TValues extends FieldValues> {
  steps: readonly FormStep<TValues>[];
  submitText?: string;
  onStepChange?: (index: number) => void;
  className?: string;
}

/**
 * Multi-step form body. Must sit inside `<Form>`. Each step validates only its
 * own fields before moving on; Enter and ⌘↵ mean "Next" until the last step.
 * If a final submit fails on an earlier step's field, it jumps back there.
 */
export function FormStepper<TValues extends FieldValues>({
  steps,
  submitText = "Submit",
  onStepChange,
  className,
}: FormStepperProps<TValues>) {
  const form = useFormContext<TValues>();
  const interceptor = useSubmitInterceptor();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState<1 | -1>(1);
  const [checking, setChecking] = React.useState(false);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const moved = React.useRef(false);

  const step = steps[index];
  const isLast = index === steps.length - 1;

  const goTo = React.useCallback(
    (next: number) => {
      if (next < 0 || next >= steps.length) return;
      setDirection(next > index ? 1 : -1);
      setIndex(next);
      moved.current = true;
      onStepChange?.(next);
      void haptic.select();
    },
    [index, onStepChange, steps.length],
  );

  const next = React.useCallback(async () => {
    if (!step) return;
    setChecking(true);
    const ok = await form.trigger(step.fields as never, { shouldFocus: true });
    setChecking(false);
    if (ok) goTo(index + 1);
    else void haptic.error();
  }, [form, goTo, index, step]);

  // Enter / ⌘↵ before the last step advances instead of submitting.
  React.useEffect(() => {
    if (!interceptor) return;
    interceptor.current = () => {
      if (isLast) return false;
      void next();
      return true;
    };
    return () => {
      interceptor.current = null;
    };
  }, [interceptor, isLast, next]);

  // After a failed final submit, jump to the first step holding an error.
  const { submitCount, errors } = form.formState;
  React.useEffect(() => {
    if (submitCount === 0) return;
    const firstBad = steps.findIndex((s) => s.fields.some((f) => f in errors));
    if (firstBad !== -1 && firstBad !== index) goTo(firstBad);
    // Only react to a new submit attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitCount]);

  if (!step) return null;

  return (
    <div className={cn("space-y-6", className)}>
      <nav aria-label="Form progress">
        {/* Mobile: compact counter + bar. Desktop: full step list. */}
        <div className="space-y-2 sm:hidden">
          <p className="text-sm text-muted-foreground">
            Step {index + 1} of {steps.length}
          </p>
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full origin-left rounded-full bg-primary transition-transform duration-300 motion-reduce:transition-none"
              style={{ transform: `scaleX(${(index + 1) / steps.length})` }}
            />
          </div>
        </div>
        <ol className="hidden items-center gap-2 sm:flex">
          {steps.map((s, i) => {
            const done = i < index;
            const current = i === index;
            return (
              <li key={s.id} className="flex min-w-0 flex-1 items-center gap-2">
                <button
                  type="button"
                  disabled={!done}
                  onClick={() => goTo(i)}
                  aria-current={current ? "step" : undefined}
                  aria-label={`${s.title}${done ? " (completed, go back)" : current ? " (current step)" : ""}`}
                  className={cn(
                    "flex min-w-0 items-center gap-2 rounded-md py-1 pr-2 text-left text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    done ? "cursor-pointer text-foreground hover:text-primary" : "cursor-default",
                    current ? "font-semibold text-foreground" : !done && "text-muted-foreground",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs tabular-nums transition-colors",
                      done && "border-primary bg-primary text-primary-foreground",
                      current && "border-primary text-primary dark:text-primary-extralight",
                      !done && !current && "border-border",
                    )}
                  >
                    {done ? <Check className="size-3.5" /> : i + 1}
                  </span>
                  <span className="truncate">{s.title}</span>
                </button>
                {i < steps.length - 1 ? <span aria-hidden="true" className="h-px flex-1 bg-border" /> : null}
              </li>
            );
          })}
        </ol>
      </nav>

      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.section
          key={step.id}
          aria-labelledby={`step-${step.id}-title`}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 * direction }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -16 * direction, transition: { duration: 0.14 } }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          // Once the new step is in place, move focus to its heading so screen
          // readers announce it and Tab continues from the top of the step.
          onAnimationComplete={(definition) => {
            // Also fires for the outgoing step's exit (opacity 0); ignore that one.
            const entered = typeof definition === "object" && definition !== null && "opacity" in definition && definition.opacity === 1;
            if (entered && moved.current) {
              moved.current = false;
              headingRef.current?.focus();
            }
          }}
          className="space-y-5"
        >
          <header className="space-y-1">
            <h3
              ref={headingRef}
              id={`step-${step.id}-title`}
              tabIndex={-1}
              className="!text-left !text-xl text-balance font-heading font-bold outline-none"
            >
              {step.title}
            </h3>
            {step.description ? <p className="text-sm text-muted-foreground">{step.description}</p> : null}
          </header>
          {step.content}
        </motion.section>
      </AnimatePresence>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className={cn("h-11 md:h-10", index === 0 && "invisible")}
        >
          <ChevronLeft aria-hidden="true" />
          Back
        </Button>
        {isLast ? (
          <div className="sm:w-48">
            <SubmitButton text={submitText} />
          </div>
        ) : (
          // type="submit" so Enter in any field reaches the form's submit
          // interceptor, which runs next() instead of submitting.
          <Button
            type="submit"
            disabled={checking}
            aria-busy={checking || undefined}
            className="h-11 sm:w-48 md:h-10"
          >
            {checking ? <Spinner className="size-4" aria-hidden="true" /> : null}
            Next
            <ChevronRight aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
