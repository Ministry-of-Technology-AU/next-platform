import {
  FileStack,
  GalleryHorizontalEnd,
  Library,
  UserCog,
} from "lucide-react";
import type { SidebarInterface } from "./types";

/**
 * Roles inside the admin portal. Entry is gated in src/app/admin/layout.tsx to
 * ADMIN_EMAILS or the ashoka_admin role/grant, so this is a single-role
 * interface today — add roles here as the portal grows.
 */
const roles = {
  ashoka_admin: {
    label: "Ashoka Admin",
    description: "University staff listed in ADMIN_EMAILS, or holding the ashoka_admin grant.",
  },
} as const;

export const adminSidebar: SidebarInterface = {
  id: "admin",
  basePath: "/admin",
  title: "Admin Portal",
  roles,
  categories: [
    {
      id: "admin",
      title: "Administration",
      items: [{ title: "Organisations", icon: FileStack, href: "/organisations" }],
    },
    {
      id: "portals",
      title: "Portals",
      items: [
        {
          title: "Student Platform",
          icon: GalleryHorizontalEnd,
          href: "/platform",
          absolute: true,
        },
        {
          title: "Organisations Portal",
          icon: Library,
          href: "/organisations",
          absolute: true,
          requiresAccess: "organization",
        },
        { title: "My Profile", icon: UserCog, href: "/profile", absolute: true },
      ],
    },
  ],
};
