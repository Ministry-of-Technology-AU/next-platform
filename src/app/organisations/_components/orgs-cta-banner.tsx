"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, FileUser, Megaphone, ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OrgsCtaBanner() {
  return (
    <section className="py-12 sm:py-16">
      <div className="relative rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card/90 to-amber-500/10 backdrop-blur-xl p-8 sm:p-12 shadow-2xl overflow-hidden text-left">
        {/* Glow Spheres */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Content */}
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary dark:text-primary-bright text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Scale Your Organisation</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight text-left leading-tight">
                Ready to transform your club&apos;s campus footprint?
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl text-left">
                Start your next recruitment cycle or launch high-visibility promotional campaigns across the student body today.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-6 text-base shadow-lg shadow-primary/25"
              >
                <Link href="/organisations/inductions" className="flex items-center gap-2">
                  <FileUser className="h-5 w-5" />
                  <span>Open Inductions</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-border/80 bg-background/80 hover:bg-muted font-semibold px-6 py-6 text-base"
              >
                <Link href="/organisations/ads" className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-amber-500" />
                  <span>Create Ad Campaign</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                size="lg"
                className="font-semibold px-4 py-6 text-base text-muted-foreground hover:text-foreground"
              >
                <Link href="/platform" className="flex items-center gap-1.5">
                  <span>Student Platform</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Content: Mascot Floating Visual */}
          <div className="lg:col-span-4 flex items-center justify-center lg:justify-end">
            <motion.div
              animate={{ y: [-4, 5, -4] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative w-48 h-48 sm:w-56 sm:h-56 drop-shadow-2xl"
            >
              <Image
                src="/mascot-orgs.png"
                alt="Platform Mascot"
                fill
                sizes="(max-width: 768px) 192px, 224px"
                className="object-contain"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
