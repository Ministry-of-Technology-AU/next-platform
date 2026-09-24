"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Wrench,
  ArrowLeft,
  BookOpen,
  Calendar,
  GraduationCap,
} from "lucide-react";
import { haptic } from "@/lib/haptics";

const EXPLORE_LINKS = [
  { label: "Course Reviews", href: "/platform/course-reviews", icon: BookOpen },
  { label: "Events Calendar", href: "/platform/events-calendar", icon: Calendar },
  { label: "CGPA Planner", href: "/platform/cgpa-planner", icon: GraduationCap },
  { label: "Semester Planner", href: "/platform/semester-planner", icon: GraduationCap },
];

interface UnderMaintenanceProps {
  /** Optional custom title. */
  title?: string;
  /** Optional custom description. */
  description?: string;
  /** Show a "Back to Platform" button. Defaults to true. */
  showBackButton?: boolean;
  /** Show the "explore other tools" suggestion grid. Defaults to true. */
  showExploreSuggestions?: boolean;
  /** Optional additional classes for layout overrides. */
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
    <div
      className={`flex flex-col items-center px-4 sm:px-6 py-10 sm:py-14 ${className}`}
      role="main"
      aria-label="Page under maintenance"
    >
      {/* ---- Mascot + badge stacked together ---- */}
      <div className="flex flex-col items-center gap-4 mb-8">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground text-xs font-medium tracking-wide"
          role="status"
          aria-label="Status: Under maintenance"
        >
          <Wrench className="w-3 h-3" aria-hidden="true" />
          Under Maintenance
        </div>

        {/* Mascot */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64">
          <Image
            src="/mascot-maintenance.png"
            alt="The platform cat mascot — a grey tabby in round glasses and a work apron, holding a wrench and a gear"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, 256px"
          />
        </div>
      </div>

      {/* ---- Copy ---- */}
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-center max-w-lg leading-snug mb-3">
        {title}
      </h1>
      <p className="text-muted-foreground text-center max-w-sm text-sm sm:text-base leading-relaxed mb-8">
        {description}
      </p>

      {/* ---- Back Button ---- */}
      {showBackButton && (
        <Button
          asChild
          variant="animatedGhost"
          className="gap-2 mb-10 min-h-[44px] px-5"
          onClick={() => void haptic.tap()}
        >
          <Link href="/platform" aria-label="Go back to Platform home">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Platform
          </Link>
        </Button>
      )}

      {/* ---- Explore suggestions ---- */}
      {showExploreSuggestions && (
        <nav aria-label="Other tools to explore" className="w-full max-w-md">
          <p className="text-xs uppercase tracking-widest text-muted-foreground text-center mb-4 font-semibold">
            Meanwhile, explore
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {EXPLORE_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => void haptic.select()}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring min-h-[76px]"
                aria-label={`Go to ${label}`}
              >
                <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* ---- Footer quip ---- */}
      <p className="mt-12 text-[11px] text-muted-foreground/50 italic text-center">
        &quot;It&apos;s not a bug, it&apos;s a scheduled feature vacation.&quot;
        {" "} Ministry of Technology
      </p>
    </div>
  );
}
