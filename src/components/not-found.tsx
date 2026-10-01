"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  SearchX,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Calendar,
  GraduationCap,
} from "lucide-react";
import { haptic } from "@/lib/haptics";
import { useEffect } from "react";

const EXPLORE_LINKS = [
  { label: "Course Reviews", href: "/platform/course-reviews", icon: BookOpen },
  { label: "Events Calendar", href: "/platform/events-calendar", icon: Calendar },
  { label: "CGPA Planner", href: "/platform/cgpa-planner", icon: GraduationCap },
  { label: "Semester Planner", href: "/platform/semester-planner", icon: GraduationCap },
];

interface NotFoundComponentProps {
  /** Optional custom title. */
  title?: string;
  /** Optional custom description. */
  description?: string;
  /** Show the "explore other tools" suggestion grid. Defaults to true. */
  showExploreSuggestions?: boolean;
  /** Optional additional classes for layout overrides. */
  className?: string;
}

export default function NotFoundComponent({
  title = "Hmm… nothing here",
  description = "The page you're looking for wandered off. Maybe it mistyped its own URL. (It happens to the best of us.)",
  showExploreSuggestions = true,
  className = "",
}: NotFoundComponentProps) {
  const router = useRouter();

  /* Keyboard shortcut: Escape → go to platform */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        e.key === "Escape" &&
        target.tagName !== "INPUT" &&
        target.tagName !== "TEXTAREA" &&
        !target.isContentEditable
      ) {
        void haptic.tap();
        router.push("/platform");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div
      className={`flex flex-col items-center px-4 sm:px-6 py-10 sm:py-14 ${className}`}
      role="main"
      aria-label="404 – Page not found"
    >
      {/* ---- Badge + mascot stacked close together ---- */}
      <div className="flex flex-col items-center gap-4 mb-8">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground text-xs font-medium tracking-wide"
          role="status"
          aria-label="Error: 404 Page not found"
        >
          <SearchX className="w-3 h-3" aria-hidden="true" />
          404 — Not Found
        </div>

        {/* Mascot */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64">
          <Image
            src="/mascot-not-found.png"
            alt="The platform cat mascot — a grey tabby in glasses and a work apron with X marks over both eyes, holding a magnifying glass and looking confused"
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

      {/* ---- Actions ---- */}
      <div
        className="flex flex-col sm:flex-row items-center gap-3 mb-10"
        role="group"
        aria-label="Recovery actions"
      >
        {/* Primary: back to platform */}
        <Button
          asChild
          variant="animated"
          className="gap-2 min-h-[44px] px-6"
          onClick={() => void haptic.press()}
        >
          <Link href="/platform" aria-label="Go back to Platform home">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Platform
          </Link>
        </Button>

        {/* Secondary: browser back */}
        <Button
          variant="animatedGhost"
          className="gap-2 min-h-[44px] px-5"
          onClick={() => {
            void haptic.tap();
            router.back();
          }}
          aria-label="Go back to the previous page"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Go back
        </Button>
      </div>

      {/* ---- Explore suggestions ---- */}
      {showExploreSuggestions && (
        <nav aria-label="Other tools to explore" className="w-full max-w-md">
          <p className="text-xs uppercase tracking-widest text-muted-foreground text-center mb-4 font-semibold">
            Or explore something else
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

      {/* ---- Keyboard hint ---- */}
      <p className="mt-10 text-[11px] text-muted-foreground/50 text-center">
        Press{" "}
        <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-muted-foreground text-[10px] font-mono">
          Esc
        </kbd>{" "}
        to return to Platform
      </p>

      {/* ---- Footer quip ---- */}
      <p className="mt-3 text-[11px] text-muted-foreground/50 italic text-center">
        &quot;404: Cat not found. Try looking under the bed.&quot;
        {" "}— Ministry of Technology
      </p>
    </div>
  );
}
