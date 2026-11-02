"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { haptic } from "@/lib/haptics";

interface ResultsPaginationProps {
  page: number;
  pageCount: number;
  total: number;
  onPage: (page: number) => void;
}

/** Previous / next with a count. Hidden when everything fits on one page. */
export function ResultsPagination({ page, pageCount, total, onPage }: ResultsPaginationProps) {
  if (pageCount <= 1) return null;

  const go = (next: number) => {
    void haptic.select();
    onPage(next);
  };

  return (
    <nav aria-label="Pages" className="flex items-center justify-between gap-3 pt-2">
      <Button
        variant="outline"
        className="h-11 gap-1 md:h-10"
        disabled={page <= 1}
        onClick={() => go(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>
      <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
        Page {page} of {pageCount} · {total} pools
      </p>
      <Button
        variant="outline"
        className="h-11 gap-1 md:h-10"
        disabled={page >= pageCount}
        onClick={() => go(page + 1)}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight aria-hidden="true" className="size-4" />
      </Button>
    </nav>
  );
}
