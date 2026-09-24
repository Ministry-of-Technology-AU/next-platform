"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormProvider,
  useController,
  useForm,
  useFormContext,
  type Control,
  type FieldErrors,
  type FieldPath,
  type FieldPathValue,
  type FieldValues,
  type RefCallBack,
  type Resolver,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form";
import type { z } from "zod";
import { CircleAlert } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { platform } from "@/lib/platform-logger";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// useZodForm
// ---------------------------------------------------------------------------

/**
 * `useForm` wired to a zod schema. Form values are typed as the schema's
 * *input* (what fields hold), and the submit handler receives its *output*
 * (cleaned, parsed, trusted values).
 *
 * Validation timing: a field validates when first blurred, then on every
 * change — no errors while someone is still typing their first answer.
 */
export function useZodForm<TSchema extends z.ZodType<FieldValues, FieldValues>>(
  schema: TSchema,
  options: Omit<UseFormProps<z.input<TSchema>, unknown, z.output<TSchema>>, "resolver"> = {},
): UseFormReturn<z.input<TSchema>, unknown, z.output<TSchema>> {
  return useForm<z.input<TSchema>, unknown, z.output<TSchema>>({
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldFocusError: true,
    ...options,
    // zodResolver can't infer through the generic TSchema; the schema's own
    // input/output types are exactly what the resolver produces.
    resolver: zodResolver(schema) as unknown as Resolver<z.input<TSchema>, unknown, z.output<TSchema>>,
  });
}

// ---------------------------------------------------------------------------
// FormField
// ---------------------------------------------------------------------------

/** Props a field component receives from `<FormField render>`. Spread them. */
export interface BoundField<TValue> {
  name: string;
  value: TValue;
  onChange: (value: TValue) => void;
  onBlur: () => void;
  errorMessage: string | undefined;
  disabled: boolean | undefined;
  ref: RefCallBack;
}

export interface FormFieldProps<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
  TOutput,
> {
  control: Control<TValues, unknown, TOutput>;
  name: TName;
  render: (field: BoundField<FieldPathValue<TValues, TName>>) => React.ReactNode;
}

/**
 * Binds one form value to a field component, fully typed from the schema:
 *
 *   <FormField control={form.control} name="phone"
 *     render={(field) => <PhoneInput title="Phone" isRequired {...field} />} />
 */
