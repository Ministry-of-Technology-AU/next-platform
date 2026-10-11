"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { haptic } from "@/lib/haptics";

/** The page title's link between the pool page and the results page. */
export function PageNavButton({ href, label, back = false }: { href: string; label: string; back?: boolean }) {
  return (
    <Button asChild variant="outline" className="h-11 w-full gap-2 sm:w-auto md:h-10">
      <Link href={href} onClick={() => void haptic.tap()}>
        {back ? <ArrowLeft aria-hidden="true" className="size-4" /> : null}
        {label}
        {back ? null : <ArrowRight aria-hidden="true" className="size-4" />}
      </Link>
    </Button>
  );
}
