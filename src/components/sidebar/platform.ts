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
import type { SidebarInterface } from "./types";

/**
 * Roles that exist inside the student platform interface.
 *
 * Assignment happens in `src/auth.ts` (the `jwt` callback). This file only
 * decides what each role sees once it has been assigned.
 *
 * Visibility rules, in order:
 *   1. no `roles` and no `hideFor`  → every role sees it
 *   2. `roles: [...]`               → only those roles
 *   3. `hideFor: [...]`             → every role except those
 *   4. `requiresAccess`             → additionally needs that grant
 */
const roles = {
  student: {
    label: "Student",
    description: "@ashoka.edu.in address with a programme suffix (_ug, _asp, _phd, …).",
  },
  rep: {
    label: "Department Representative",
    description: "Listed in REP_EMAILS. Also carries the rep_dashboard grant.",
  },
  hor_member: {
    label: "House of Representatives",
    description: "Listed in HOR_MEMBERS.",
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
          roles: ["organization", "ashoka_admin"],
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
        { title: "Pool Subscriptions", icon: Users, href: "/pool-subscription" },
        {
          title: "Borrow Assets",
          icon: ShoppingBag,
          href: "/borrow-assets",
          hideFor: ["ashoka_admin"],
        },
      ],
    },
    {
      id: "sports",
      title: "Sports",
      items: [{ title: "Sports", icon: Trophy, href: "/sports" }],
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