export function FormField<TValues extends FieldValues, TName extends FieldPath<TValues>, TOutput>({
  control,
  name,
  render,
}: FormFieldProps<TValues, TName, TOutput>) {
  const { field, fieldState } = useController<TValues, TName, TOutput>({ control, name });
  // Null outside <Form>, despite the type.
  const form = useFormContext<TValues>() as UseFormReturn<TValues> | null;
  const hasError = Boolean(fieldState.error);

  // Once an error is showing, re-check on every change so it clears the moment
  // the value is fixed — even if it came from a step check or submit rather
  // than a blur (react-hook-form's onTouched mode waits for blur there).
  const onChange = React.useCallback(
    (value: FieldPathValue<TValues, TName>) => {
      field.onChange(value);
      if (hasError && form) void form.trigger(name);
    },
    [field, hasError, form, name],
  );

  return (
    <>
      {render({
        name: field.name,
        value: field.value,
        onChange,
        onBlur: field.onBlur,
        errorMessage: fieldState.error?.message,
        disabled: field.disabled,
        ref: field.ref,
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Error summary
// ---------------------------------------------------------------------------

interface FlatError {
  name: string;
  message: string;
}

function flattenErrors(errors: FieldErrors, prefix = ""): FlatError[] {
  const out: FlatError[] = [];
  for (const [key, err] of Object.entries(errors)) {
    if (!err || key === "root") continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof err.message === "string" && err.message) {
      out.push({ name: path, message: err.message });
    } else if (typeof err === "object") {
      out.push(...flattenErrors(err as FieldErrors, path));
    }
  }
  return out;
}

/**
 * Appears after a failed submit with two or more problems: a focusable list
 * of every error linking to its field. One error needs no summary — focus
 * already lands on it.
 */
export function FormErrorSummary({ className }: { className?: string }) {
  const form = useFormContext();
  const ref = React.useRef<HTMLDivElement>(null);
  const { errors, submitCount } = form.formState;
  const list = flattenErrors(errors);
  const rootMessage = errors.root?.message;

  if (submitCount === 0 || (list.length < 2 && !rootMessage)) return null;

  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className={cn(
        "rounded-xl border border-destructive/40 bg-destructive/[0.06] p-4 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-destructive/30",
        className,
      )}
    >
      <p className="flex items-center gap-2 font-semibold text-destructive-text">
        <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
        {rootMessage ?? `Fix ${list.length} problems to continue`}
      </p>
      {list.length > 0 ? (
        <ul className="mt-2 space-y-1 pl-6">
          {list.map((error) => (
            <li key={error.name}>
              <a
                href={`#field-${error.name}`}
                onClick={(e) => {
                  e.preventDefault();
                  form.setFocus(error.name);
                }}
                className="text-foreground underline decoration-destructive/50 underline-offset-4 hover:decoration-destructive"
              >
                {error.message}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------

interface SubmitInterceptor {
  /** Return true to swallow a submit (e.g. a stepper moving to the next step). */
  current: (() => boolean) | null;
}

const SubmitInterceptContext = React.createContext<SubmitInterceptor | null>(null);

/** Lets `FormStepper` turn Enter / ⌘↵ on an early step into "Next". */
export function useSubmitInterceptor() {
  return React.useContext(SubmitInterceptContext);
}

export interface FormProps<TValues extends FieldValues, TOutput>
  extends Omit<React.ComponentProps<"form">, "onSubmit" | "onInvalid" | "children"> {
  form: UseFormReturn<TValues, unknown, TOutput>;
  /**
   * Receives validated, cleaned output. Throw to report a failure: the
   * message is shown at the top of the form and the user can retry.
   */
  onSubmit: (values: TOutput) => void | Promise<void>;
  /** Called when validation fails, after focus moves to the first error. */
  onInvalid?: (errors: FieldErrors<TValues>) => void;
  /** Show the error summary above the fields. Default true. */
  showErrorSummary?: boolean;
  /** ⌘↵ / Ctrl+Enter submits from anywhere in the form. Default true. */
  submitShortcut?: boolean;
  /** Ask before leaving the page with unsaved answers. Default true. */
  warnOnUnsavedChanges?: boolean;
  children: React.ReactNode;
}

/**
 * `<form>` + react-hook-form provider. Handles the submit lifecycle:
 * haptic + summary on invalid, `aria-busy` while pending, success haptic on
 * resolve, and a root error (not a crash) when `onSubmit` throws.
 */
export function Form<TValues extends FieldValues, TOutput>({
  form,
  onSubmit,
  onInvalid,
  showErrorSummary = true,
  submitShortcut = true,
  warnOnUnsavedChanges = true,
  className,
  children,
  onKeyDown,
  ...rest
}: FormProps<TValues, TOutput>) {
  const interceptor = React.useRef<(() => boolean) | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const { isDirty, isSubmitSuccessful } = form.formState;

  // Browser "leave site?" prompt while answers are unsaved.
  React.useEffect(() => {
    if (!warnOnUnsavedChanges || !isDirty || isSubmitSuccessful) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [warnOnUnsavedChanges, isDirty, isSubmitSuccessful]);

  const submit = form.handleSubmit(
    async (values) => {
      form.clearErrors("root");
      try {
        await onSubmit(values);
        void haptic.confirm();
      } catch (err) {
        platform.error("Form submit failed:", err);
        const message = err instanceof Error && err.message ? err.message : "Something went wrong. Your answers are still here — try again.";
        form.setError("root", { type: "submit", message });
        void haptic.error();
      }
    },
    (errors) => {
      void haptic.error();
      onInvalid?.(errors);
    },
  );

  return (
    <SubmitInterceptContext.Provider value={interceptor}>
      <FormProvider {...form}>
        <form
          ref={formRef}
          noValidate
          aria-busy={form.formState.isSubmitting || undefined}
          className={cn("space-y-6", className)}
          onSubmit={(e) => {
            if (interceptor.current?.()) {
              e.preventDefault();
              return;
            }
            void submit(e);
          }}
          onKeyDown={(e) => {
            onKeyDown?.(e);
            // No defaultPrevented check: Radix checkboxes/radios cancel every Enter
            // (per ARIA), but a modified Enter is always a deliberate shortcut.
            if (submitShortcut && e.key === "Enter" && (e.metaKey || e.ctrlKey) && !e.nativeEvent.isComposing) {
              e.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
          {...rest}
        >
          {showErrorSummary ? <FormErrorSummary /> : null}
          {children}
        </form>
      </FormProvider>
    </SubmitInterceptContext.Provider>
  );
}
