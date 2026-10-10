import type { LucideIcon } from "lucide-react";

/** A service someone can pick from the dropdown. `value` is what Strapi stores. */
export interface ServiceOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

export type PoolStatus = "open" | "full" | "canceled";

export interface PoolOwner {
  id: number;
  attributes: {
    username: string;
    email: string;
    phone: string | null;
  };
}

/**
 * A subscription pool, in the shape the pages read. Stored in the shared `pools`
 * collection with `type: "subscription"`; `user` is mapped from `pools.pooler`.
 */
export interface PoolSubscription {
  id: string;
  attributes: {
    /** A known service key from `data.ts`, or the name typed under "Others". */
    service: string;
    numberPeople: number;
    start: string;
    end: string;
    status: PoolStatus;
    createdAt: string;
    updatedAt: string;
    user?: { data: PoolOwner | null };
  };
}

/** Body of POST /api/platform/pool-subscription. Dates are YYYY-MM-DD. */
export interface CreatePoolPayload {
  service: string;
  numberPeople: number;
  start: string;
  end: string;
}

/** Another open pool close to the viewer's, with the reasons it was picked. */
export interface PoolMatch {
  pool: PoolSubscription;
  /** 0 to 1. */
  score: number;
  reasons: string[];
}

/** `data` of GET /api/platform/pool-subscription?scope=mine. */
export interface ActivePoolData {
  pool: PoolSubscription | null;
  /** Empty when there's no pool, or nothing is close enough yet. */
  matches: PoolMatch[];
}

/** Query of GET /api/platform/pool-subscription (list mode). Mirrors the results page URL. */
export interface PoolListQuery {
  page: number;
  /** A key from data.ts; "others" means any typed name. */
  service?: string;
  /** Matches service names and owner usernames. */
  q?: string;
}

/** `data` of GET /api/platform/pool-subscription (list mode). */
export interface PoolListData {
  pools: PoolSubscription[];
  /** The viewer's own open pool, if any, for the banner and the "Your pool" tag. */
  own: PoolSubscription | null;
  page: number;
  pageCount: number;
  total: number;
}
