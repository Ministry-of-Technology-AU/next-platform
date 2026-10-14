"use client";

import { useEffect, useRef } from "react";
import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { ParsedSemester } from "@/lib/cgpa/types";
import { TERM_KIND_LABEL } from "../data";
import { formatGPA } from "../utils";

type RailItem = { term: ParsedSemester; index: number };

function subtitle(term: ParsedSemester): string {
  const kind = TERM_KIND_LABEL[term.kind];
  const status = term.status === "in-progress" ? "In progress" : `GPA ${formatGPA(term.gpa)}`;
  return kind ? `${status} · ${kind}` : status;
}

/**
 * Term picker. A card of buttons on desktop; a horizontally scrolling strip of the same
 * buttons on smaller screens, where the selected one scrolls into view. Newest term first.
 */
export function TermRail({
  terms,
  selectedIndex,
  onSelect,
}: {
  terms: ParsedSemester[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const items: RailItem[] = terms.map((term, index) => ({ term, index })).reverse();
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll only the strip sideways; scrollIntoView would also move the page.
    const viewport = stripRef.current?.querySelector<HTMLElement>("[data-slot='scroll-area-viewport']");
    const chip = viewport?.querySelector<HTMLElement>(`[data-term-index="${selectedIndex}"]`);
    if (!viewport || !chip) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    viewport.scrollTo({
      left: chip.offsetLeft - viewport.clientWidth / 2 + chip.clientWidth / 2,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [selectedIndex]);

  const select = (index: number) => {
    if (index === selectedIndex) return;
    void haptic.select();
    onSelect(index);
  };

  const termButton = ({ term, index }: RailItem, layout: "strip" | "list") => {
    const selected = index === selectedIndex;
    const deansList = term.honours.some((honour) => /dean/i.test(honour));
    return (
      <Button
        key={`${term.semester}-${index}`}
        data-term-index={index}
        variant="ghost"
        aria-current={selected ? "true" : undefined}
        onClick={() => select(index)}
        className={cn(
          "h-auto min-h-11 flex-col items-start gap-0 border py-2 text-left",
          selected ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" : "border-border",
          layout === "list" ? "w-full" : "shrink-0",
        )}
      >
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          {term.semester}
          {deansList && <Award className="size-3.5" aria-label="Dean's List" />}
        </span>
        <span className={cn("text-xs font-normal tabular-nums", "text-muted-foreground")}>{subtitle(term)}</span>
      </Button>
    );
  };

  return (
    <nav aria-label="Terms" className="min-w-0">
      {/* Below desktop: horizontal strip */}
      <div ref={stripRef} className="lg:hidden">
        {/* type="always" keeps the bar visible on touch screens, so the strip reads as scrollable. */}
        <ScrollArea type="always" className="w-full">
          <div className="relative flex w-max gap-2 pb-4">{items.map((item) => termButton(item, "strip"))}</div>
          <ScrollBar orientation="horizontal" className="h-2 rounded-full bg-muted [&>[data-slot=scroll-area-thumb]]:bg-muted-foreground/40" />
        </ScrollArea>
      </div>

      {/* Desktop: card with a vertical list */}
      <Card className="hidden lg:block">
        <CardHeader className="pb-3">
          <CardTitle className="text-left text-lg">Terms</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <ScrollArea className="[&>[data-slot=scroll-area-viewport]]:max-h-[calc(100dvh-16rem)]">
            <div className="space-y-2 pr-3">{items.map((item) => termButton(item, "list"))}</div>
          </ScrollArea>
          <p className="mt-3 text-xs text-muted-foreground">
            <kbd className="font-mono">[</kbd> and <kbd className="font-mono">]</kbd> move between terms.
          </p>
        </CardContent>
      </Card>
    </nav>
  );
}
