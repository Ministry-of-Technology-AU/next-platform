import {
  Home,
  MailPlus,
  Puzzle,
  BadgeInfo,
  ClipboardPenLine,
  CalendarSync,
  Award,
  Route,
  CalendarDays,
  GalleryHorizontalEnd,
  FileUser,
  CalendarSearch,
  WifiPen,
  Car,
  Users,
  ShoppingBag,
  Trophy,
  Library,
  MapPinned,
  UserCog,
} from "lucide-react";
import { TofuIcon } from "./tofu-icon";
import type { SidebarInterface } from "./types";

/**
 * Roles that exist inside the student platform interface.
 *
 * Assignment happens in `src/lib/authz/roles.ts`. This file only
 * decides what each role sees once it has been assigned.
 *
 * Visibility rules, in order:
 *   1. no `roles` and no `hideFor`  → every role sees it
 *   2. `roles: [...]`               → only those roles
 *   3. `hideFor: [...]`             → every role except those
 *   4. `requiresAccess`             → additionally needs that grant
 */
const roles = {
  superadmin: {
    label: "Super Admin",
    description: "Listed in SUPERADMIN_EMAILS. Sees every tool.",
  },
  student: {
    label: "Student",
    description: "@ashoka.edu.in address with an underscore suffix (_ug, _ugt, _asp, _yif, _phd, …). Programme is in session.user.batch.",
  },
  ysp: {
    label: "YSP Participant",
    description: "Address carries the _ysp suffix. Assigned in src/lib/authz/roles.ts.",
  },
  rep: {
    label: "Department Representative",
    description: "Email is in the department-reps collection in Strapi. Also carries the rep_dashboard grant.",
  },
  hor_member: {
    label: "House of Representatives",
    description: "Listed in HOR_MEMBERS.",
  },
  sport_poc: {
    label: "Sports Point of Contact",
    description: "Runs at least one league (APL, ABA, RSL). Assigned in src/lib/authz/roles.ts.",
  },
  beta_tester: {
    label: "Beta Tester",
    description: "Listed in BETA_TESTERS. Carries the beta_features grant.",
  },
  organization: {
    label: "Organisation Account",
    description: "Shared club/society accounts. Carries the organization grant.",
  },
  ashoka_admin: {
    label: "Ashoka Admin",
    description:
      "University staff. Sees the general platform but not student-personal tools — " +
      "the `hideFor` entries below must stay in sync with ASHOKA_ADMIN_BLOCKED_ROUTES in src/middleware.ts.",
  },
  user: {
    label: "General User",
    description: "Signed in but outside every other bucket. Access grant is ['none'].",
  },
} as const;

export const platformSidebar: SidebarInterface = {
  id: "platform",
  basePath: "/platform",
  title: "Platform",
  roles,
  categories: [
    {
      id: "home",
      title: "Home",
      items: [
        { title: "Dashboard", icon: Home, href: "/" },
        {
          title: "Organisations",
          icon: Library,
          absolute: true,
          href: "/organisations",
          roles: ["organization", "ashoka_admin", "superadmin"],
          requiresAccess: "organization",
        },
        {
          title: "SG Compose",
          icon: MailPlus,
          href: "/sg-compose/outbox",
          hideFor: ["ashoka_admin"],
        },
        { title: "Games and Puzzles", icon: Puzzle, href: "/games" },
        { title: "Request for Information", icon: BadgeInfo, href: "/sg-rti" },
        { title: "Tofu", icon: TofuIcon, href: "/tofu", isComingSoon: true },
      ],
    },
    {
      id: "academics",
      title: "Academics",
      items: [
        {
          title: "Course Reviews",
          icon: ClipboardPenLine,
          href: "/course-reviews",
          hideFor: ["ashoka_admin"],
        },
        { title: "Semester Planner", icon: CalendarSync, href: "/semester-planner" },
        { title: "CGPA Planner", icon: Award, href: "/cgpa-planner" },
        { title: "Trajectory Planner", icon: Route, href: "/trajectory-planner" },
      ],
    },
    {
      id: "cultural-life",
      title: "Cultural Life",
      items: [
        { title: "Events Calendar", icon: CalendarDays, href: "/events-calendar" },
        {
          title: "Organisations Catalogue",
          icon: GalleryHorizontalEnd,
          href: "/organisations-catalog",
        },
        { title: "Inductions", icon: FileUser, href: "/inductions" },
        { title: "When2meet", icon: CalendarSearch, href: "/when2meet" },
      ],
    },
    {
      id: "campus-life",
      title: "Campus Life",
      items: [
        {
          title: "Wifi Tickets",
          icon: WifiPen,
          href: "/wifi-tickets",
          hideFor: ["ashoka_admin"],
        },
        { title: "Pool a Cab", icon: Car, href: "/pool-cab" },
        {
          title: "Pool Subscriptions",
          icon: Users,
          href: "/pool-subscription",
          isComingSoon: true,
        },
        {
          title: "Borrow Assets",
          icon: ShoppingBag,
          href: "/borrow-assets",
          hideFor: ["ashoka_admin"],
          isComingSoon: true,
        },
      ],
    },
    {
      id: "sports",
      title: "Sports",
      items: [{ title: "Sports", icon: Trophy, href: "/sports", isComingSoon: true }],
    },
    {
      id: "my-resources",
      title: "My Resources",
      items: [
        {
          title: "Ashokan Around",
          icon: MapPinned,
          href: "/ashokan-around",
          hideFor: ["ashoka_admin"],
        },
        { title: "My Profile", icon: UserCog, href: "/profile" },
      ],
    },
  ],
};
