"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
  ArrowRight,
  Megaphone,
  UserCog,
  FileUser,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Users,
  CalendarCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function OrgsLandingHero() {
  return (
    <section className="relative overflow-hidden pt-4 pb-12 sm:pt-8 sm:pb-16 lg:pb-20">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/15 blur-3xl dark:bg-primary/25" />
        <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-secondary/20 blur-3xl dark:bg-secondary/15" />
        <div className="absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl dark:bg-amber-500/15" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        {/* Left Column: Headline, Subtitle, Badges & CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="lg:col-span-7 flex flex-col items-start text-left space-y-6"
        >
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/10 dark:bg-primary/20 backdrop-blur-md text-primary dark:text-primary-bright text-xs font-semibold tracking-wide shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>MINISTRY OF TECHNOLOGY &bull; ASHOKA SG</span>
            <span className="text-muted-foreground/60">|</span>
            <span className="font-bold text-foreground">ORGANISATIONS HUB</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground text-left leading-[1.1]">
              Platform,{" "}
              <span className="bg-gradient-to-r from-primary via-primary-bright to-amber-600 dark:from-red-400 dark:via-primary-light dark:to-secondary-dark bg-clip-text text-transparent">
                for orgs.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground font-medium text-left max-w-2xl leading-relaxed pt-2">
              The unified operating system for Ashoka&apos;s clubs, societies, and collectives.
              Run seamless multi-stage inductions, broadcast campus-wide advertisements, and manage your public presence with zero friction.
            </p>
          </div>

          {/* Quick Value Props Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 dark:bg-muted/30 border border-border/60 rounded-lg px-2.5 py-1 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>100% Verified Ashoka IDs</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 dark:bg-muted/30 border border-border/60 rounded-lg px-2.5 py-1 font-medium">
              <Zap className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Instant Decision Alerts</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 dark:bg-muted/30 border border-border/60 rounded-lg px-2.5 py-1 font-medium">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>Campus-Wide Reach</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto pt-3">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-6 text-base shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
            >
              <Link href="/organisations/inductions" className="flex items-center justify-center gap-2.5">
                <FileUser className="h-5 w-5" />
                <span>Launch Inductions Hub</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-border/80 bg-background/70 backdrop-blur-md hover:bg-muted/80 font-semibold px-6 py-6 text-base shadow-sm transition-all duration-200 hover:-translate-y-0.5"
            >
              <Link href="/organisations/ads" className="flex items-center justify-center gap-2">
                <Megaphone className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Create Advertisement</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="lg"
              className="hover:bg-muted/60 font-semibold px-4 py-6 text-base text-muted-foreground hover:text-foreground"
            >
              <Link href="/organisations/profile" className="flex items-center justify-center gap-2">
                <UserCog className="h-4 w-4" />
                <span>Club Profile</span>
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Right Column: Mascot Card & Floating Badges */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="lg:col-span-5 relative flex items-center justify-center"
        >
          {/* Card Frame with Glassmorphism */}
          <div className="relative w-full max-w-md rounded-3xl border border-border/80 bg-gradient-to-b from-card/80 via-card/50 to-card/90 p-6 backdrop-blur-xl shadow-2xl overflow-hidden group">
            {/* Ambient Background Radial */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-amber-500/5 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 h-40 w-40 bg-secondary/20 rounded-full blur-2xl pointer-events-none" />

            {/* Mascot Image Container with Hover Bob */}
            <motion.div
              animate={{ y: [-4, 6, -4] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative flex flex-col items-center justify-center py-2"
            >
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 drop-shadow-xl">
                <Image
                  src="/mascot-orgs.png"
                  alt="Platform Orgs Mascot"
                  fill
                  sizes="(max-width: 768px) 256px, 288px"
                  priority
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Leader Badge underneath */}
              <div className="mt-3 flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-1.5 backdrop-blur-md shadow-sm">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-semibold text-foreground">
                  Ready to manage recruitment & campaigns!
                </span>
              </div>
            </motion.div>

            {/* Floating Stats Badges */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.2 }}
              className="absolute -top-2 -left-2 sm:left-2 flex items-center gap-2 rounded-2xl border border-primary/20 bg-background/90 p-2.5 backdrop-blur-md shadow-lg"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </div>
              <div className="text-left pr-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Campus Reach</p>
                <p className="text-xs font-extrabold text-foreground">3,000+ Students</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-6 -right-2 sm:right-2 flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-background/90 p-2.5 backdrop-blur-md shadow-lg"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="text-left pr-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Efficiency</p>
                <p className="text-xs font-extrabold text-foreground">Zero Spreadsheets</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Trust & Metric Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl border border-border/80 bg-card/40 p-4 sm:p-6 backdrop-blur-md shadow-sm"
      >
        <div className="flex items-center gap-3 p-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-lg sm:text-xl font-extrabold text-foreground">100+ Orgs</p>
            <p className="text-xs text-muted-foreground">Clubs, Societies & Fests</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Megaphone className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-lg sm:text-xl font-extrabold text-foreground">Live Ads</p>
            <p className="text-xs text-muted-foreground">Platform-wide visibility</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-lg sm:text-xl font-extrabold text-foreground">Verified IDs</p>
            <p className="text-xs text-muted-foreground">@ashoka.edu.in accounts</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-lg sm:text-xl font-extrabold text-foreground">Smart Sync</p>
            <p className="text-xs text-muted-foreground">Interview scheduling</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
