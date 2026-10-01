"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  HardHat,
  ArrowRight,
  Hammer,
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

interface UnderConstructionProps {
  /** Page or section title. */
  title?: string;
  /** Explanatory description shown below the title. */
  description?: string;
  /** Label for the primary CTA button. */
  buttonText?: string;
  /** Href for the primary CTA button. */
  buttonHref?: string;
  /** Optional small sub-note displayed below the CTA. */
  subtext?: string;
  /** Show the "explore other tools" suggestion grid. Defaults to false. */
  showExploreSuggestions?: boolean;
  /** Optional additional classes for layout overrides. */
  className?: string;
}

export default function UnderConstruction({
  title = "This page is under construction",
  description = "We're working hard to get this page ready. Stay tuned — something great is coming!",
  buttonText = "Head to the Platform",
  buttonHref = "/platform",
  subtext,
  showExploreSuggestions = false,
  className = "",
}: UnderConstructionProps) {
  return (
    <div
      className={`flex flex-col items-center px-4 sm:px-6 py-10 sm:py-14 ${className}`}
      role="main"
      aria-label="Page under construction"
    >
      {/* ---- Badge + mascot stacked close together ---- */}
      <div className="flex flex-col items-center gap-4 mb-8">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground text-xs font-medium tracking-wide"
          role="status"
          aria-label="Status: Under construction"
        >
          <HardHat className="w-3 h-3" aria-hidden="true" />
          Under Construction
        </div>

        {/* Mascot */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96">
          <Image
            src="/mascot-construction.png"
            alt="The platform cat mascot — a grey tabby in glasses and a work apron, seated at a wooden workbench assembling glowing gears"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 640px) 256px, (max-width: 768px) 320px, 384px"
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

      {/* ---- Primary CTA ---- */}
      <Button
        asChild
        variant="animated"
        className="gap-2 min-h-[44px] px-6 mb-4"
        onClick={() => void haptic.press()}
      >
        <Link href={buttonHref} aria-label={buttonText}>
          <Hammer className="w-4 h-4" aria-hidden="true" />
          {buttonText}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </Button>

      {/* ---- Optional sub-note ---- */}
      {subtext && (
        <p className="text-center text-sm text-muted-foreground mt-1 mb-6 max-w-sm">
          {subtext}
        </p>
      )}

      {/* ---- Explore suggestions (opt-in) ---- */}
      {showExploreSuggestions && (
        <nav aria-label="Other tools to explore" className="w-full max-w-md mt-8">
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
        &quot;Good things take time. Great things take a little longer.&quot;
        {" "}— Ministry of Technology
      </p>
    </div>
  );
}
