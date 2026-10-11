"use client";

import { MotionConfig } from "motion/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ActivePool } from "./_components/active-pool";
import { PoolForm } from "./_components/pool-form";
import type { ActivePoolData } from "./types";

interface PoolSubscriptionClientProps {
  data: ActivePoolData;
  error: string | null;
}

/** Shows the user's open pool if they have one, otherwise the form to start one. */
export function PoolSubscriptionClient({ data, error }: PoolSubscriptionClientProps) {
  return (
    <MotionConfig reducedMotion="user">
      {error ? (
        <Alert className="mb-6">
          <AlertTitle>Couldn&apos;t check for an existing pool</AlertTitle>
          <AlertDescription>
            You can still create one. If you already have an open pool, the form will tell you when you submit.
          </AlertDescription>
        </Alert>
      ) : null}
      {data.pool ? <ActivePool pool={data.pool} matches={data.matches} /> : <PoolForm />}
    </MotionConfig>
  );
}
