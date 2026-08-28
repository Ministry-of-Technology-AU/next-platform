"use client";

import { motion } from "motion/react";
import {
  ShieldCheck,
  BellRing,
  Users,
  TrendingUp,
  FolderGit2,
  Palette,
  Sparkles,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const superpowers = [
  {
    title: "100% Verified Ashoka IDs",
    subtitle: "Built-in Single Sign-On",
    description:
      "Eliminate fake responses and external spam. Every candidate application is authenticated via their official @ashoka.edu.in account, pre-populating student details automatically.",
    icon: ShieldCheck,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
    borderColor: "hover:border-emerald-500/40",
    badge: "Verified Trust",
    colSpan: "lg:col-span-4",
  },
  {
    title: "Instant Student Portal Sync",
    subtitle: "Real-Time Notifications",
    description:
      "When your team updates an applicant from 'Shortlisted' to 'Interview Scheduled' or 'Approved', candidates receive instant alerts on their student platform feed.",
    icon: BellRing,
    iconColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
    borderColor: "hover:border-amber-500/40",
    badge: "Zero Dropped Leads",
    colSpan: "lg:col-span-4",
  },
  {
    title: "Granular Role Delegation",
    subtitle: "Role-Based Panel Access",
    description:
      "Keep cycle management secure. Give department heads and interview panels access to evaluate their specific roles without granting organization master credentials.",
    icon: Users,
    iconColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
    borderColor: "hover:border-blue-500/40",
    badge: "Safe Collaboration",
    colSpan: "lg:col-span-4",
  },
  {
    title: "3,000+ Student Campus Reach",
    subtitle: "Unified Platform Footprint",
    description:
      "Place your club directly where Ashoka students go every day for academics, cab sharing, events, and campus updates. Maximize turnout for fests, talks, and recruitments.",
    icon: TrendingUp,
    iconColor: "text-primary dark:text-primary-bright",
    bgColor: "bg-primary/10 dark:bg-primary/20",
    borderColor: "hover:border-primary/40",
    badge: "Maximum Visibility",
    colSpan: "lg:col-span-6",
  },
  {
    title: "Zero Data Chaos & Lost Sheets",
    subtitle: "Centralized Intelligence",
    description:
      "Never lose an application in tangled Google Forms, disparate Sheets, or unread email chains again. All candidate histories, responses, and evaluation notes live securely in one place.",
    icon: FolderGit2,
    iconColor: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-500/10 dark:bg-purple-500/20",
    borderColor: "hover:border-purple-500/40",
    badge: "All-in-One",
    colSpan: "lg:col-span-6",
  },
];

export function OrgsBentoHighlights() {
  return (
    <section className="py-12 sm:py-16">
      <div className="flex flex-col items-start text-left mb-10">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Why Platform For Orgs</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight text-left">
          Engineered to replace spreadsheets and messy group chats
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground mt-2 max-w-2xl text-left">
          Modern infrastructure designed to empower club presidents, tech leads, and recruitment heads to run seamless operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {superpowers.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -4 }}
              className={`${item.colSpan} h-full`}
            >
              <Card
                className={`h-full flex flex-col justify-between border border-border/80 bg-card/60 backdrop-blur-md transition-all duration-300 hover:shadow-xl ${item.borderColor} hover:bg-card/90 text-left p-6 relative overflow-hidden`}
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className={`p-3 rounded-2xl ${item.bgColor} ${item.iconColor}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border border-border bg-background/80 text-foreground">
                      {item.badge}
                    </span>
                  </div>

                  <div className="space-y-1 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {item.subtitle}
                    </span>
                    <CardTitle className="text-xl font-bold text-foreground text-left">
                      {item.title}
                    </CardTitle>
                  </div>

                  <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </CardDescription>
                </div>

                <div className="pt-4 mt-auto flex items-center gap-2 text-xs font-semibold text-primary">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Native to Ashoka ecosystem</span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
