import {
  Home,
  Megaphone,
  FileUser,
  CalendarSearch,
  UserCog,
  ArrowDownRight,
} from "lucide-react";
import type { SidebarInterface } from "./types";

/**
 * Roles inside the organisations interface. Reaching this interface at all
 * requires the `organization` access grant (see ROUTE_ACCESS in src/middleware.ts),
 * so every role listed here already has it.
 */
const roles = {
  organization: {
    label: "Organisation Account",
    description: "The shared club/society account that owns this workspace.",
  },
  ashoka_admin: {
    label: "Ashoka Admin",
    description: "University staff, who also hold the organization grant.",
  },
} as const;

export const organisationSidebar: SidebarInterface = {
  id: "organisations",
  basePath: "/organisations",
  title: "Organisations",
  roles,
  categories: [
    {
      id: "management",
      title: "Management",
      items: [
        { title: "Dashboard", icon: Home, href: "/" },
        { title: "Advertisements", icon: Megaphone, href: "/ads" },
        { title: "Inductions", icon: FileUser, href: "/inductions" },
        {
          title: "When2meet",
          icon: CalendarSearch,
          href: "/platform/when2meet",
        },
      ],
    },
    {
      id: "settings",
      title: "Settings",
      items: [
        { title: "Organisation Profile", icon: UserCog, href: "/profile" },
        {
          title: "Go to Platform",
          icon: ArrowDownRight,
          href: "../platform",
          absolute: true,
        },
      ],
    },
  ],
};
