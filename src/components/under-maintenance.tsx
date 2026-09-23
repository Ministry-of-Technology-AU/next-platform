"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Wrench,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Calendar,
  GraduationCap,
} from "lucide-react";

const EXPLORE_LINKS = [
  {
    label: "Course Reviews",
    href: "/platform/course-reviews",
    icon: BookOpen,
  },
  {
    label: "Events Calendar",
    href: "/platform/events-calendar",
    icon: Calendar,
  },
  {
    label: "CGPA Planner",
    href: "/platform/cgpa-planner",
    icon: GraduationCap,
  },
  {
    label: "Semester Planner",
    href: "/platform/semester-planner",
    icon: GraduationCap,
  },
];

interface UnderMaintenanceProps {
  /** Optional custom title. Defaults to a witty maintenance message. */
  title?: string;
  /** Optional custom description. */
  description?: string;
  /** Show a "Back to Platform" button. Defaults to true. */
  showBackButton?: boolean;
  /** Show the "explore other tools" suggestion grid. Defaults to true. */
  showExploreSuggestions?: boolean;
  /** Optional additional classes for styling/spacing custom overrides. */
  className?: string;
}

export default function UnderMaintenance({
  title = "We're tinkering under the hood",
  description = "Our resident cat engineer is refactoring the hamster wheels and oiling the pixel gears. This page will be back before you finish your chai.",
  showBackButton = true,
  showExploreSuggestions = true,
  className = "",
}: UnderMaintenanceProps) {
  return (
    <div className={`flex flex-col items-center justify-start min-h-[70vh] px-4 sm:px-6 pt-2 pb-10 sm:pt-4 sm:pb-16 select-none ${className}`}>
      {/* ---- Floating badge ---- */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold tracking-wide uppercase mb-6 animate-pulse">
        <Wrench className="w-3.5 h-3.5" />
        Under Maintenance
      </div>

      {/* ---- Mascot ---- */}
      <div className="relative w-56 h-56 sm:w-72 sm:h-72 mb-8 mt-[-12]">
        <Image
          src="/mascot-maintenance.png"
          alt="Platform mascot cat wearing a hard hat, holding a wrench, surrounded by gears and caution tape"
          fill
          className="object-contain drop-shadow-lg"
          priority
        />
        {/* Subtle floating sparkle */}
        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-bounce" />
      </div>

      {/* ---- Copy ---- */}
      <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-center max-w-xl leading-tight mb-3">
        {title}
      </h1>
      <p className="text-muted-foreground text-center max-w-md text-sm sm:text-base leading-relaxed mb-8">
        {description}
      </p>

      {/* ---- Back Button ---- */}
      {showBackButton && (
        <Link href="/platform">
          <Button variant="animatedGhost" className="gap-2 mb-10">
            <ArrowLeft className="w-4 h-4" />
            Back to Platform
          </Button>
        </Link>
      )}

      {/* ---- Explore suggestions ---- */}
      {showExploreSuggestions && (
        <div className="w-full max-w-lg">
          <p className="text-xs uppercase tracking-widest text-muted-foreground text-center mb-4 font-semibold">
            Meanwhile, why not explore
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {EXPLORE_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
              >
                <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ---- Footer quip ---- */}
      <p className="mt-12 text-[11px] text-muted-foreground/60 italic text-center">
        &quot;It&apos;s not a bug, it&apos;s a scheduled feature vacation.&quot;
        — Ministry of Technology
      </p>
    </div>
  );
}
