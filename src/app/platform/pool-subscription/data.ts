import {
  Bot,
  BotMessageSquare,
  Clapperboard,
  Music,
  Palette,
  PenLine,
  Sparkles,
  Tv,
  Youtube,
} from "lucide-react";
import type { DropdownOption } from "@/components/form/types";
import type { ServiceOption } from "./types";

/** Picking this reveals a text field; the typed name is stored as the service. */
export const OTHER_SERVICE = "others";

/** Longest name accepted for a service typed under "Others". Mirrored in the route. */
export const CUSTOM_SERVICE_MAX_LENGTH = 60;

/** Pools per results page: fills 1, 2 or 3 columns evenly. */
export const RESULTS_PAGE_SIZE = 12;

/** Longest search accepted on the results page. */
export const SEARCH_MAX_LENGTH = 60;

export const PEOPLE_MIN = 2;
export const PEOPLE_MAX = 20;
export const PEOPLE_DEFAULT = 4;

/** `pools.type` for this tool. The collection is shared with pool-a-cab. */
export const POOL_TYPE = "subscription";

/** How far ahead an ongoing pool counts when comparing date ranges. */
export const ONGOING_HORIZON_DAYS = 365;

export const INDEFINITE_DURATION = "indefinite";
export const INDEFINITE_END_DATE = "2099-12-31";

/**
 * Common durations someone can pool a subscription for.
 * Stored as months so end dates compute cleanly from any start day.
 */
export const DURATION_OPTIONS: readonly DropdownOption[] = [
  { value: "1", label: "1 month" },
  { value: "2", label: "2 months" },
  { value: "3", label: "3 months" },
  { value: "4", label: "4 months" },
  { value: "5", label: "5 months" },
  { value: "6", label: "6 months" },
  { value: "7", label: "7 months" },
  { value: "8", label: "8 months" },
  { value: "9", label: "9 months" },
  { value: "10", label: "10 months" },
  { value: "11", label: "11 months" },
  { value: "12", label: "1 year" },
  { value: INDEFINITE_DURATION, label: "Ongoing / Indefinite" },
];


/**
 * Services offered in the dropdown. Add or remove entries here; the form, the
 * active pool card and the results page all read from this list.
 * `value` is stored in Strapi, so don't rename an existing one.
 */
export const SERVICES: readonly ServiceOption[] = [
  { value: "netflix", label: "Netflix", icon: Clapperboard },
  { value: "prime", label: "Amazon Prime Video", icon: Tv },
  { value: "chatgpt", label: "ChatGPT Plus", icon: Bot },
  { value: "claude", label: "Claude", icon: BotMessageSquare },
  { value: "youtube", label: "YouTube Premium", icon: Youtube },
  { value: "spotify", label: "Spotify Premium", icon: Music },
  { value: "canva", label: "Canva Pro", icon: Palette },
  { value: "grammarly", label: "Grammarly Premium", icon: PenLine },
  { value: OTHER_SERVICE, label: "Others", icon: Sparkles },
];

