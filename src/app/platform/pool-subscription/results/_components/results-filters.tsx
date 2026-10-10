"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

import { SingleSelect } from "@/components/form";
import { TourStep } from "@/components/guided-tour";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { haptic } from "@/lib/haptics";
import { SEARCH_MAX_LENGTH, SERVICES } from "../../data";

/** "All" can't be "" (Radix reserves it), so it gets its own value. */
export const ALL_SERVICES = "all";

const SERVICE_OPTIONS = [
  { value: ALL_SERVICES, label: "All services" },
  ...SERVICES.map(({ value, label, icon }) => ({ value, label, icon })),
];

interface ResultsFiltersProps {
  q: string;
  service: string;
  onSearch: (q: string) => void;
  onService: (service: string) => void;
  onClear: () => void;
}

/** Search (debounced, "/" to focus, Esc to clear) and the service filter. */
export function ResultsFilters({ q, service, onSearch, onService, onClear }: ResultsFiltersProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [draft, setDraft] = React.useState(q);
  const hasFilters = Boolean(q) || service !== ALL_SERVICES;

  // Follow the URL when it changes underneath (back button, clear filters), but
  // never while someone is typing: a slow response would eat their last keystrokes.
  React.useEffect(() => {
    if (document.activeElement !== inputRef.current) setDraft(q);
  }, [q]);

  // Wait for a pause in typing so each keystroke isn't a server round trip.
  React.useEffect(() => {
    if (draft.trim() === q) return;
    const timer = setTimeout(() => onSearch(draft.trim()), 300);
    return () => clearTimeout(timer);
  }, [draft, q, onSearch]);

  // "/" focuses search from anywhere on the page, except while typing in a field.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <TourStep
      id="results-filters"
      title="Find a pool"
      content="Search by service or owner name, or pick a service. Press / to jump to search."
      order={1}
    >
      <div className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_16rem_auto] sm:items-end sm:p-6">
        <div className="space-y-2">
          <label htmlFor="pool-search" className="text-base font-medium">
            Search
          </label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              id="pool-search"
              type="search"
              inputMode="search"
              value={draft}
              maxLength={SEARCH_MAX_LENGTH}
              placeholder="Service or name"
              aria-keyshortcuts="/"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape" && draft) {
                  e.preventDefault();
                  setDraft("");
                  onSearch("");
                }
              }}
              className="h-11 pl-9 pr-10 text-base md:h-9 md:text-sm"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border px-1.5 text-[11px] text-muted-foreground md:block">
              /
            </kbd>
          </div>
        </div>

        <SingleSelect
          title="Service"
          placeholder="All services"
          items={SERVICE_OPTIONS}
          value={service}
          onChange={onService}
        />

        {hasFilters ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="h-11 gap-2 md:h-9"
                onClick={() => {
                  void haptic.tap();
                  onClear();
                }}
              >
                <X aria-hidden="true" className="size-4" />
                Clear
              </Button>
            </TooltipTrigger>
            <TooltipContent>Show every open pool again</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </TourStep>
  );
}
