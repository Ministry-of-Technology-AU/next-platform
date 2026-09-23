import type {
  SidebarItem,
  SidebarIcon,
  SidebarInterface,
  SidebarCategory,
} from "./types";
import { platformSidebar } from "./platform";
import { organisationSidebar } from "./organisation";
import { adminSidebar } from "./admin";

/**
 * Every interface, keyed by id. Adding an interface means adding its config
 * file and one line here — nothing else.
 */
export const sidebarInterfaces = {
  platform: platformSidebar,
  organisations: organisationSidebar,
  admin: adminSidebar,
} as const;

export type SidebarInterfaceId = keyof typeof sidebarInterfaces;

export function getSidebarInterface(id: SidebarInterfaceId): SidebarInterface {
  return sidebarInterfaces[id];
}

const allInterfaces: SidebarInterface[] = Object.values(sidebarInterfaces);

/** Strips a trailing slash so "/platform/" and "/platform" compare equal. */
function normalizePath(path: string): string {
  if (!path) return "";
  const cleaned = path.trim();
  if (cleaned.length > 1 && cleaned.endsWith("/")) {
    return cleaned.slice(0, -1);
  }
  return cleaned;
}

function isCrossLink(item: SidebarItem): boolean {
  return (
    item.absolute === true ||
    item.href.startsWith("..") ||
    item.href.startsWith("http")
  );
}

/**
 * Resolves an item's href against its interface basePath.
 * Exported so the sidebar and the registry cannot drift apart.
 */
export function resolveHref(item: SidebarItem, basePath: string): string {
  if (isCrossLink(item)) return item.href;

  const base = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  const href =
    item.href === "/" || item.href === ""
      ? ""
      : item.href.startsWith("/")
      ? item.href
      : `/${item.href}`;

  return href === "" ? base : `${base}${href}`;
}

/**
 * Look up a tool across every interface by full or relative pathname.
 * Both "/platform/course-reviews" and "/course-reviews" match Course Reviews.
 *
 * Matching is most-specific-wins, not first-wins, so iteration order cannot
 * decide the answer. A section root (href "/", which resolves to the bare
 * basePath) only ever matches itself — it must not claim its siblings.
 */
export function getToolByHref(href: string): SidebarItem | undefined {
  if (!href) return undefined;
  const target = normalizePath(href);
  if (!target) return undefined;

  let best: { item: SidebarItem; score: number } | undefined;

  const consider = (item: SidebarItem, score: number) => {
    if (!best || score > best.score) {
      best = { item, score };
    }
  };

  for (const iface of allInterfaces) {
    for (const category of iface.categories) {
      for (const item of category.items) {
        const itemHref = normalizePath(item.href);
        const crossLink = isCrossLink(item);
        const fullHref = crossLink
          ? itemHref
          : normalizePath(resolveHref(item, iface.basePath));

        // href "/" resolves to the interface base ("/platform"). Prefix and
        // suffix matching against that would swallow every route under it.
        const isSectionRoot = !crossLink && (item.href === "/" || item.href === "");

        // Exact resolved path — the only match a section root may make.
        // A cross-link (an "absolute" jump into another interface) also stops
        // here: it is a shortcut, not the canonical entry for that route, so
        // it never prefix-matches and never outranks the real item.
        if (target === fullHref) {
          consider(item, crossLink ? 800 : 1000 + fullHref.length);
          continue;
        }
        if (isSectionRoot || crossLink) continue;

        // Exact relative path, e.g. "/course-reviews".
        if (target === itemHref) {
          consider(item, 900 + itemHref.length);
          continue;
        }
        // A subroute of the tool, e.g. "/platform/sports/apl" -> Sports.
        if (fullHref !== "" && fullHref !== "/" && target.startsWith(`${fullHref}/`)) {
          consider(item, 500 + fullHref.length);
          continue;
        }
        // Relative suffix, on a path boundary only.
        if (
          itemHref !== "" &&
          itemHref !== "/" &&
          target.endsWith(itemHref) &&
          target.charAt(target.length - itemHref.length - 1) === "/"
        ) {
          consider(item, 100 + itemHref.length);
        }
      }
    }
  }

  return best?.item;
}

/** The icon component for a route, or undefined if the route is not a registered tool. */
export function getToolIcon(href: string): SidebarIcon | undefined {
  return getToolByHref(href)?.icon;
}

/** Every registered tool across every interface, deduped by href. */
export function getAllTools(): SidebarItem[] {
  const tools: SidebarItem[] = [];
  const seen = new Set<string>();

  for (const iface of allInterfaces) {
    for (const category of iface.categories) {
      for (const item of category.items) {
        if (!seen.has(item.href)) {
          seen.add(item.href);
          tools.push(item);
        }
      }
    }
  }

  return tools;
}

/**
 * Applies the visibility rules for one role + grant set.
 *
 *   1. no `roles` and no `hideFor`  → visible
 *   2. `roles: [...]`               → only those roles
 *   3. `hideFor: [...]`             → every role except those
 *   4. `requiresAccess`             → additionally needs at least one grant
 *
 * A role whose definition sets `seesUnrestricted: false` only sees items it is
 * explicitly named on by rule 2.
 */
function isVisible(
  rule: { roles?: string[]; hideFor?: string[]; requiresAccess?: string | string[] },
  iface: SidebarInterface,
  role: string | undefined,
  access: string[]
): boolean {
  if (rule.roles && rule.roles.length > 0) {
    if (!role || !rule.roles.includes(role)) return false;
  } else {
    if (rule.hideFor && role && rule.hideFor.includes(role)) return false;
    if (role && iface.roles[role]?.seesUnrestricted === false) return false;
  }

  if (rule.requiresAccess) {
    const required = Array.isArray(rule.requiresAccess)
      ? rule.requiresAccess
      : [rule.requiresAccess];
    if (!required.some((grant) => access.includes(grant))) return false;
  }

  return true;
}

/**
 * Resolves the categories one role actually sees. Pure and synchronous —
 * call it once where the interface is mounted and hold the result.
 * Empty categories are dropped.
 */
export function resolveSidebar(
  iface: SidebarInterface,
  role: string | undefined,
  access: string[] = []
): SidebarCategory[] {
  return iface.categories
    .filter((category) => isVisible(category, iface, role, access))
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => isVisible(item, iface, role, access)),
    }))
    .filter((category) => category.items.length > 0);
}
