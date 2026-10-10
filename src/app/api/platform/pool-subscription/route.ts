import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth";
import { getUserIdByEmail } from "@/lib/userid";
import { withCacheControl } from "@/lib/cache/headers";
import { jsonError, jsonOk, rateLimit } from "@/lib/forms/api-helpers";
import {
  CUSTOM_SERVICE_MAX_LENGTH,
  PEOPLE_MAX,
  PEOPLE_MIN,
  RESULTS_PAGE_SIZE,
  SEARCH_MAX_LENGTH,
} from "@/app/platform/pool-subscription/data";
import type { PoolListData } from "@/app/platform/pool-subscription/types";
import { describeStrapiError } from "@/lib/apis/strapi";
import {
  createPool,
  fetchOwnedPool,
  fetchOwnOpenPool,
  getActivePoolData,
  listOpenPools,
  todayISO,
  updatePoolStatus,
} from "./helper";

export const dynamic = "force-dynamic";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Dates must be YYYY-MM-DD.");

// `service` is free text: a key from the page's data.ts, or a name typed under "Others".
// The form enforces the list; here we only bound it.
const createSchema = z
  .object({
    service: z.string().trim().min(1).max(CUSTOM_SERVICE_MAX_LENGTH),
    numberPeople: z.coerce.number().int().min(PEOPLE_MIN).max(PEOPLE_MAX),
    start: isoDate,
    end: isoDate,
  })
  .refine((v) => v.end > v.start, { message: "The end date has to be after the start date.", path: ["end"] });

const updateSchema = z.object({
  subscriptionId: z.coerce.string().regex(/^\d+$/),
  status: z.enum(["full", "canceled"]),
});

const listSchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(RESULTS_PAGE_SIZE),
  service: z.string().trim().max(CUSTOM_SERVICE_MAX_LENGTH).optional().transform((v) => v || undefined),
  q: z.string().trim().max(SEARCH_MAX_LENGTH).optional().transform((v) => v || undefined),
});

/**
 * The caller's Strapi user id, or a 401 response.
 * Looked up by email in the Strapi we're about to write to (cached), not taken
 * from the session's `uid` claim: that claim is minted at sign-in and can point
 * at a user id this Strapi doesn't have, which fails the `pooler` relation with a 400.
 */
async function requireUid(): Promise<number | NextResponse> {
  const user = await getAuthenticatedUser();
  if (!user) return jsonError("Sign in to continue.", 401);
  const uid = await getUserIdByEmail(user.email);
  if (uid === null) return jsonError("We couldn't find your platform account. Sign out and back in.", 401);
  return uid;
}

// GET ?scope=mine → { pool, matches } for the page.
// GET ?page&limit&service&q → one page of open pools for the results page.
export async function GET(request: NextRequest) {
  try {
    const uid = await requireUid();
    if (uid instanceof NextResponse) return uid;
    const { searchParams } = new URL(request.url);

    if (searchParams.get("scope") === "mine") {
      return withCacheControl(jsonOk(await getActivePoolData(uid)), "private");
    }

    const query = listSchema.safeParse(Object.fromEntries(searchParams));
    if (!query.success) return jsonError("That search or page isn't valid. Clear the filters and try again.", 400);

    const { limit, ...listQuery } = query.data;
    const [list, own] = await Promise.all([listOpenPools(listQuery, limit), fetchOwnOpenPool(uid)]);
    const data: PoolListData = { ...list, own };
    return withCacheControl(jsonOk(data), "private");
  } catch (error) {
    platform.error("GET /api/platform/pool-subscription failed:", describeStrapiError(error));
    return jsonError("Couldn't load pools. Refresh to try again.", 500);
  }
}

// POST → create the caller's pool. One open subscription pool per person.
export async function POST(request: NextRequest) {
  try {
    const uid = await requireUid();
    if (uid instanceof NextResponse) return uid;
    if (!rateLimit(`pool-subscription:create:${uid}`, 5, 60_000)) {
      return jsonError("Too many attempts in a short time. Wait a minute and try again.", 429);
    }

    const body: unknown = await request.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Some details are missing or invalid.", 400);
    }
    if (parsed.data.start < todayISO()) return jsonError("The start date can't be in the past.", 400);

    if (await fetchOwnOpenPool(uid)) {
      return jsonError("You already have an open pool. Mark it full or cancel it before starting another.", 409);
    }

    await createPool(uid, parsed.data);
    return jsonOk({ created: true }, 201);
  } catch (error) {
    platform.error("POST /api/platform/pool-subscription failed:", describeStrapiError(error));
    return jsonError("The pool wasn't created. Try again in a moment.", 500);
  }
}

// PUT → mark the caller's own pool full or cancelled.
export async function PUT(request: NextRequest) {
  try {
    const uid = await requireUid();
    if (uid instanceof NextResponse) return uid;

    const body: unknown = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return jsonError("Pick a pool and a valid status.", 400);

    const { subscriptionId, status } = parsed.data;
    // Ownership is rechecked against Strapi, never taken from the body.
    const pool = await fetchOwnedPool(subscriptionId, uid);
    if (!pool) return jsonError("That pool doesn't exist or isn't yours.", 404);
    if (pool.attributes.status !== "open") return jsonError("This pool is already closed.", 409);

    await updatePoolStatus(subscriptionId, status);
    return jsonOk({ id: subscriptionId, status });
  } catch (error) {
    platform.error("PUT /api/platform/pool-subscription failed:", describeStrapiError(error));
    return jsonError("The change didn't save. Try again.", 500);
  }
}
