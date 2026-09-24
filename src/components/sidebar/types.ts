import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * An icon is always a real component reference, imported directly in the
 * interface config that uses it. There is no icon name registry and no string
 * form — declare the import once, use it once, in the same file.
 */
export type SidebarIcon = LucideIcon | ComponentType<{ className?: string }>;

/**
 * A role as it exists *within one interface*. The same role id can appear in
 * more than one interface and grant a different tool set in each.
 */
export interface SidebarRole {
  /** Human label, used in docs and admin surfaces. */
  label: string;
  /** Optional note on who gets this role and how it is assigned in `src/auth.ts`. */
  description?: string;
  /**
   * Items that do not name any roles are visible to every role whose
   * `seesUnrestricted` is not explicitly false. Set false for narrow roles
   * (e.g. ashoka_admin) that should only ever see what they are named on.
   */
  seesUnrestricted?: boolean;
}

export type SidebarRoleMap = Record<string, SidebarRole>;

export interface SidebarItem {
  title: string;
  icon: SidebarIcon;
  href: string;
  isNew?: boolean;
  /**
   * When true or a custom label string (e.g. "Coming Soon", "WIP"), renders a coming soon
   * badge and indicator dot, and disables navigation with feedback. Defaults to "Soon" when true.
   */
  isComingSoon?: boolean | string;
  /**
   * Resolve `href` directly instead of prefixing the interface `basePath`.
   * Also implied when `href` starts with `../`, `/` or `http`.
   */
  absolute?: boolean;
  /**
   * Allowlist. Only these roles see the item. Omit to mean "every role in this
   * interface that sees unrestricted items".
   */
  roles?: string[];
  /** Denylist. Every role except these. Use when one role is the exception. */
  hideFor?: string[];
  /**
   * Access grant(s) from `session.user.access`, checked in addition to roles.
   * Grants are orthogonal to roles — see `src/auth.ts`.
   */
  requiresAccess?: string | string[];
}

export interface SidebarCategory {
  id: string;
  title: string;
  /** Category-level allowlist. Applied before item rules. */
  roles?: string[];
  /** Category-level denylist. Applied before item rules. */
  hideFor?: string[];
  items: SidebarItem[];
}

/**
 * Everything one interface needs, in one file: where it is mounted, what it is
 * called, which roles exist inside it, and which tools each role sees.
 */
export interface SidebarInterface {
  /** Stable id. Also the key in `sidebarInterfaces`. */
  id: string;
  /** Route prefix every non-absolute `href` is resolved against. */
  basePath: string;
  /** Shown in the sidebar header. */
  title: string;
  roles: SidebarRoleMap;
  categories: SidebarCategory[];
}
