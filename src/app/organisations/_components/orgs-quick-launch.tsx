"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  FileUser,
  Megaphone,
  UserCog,
  CalendarSearch,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Layers,
  TrendingUp,
  Clock,
  Radio,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const quickLaunchItems = [
  {
    title: "Inductions Engine",
    href: "/organisations/inductions",
    badge: "Flagship",
    badgeVariant: "default" as const,
    badgeColor: "bg-primary/15 text-primary dark:text-primary-bright border-primary/20",
    icon: FileUser,
    iconColor: "text-primary dark:text-primary-bright",
    iconBg: "bg-primary/10 dark:bg-primary/20",
    description:
      "Run complete recruitment cycles with multi-stage rounds. Screen applicants, manage interview slots, and dispatch instant decisions with feedback notes.",
    features: ["Cycle Management", "Stage Pipelines", "Feedback Dispatch"],
    actionText: "Open Inductions",
  },
  {
    title: "Advertisements Hub",
    href: "/organisations/ads",
    badge: "High Reach",
    badgeVariant: "secondary" as const,
    badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: Megaphone,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
    description:
      "Broadcast promotional banners across the student platform home feed. Schedule campaigns for fests, flagship talks, and recruitment calls.",
    features: ["Platform-Wide Banner", "Date Scheduling", "Direct Form Links"],
    actionText: "Manage Ads",
  },
  {
    title: "Organisation Profile",
    href: "/organisations/profile",
    badge: "Public Identity",
    badgeVariant: "outline" as const,
    badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: UserCog,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    description:
      "Maintain your club's presence on the Organisations Catalogue. Update descriptions, logos, social links, and toggle live recruitment open/close badges.",
    features: ["Catalogue Sync", "Recruitment Status", "Brand Assets"],
    actionText: "Edit Profile",
  },
  {
    title: "When2meet & Sync",
    href: "/platform/when2meet",
    badge: "Smart Utility",
    badgeVariant: "outline" as const,
    badgeColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: CalendarSearch,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
    description:
      "Coordinate interview panel availability, core team meetings, and multi-member syncs with interactive heatmap grids built right into the platform.",
    features: ["Heatmap Availability", "Zero Account Friction", "Instant Link Sharing"],
    actionText: "Launch When2meet",
  },
];

export function OrgsQuickLaunch() {
  return (
    <section className="py-8 sm:py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 text-left">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Core Tool Suite</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground text-left">
            Launch your club workspace
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl text-left">
            Direct shortcuts to the primary operational modules designed specifically for Ashoka student organisations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickLaunchItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="h-full"
            >
              <Card className="h-full flex flex-col justify-between border border-border/80 bg-card/60 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:bg-card/90 group overflow-hidden relative">
                {/* Subtle Accent Glow on Hover */}
                <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />

                <CardHeader className="p-6 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`p-3 rounded-2xl ${item.iconBg} ${item.iconColor} transition-transform group-hover:scale-110 duration-200`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors text-left">
                          {item.title}
                        </CardTitle>
                        <span className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-0 flex-1 flex flex-col justify-between space-y-5 text-left">
                  <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </CardDescription>

                  {/* Micro feature pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.features.map((feat) => (
                      <span
                        key={feat}
                        className="text-[11px] font-medium text-muted-foreground bg-muted/60 dark:bg-muted/40 border border-border/50 rounded-md px-2 py-0.5"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button
                    asChild
                    className="w-full mt-auto bg-muted/80 hover:bg-primary hover:text-primary-foreground text-foreground border border-border/80 transition-all duration-200 group/btn"
                  >
                    <Link href={item.href} className="flex items-center justify-center gap-2 font-semibold">
                      <span>{item.actionText}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
