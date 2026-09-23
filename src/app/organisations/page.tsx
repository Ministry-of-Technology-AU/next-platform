"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Megaphone,
  UserCog,
  FileUser,
  CalendarSearch,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    title: "Inductions",
    description:
      "Run multi-stage recruitment cycles. Track applicants through form rounds and interviews. Dispatch decisions in real-time.",
    icon: FileUser,
    href: "/organisations/inductions",
    iconClass: "text-primary dark:text-primary-bright",
    gradientFrom: "from-primary/8 dark:from-primary/15",
    badge: "New",
  },
  {
    title: "Advertisements",
    description:
      "Publish banners on the student platform home feed. Promote events, fests, and recruitment drives to the entire campus.",
    icon: Megaphone,
    href: "/organisations/ads",
    iconClass: "text-amber-600 dark:text-amber-400",
    gradientFrom: "from-amber-500/8 dark:from-amber-500/15",
    badge: null,
  },
  {
    title: "Organisation Profile",
    description:
      "Own your public listing in the Organisations Catalogue. Update your logo, description, social links, and induction status.",
    icon: UserCog,
    href: "/organisations/profile",
    iconClass: "text-emerald-700 dark:text-emerald-400",
    gradientFrom: "from-emerald-500/8 dark:from-emerald-500/15",
    badge: null,
  },
  {
    title: "When2meet",
    description:
      "Coordinate interview panels and team schedules without back-and-forth. Find overlapping windows with interactive heatmaps.",
    icon: CalendarSearch,
    href: "/platform/when2meet",
    iconClass: "text-blue dark:text-blue-light",
    gradientFrom: "from-blue-500/8 dark:from-blue-500/15",
    badge: null,
  },
];

export default function OrganisationsPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">

      {/* ── Hero ── */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-left">
          Techmin presents
        </p>

        <div className="space-y-1 text-left">
          <p className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] text-foreground">
            Platform,
          </p>
          <p
            className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1]"
            style={{
              background: "linear-gradient(135deg, #C1121F 0%, #e05a1a 55%, #d97706 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            for orgs.
          </p>
        </div>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-left max-w-xl">
          The unified workspace for Ashoka&apos;s clubs, societies, and collectives.
          Recruit, broadcast, and own your campus presence - all in one place.
        </p>
      </div>

      {/* ── Feature Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.title} href={feature.href} className="group block h-full">
              <Card
                className={`
                  h-full border border-border/80 transition-all duration-300
                  hover:shadow-xl hover:-translate-y-1 hover:border-border
                  bg-gradient-to-br ${feature.gradientFrom} to-transparent
                `}
              >
                <CardContent className="p-6 flex flex-col gap-4">
                  {/* Top row: icon + title + badge + arrow */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-background/80 dark:bg-background/40 border border-border/60 shadow-sm shrink-0">
                        <Icon className={`h-5 w-5 ${feature.iconClass}`} />
                      </div>
                      <span className="font-bold text-base text-foreground group-hover:text-primary dark:group-hover:text-primary-bright transition-colors truncate">
                        {feature.title}
                      </span>
                      {feature.badge && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/15 text-primary dark:text-primary-bright shrink-0">
                          {feature.badge}
                        </span>
                      )}
                    </div>
                    <ArrowRight
                      className="h-4 w-4 text-muted-foreground group-hover:text-primary dark:group-hover:text-primary-bright
                        transition-all duration-200 group-hover:translate-x-1 shrink-0"
                    />
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* ── Footer link ── */}
      <div className="pt-2 border-t border-border/50 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        Looking for the student-facing dashboard?
        <Button variant="link" asChild className="p-0 h-auto text-sm font-medium">
          <Link href="/platform" className="flex items-center gap-1">
            Go to Platform <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

    </div>
  );
}