"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { addMonths } from "date-fns";
import { useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  DatePicker,
  Form,
  FormField,
  SingleSelect,
  SubmitButton,
  TextInput,
  useZodForm,
} from "@/components/form";
import { TourStep } from "@/components/guided-tour";
import {
  CUSTOM_SERVICE_MAX_LENGTH,
  DURATION_OPTIONS,
  INDEFINITE_DURATION,
  OTHER_SERVICE,
  PEOPLE_DEFAULT,
  PEOPLE_MAX,
  PEOPLE_MIN,
  SERVICES,
} from "../data";
import type { CreatePoolPayload, ServiceOption } from "../types";
import { getService, toISODate, todayIST } from "../utils";
import { PeopleStepper } from "./people-stepper";
import { PoolPreview } from "./pool-preview";

const poolSchema = z
  .object({
    service: z.string().min(1, "Pick the subscription you want to share."),
    customService: z
      .string()
      .trim()
      .max(CUSTOM_SERVICE_MAX_LENGTH, `Keep the name under ${CUSTOM_SERVICE_MAX_LENGTH} characters.`),
    numberPeople: z.number().int().min(PEOPLE_MIN).max(PEOPLE_MAX),
    start: z.date().optional(),
    duration: z.string().min(1, "Pick how long the pool runs."),
  })
  .superRefine((v, ctx) => {
    if (v.service === OTHER_SERVICE && !v.customService) {
      ctx.addIssue({ code: "custom", path: ["customService"], message: "Name the subscription you want to share." });
    }
    if (!v.start) {
      ctx.addIssue({ code: "custom", path: ["start"], message: "Pick the day the pool starts." });
    }
    if (!v.duration) {
      ctx.addIssue({ code: "custom", path: ["duration"], message: "Pick how long the pool runs." });
    }
  })
  .transform(
    (v): CreatePoolPayload => {
      let computedEnd: Date | undefined;
      if (v.duration === INDEFINITE_DURATION) {
        computedEnd = new Date(2099, 11, 31);
      } else {
        const months = Math.max(1, Number(v.duration) || 1);
        computedEnd = v.start ? addMonths(v.start, months) : undefined;
      }
      return {
        // "Others" stores the typed name; everything else stores its key from data.ts.
        service: v.service === OTHER_SERVICE ? v.customService : v.service,
        numberPeople: v.numberPeople,
        start: v.start ? toISODate(v.start) : "",
        end: computedEnd ? toISODate(computedEnd) : "",
      };
    },
  );

interface CreatePoolResponse {
  success: boolean;
  error?: string;
}

export function PoolForm() {
  const router = useRouter();
  const today = React.useMemo(() => todayIST(), []);

  const form = useZodForm(poolSchema, {
    defaultValues: { service: "", customService: "", numberPeople: PEOPLE_DEFAULT, duration: "1" },
  });
  const [service, customService, numberPeople, start, duration] = useWatch({
    control: form.control,
    name: ["service", "customService", "numberPeople", "start", "duration"],
  });

  const computedEnd = React.useMemo(() => {
    if (!start || !duration) return undefined;
    if (duration === INDEFINITE_DURATION) {
      return new Date(2099, 11, 31);
    }
    const months = Number(duration);
    return Number.isFinite(months) && months > 0 ? addMonths(start, months) : undefined;
  }, [start, duration]);


  const isOther = service === OTHER_SERVICE;
  const previewService: ServiceOption | null = !service
    ? null
    : isOther
      ? customService.trim()
        ? getService(customService)
        : null
      : getService(service);

  const onSubmit = async (payload: CreatePoolPayload) => {
    const response = await fetch("/api/platform/pool-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await response.json().catch(() => null)) as CreatePoolResponse | null;
    if (!response.ok || !result?.success) {
      // <Form> shows this above the fields and fires the error haptic.
      throw new Error(result?.error ?? "The pool wasn't created. Check your connection and try again.");
    }
    toast.success("Pool created. Here are the closest matches so far.");
    // The page re-renders with the new pool and its matches.
    router.refresh();
  };

  const serviceOptions = React.useMemo(
    () => SERVICES.map(({ value, label, icon }) => ({ value, label, icon })),
    [],
  );

  const durationOptions = React.useMemo(() => [...DURATION_OPTIONS], []);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="rounded-xl border border-border bg-card shadow-lg">
        <Form form={form} onSubmit={onSubmit} className="space-y-0">
          <div className="space-y-6 p-4 sm:p-6">
            <TourStep
              id="pool-service"
              title="Pick a service"
              content="Choose what you want to share. If it isn't listed, pick Others and type its name."
              order={1}
            >
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="service"
                  render={(field) => (
                    <SingleSelect
                      {...field}
                      title="What do you want to share?"
                      placeholder="Pick a subscription"
                      items={serviceOptions}
                      isRequired
                    />
                  )}
                />
                <AnimatePresence initial={false}>
                  {isOther ? (
                    <motion.div
                      key="custom-service"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <FormField
                        control={form.control}
                        name="customService"
                        render={(field) => (
                          <TextInput
                            {...field}
                            title="Which subscription?"
                            placeholder="Notion Plus, GitHub Copilot, Midjourney…"
                            maxLength={CUSTOM_SERVICE_MAX_LENGTH}
                            autoComplete="off"
                            isRequired
                          />
                        )}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </TourStep>

            <div className="grid gap-4 sm:grid-cols-3">
              <TourStep
                id="pool-people"
                title="Set the pool size"
                content="Count everyone who will share it, including you. The preview shows how the cost splits."
                order={2}
              >
                <FormField
                  control={form.control}
                  name="numberPeople"
                  render={(field) => (
                    <PeopleStepper
                      title="No. of people (including you)"
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      errorMessage={field.errorMessage}
                      disabled={field.disabled}
                      min={PEOPLE_MIN}
                      max={PEOPLE_MAX}
                    />
                  )}
                />
              </TourStep>

              <TourStep
                id="pool-dates"
                title="Choose start & duration"
                content="Set when the shared plan starts and how long it runs."
                order={3}
                className="contents sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-4"
              >
                <FormField
                  control={form.control}
                  name="start"
                  render={(field) => (
                    <DatePicker {...field} title="Starts on" placeholder="Pick a start date" fromDate={today} isRequired />
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  render={(field) => (
                    <SingleSelect
                      {...field}
                      title="Duration"
                      placeholder="Select duration"
                      items={durationOptions}
                      isRequired
                    />
                  )}
                />
              </TourStep>
            </div>
          </div>

          {/* Bottom-anchored on phones so the action stays in thumb reach. */}
          <div className="sticky bottom-0 z-10 flex items-center gap-3 rounded-b-xl border-t border-border bg-card/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:px-6 lg:static lg:bg-card lg:py-6 lg:backdrop-blur-none">
            <div className="min-w-0 flex-1 lg:hidden">
              <PoolPreview compact service={previewService} people={numberPeople} start={start} end={computedEnd} />
            </div>
            <TourStep
              id="pool-submit"
              title="Create the pool"
              content="Your pool goes on the list, and you'll see the open pools closest to yours. Shortcut: Ctrl or ⌘ + Enter."
              order={4}
              className="shrink-0 lg:flex-1"
            >
              <SubmitButton text="Create pool" loadingText="Creating…" className="px-5" />
            </TourStep>
          </div>
        </Form>
      </section>

      <aside className="hidden lg:sticky lg:top-6 lg:block">
        <PoolPreview service={previewService} people={numberPeople} start={start} end={computedEnd} />
      </aside>
    </div>
  );
}
