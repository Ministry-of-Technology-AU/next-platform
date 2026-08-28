"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  FileUser,
  Megaphone,
  UserCog,
  CalendarSearch,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Filter,
  Eye,
  Sliders,
  Send,
  UserCheck,
  UserX,
  FileText,
  Calendar,
  Layers,
  Flame,
  Check,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type FeatureTabId = "inductions" | "ads" | "forms" | "profile" | "scheduling";

interface FeatureTab {
  id: FeatureTabId;
  label: string;
  shortLabel: string;
  icon: typeof FileUser;
  tag: string;
  title: string;
  subtitle: string;
  bullets: string[];
  ctaText: string;
  ctaHref: string;
}

const FEATURE_TABS: FeatureTab[] = [
  {
    id: "inductions",
    label: "Inductions & Pipelines",
    shortLabel: "Inductions",
    icon: FileUser,
    tag: "Recruitment Suite",
    title: "Multi-Round Recruitment with Zero Lost Spreadsheets",
    subtitle:
      "Run professional recruitment cycles from first round form to final decision. Create custom pipeline stages, track candidate status in real-time, and dispatch personalized updates directly to student dashboards.",
    bullets: [
      "Custom multi-round pipelines: Form Round → Interview Round → Decision",
      "Real-time status management: Pending, Shortlisted, Interview Scheduled, Approved, Rejected",
      "Direct student notification dispatch with personalized feedback notes",
      "Granular role delegation for circle leads and interviewing panels",
    ],
    ctaText: "Explore Inductions Hub",
    ctaHref: "/organisations/inductions",
  },
  {
    id: "ads",
    label: "Platform Advertisements",
    shortLabel: "Ads Manager",
    icon: Megaphone,
    tag: "Campus Visibility",
    title: "Broadcast High-Impact Banners to 3,000+ Students",
    subtitle:
      "Showcase your upcoming events, flagship fests, panel discussions, and recruitment calls directly on the student platform homepage. Maximize turnout with zero promotional clutter.",
    bullets: [
      "Prime carousel placement on the daily student home dashboard",
      "Schedule start and end dates with automatic campaign expiration",
      "Direct call-to-action buttons linking to registration forms or website links",
      "High visibility without relying on overcrowded WhatsApp groups",
    ],
    ctaText: "Launch Ads Manager",
    ctaHref: "/organisations/ads",
  },
  {
    id: "forms",
    label: "Dynamic Form Engine",
    shortLabel: "Form Builder",
    icon: FileText,
    tag: "Application Builder",
    title: "Custom Form Builder Powered by Ashoka Single Sign-On",
    subtitle:
      "Design tailored application forms with rich question blocks, file upload support, and automatic student identity verification. Say goodbye to duplicate entries and unverified emails.",
    bullets: [
      "Rich input types: Short answer, Long essay, Radio choices, File uploads, Portfolio links",
      "Authenticated submission pre-fill: Verified name and @ashoka.edu.in email automatically recorded",
      "Real-time response tracking and full data export capabilities",
      "Direct integration with induction pipeline rounds and evaluation workflows",
    ],
    ctaText: "Manage Application Forms",
    ctaHref: "/organisations/inductions",
  },
  {
    id: "profile",
    label: "Public Identity & Catalogue",
    shortLabel: "Public Profile",
    icon: UserCog,
    tag: "Campus Directory",
    title: "Verified Club Presence in the Organisations Catalogue",
    subtitle:
      "Manage your organization's official profile visible to the entire Ashoka community. Update logos, banners, social handles, and toggle live recruitment badges with countdown timers.",
    bullets: [
      "Synchronized in real-time with the student-facing Organisations Catalogue",
      "Master recruitment switch: Turn on 'Inductions Open' and set application deadlines",
      "Showcase leadership contacts, social media handles, and past achievements",
      "Centralized hub for students to discover, track, and bookmark your society",
    ],
    ctaText: "Update Organisation Profile",
    ctaHref: "/organisations/profile",
  },
  {
    id: "scheduling",
    label: "When2meet & Smart Sync",
    shortLabel: "Scheduler",
    icon: CalendarSearch,
    tag: "Team Operations",
    title: "Effortless Panel Availability & Interview Coordination",
    subtitle:
      "Coordinate interview panel slots and core team meetings without back-and-forth messaging. Built right into the platform with frictionless heatmap availability grids.",
    bullets: [
      "Interactive group availability heatmaps to find the optimal interview windows",
      "Zero account friction: Shareable instant links for panels and candidates",
      "Multi-timezone and flexible hour-grid configuration",
      "Synchronize interview slots with induction candidate tracking",
    ],
    ctaText: "Open When2meet Tool",
    ctaHref: "/platform/when2meet",
  },
];

export function OrgsFeatureShowcase() {
  const [activeTab, setActiveTab] = useState<FeatureTabId>("inductions");

  const currentTab = FEATURE_TABS.find((t) => t.id === activeTab) || FEATURE_TABS[0];

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      {/* Section Header */}
      <div className="flex flex-col items-start text-left mb-10">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Feature Deep Dive</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight text-left">
          Everything your club needs to run like a pro
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground mt-2 max-w-2xl text-left">
          Explore the modular capabilities built specifically for Ashoka student organisations, committees, and collective leadership.
        </p>
      </div>

      {/* Tabs Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
        {FEATURE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                  : "bg-card/70 border border-border/80 text-muted-foreground hover:text-foreground hover:bg-card/90"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div className="rounded-3xl border border-border/80 bg-card/50 backdrop-blur-xl p-6 sm:p-8 lg:p-10 shadow-xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
          >
            {/* Left Column: Descriptions and Bullet Points */}
            <div className="lg:col-span-6 flex flex-col text-left space-y-6">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {currentTab.tag}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground text-left leading-tight">
                  {currentTab.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-left">
                  {currentTab.subtitle}
                </p>
              </div>

              {/* Bullet list */}
              <div className="space-y-3">
                {currentTab.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-left">
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-medium text-foreground/90">{bullet}</span>
                  </div>
                ))}
              </div>

              {/* Tab CTA */}
              <div className="pt-2">
                <Button asChild size="lg" className="font-semibold gap-2 shadow-md">
                  <Link href={currentTab.ctaHref}>
                    <span>{currentTab.ctaText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Column: Live Interactive Mockup Simulator */}
            <div className="lg:col-span-6">
              {activeTab === "inductions" && <InductionsSimulator />}
              {activeTab === "ads" && <AdsSimulator />}
              {activeTab === "forms" && <FormsSimulator />}
              {activeTab === "profile" && <ProfileSimulator />}
              {activeTab === "scheduling" && <SchedulingSimulator />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 1. INDUCTIONS SIMULATOR
// ---------------------------------------------------------------------------
function InductionsSimulator() {
  const [filter, setFilter] = useState<"all" | "shortlisted" | "interview" | "approved">("all");
  const [applicants, setApplicants] = useState([
    {
      id: 1,
      name: "Aanya Sharma",
      email: "aanya.sharma_ug27@ashoka.edu.in",
      role: "Design Lead",
      stage: "Interview Scheduled",
      status: "interview",
      statusBadge: "Interview Scheduled",
      badgeColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      id: 2,
      name: "Kabir Roy",
      email: "kabir.roy_ug26@ashoka.edu.in",
      role: "Logistics Coordinator",
      stage: "Shortlisted",
      status: "shortlisted",
      statusBadge: "Shortlisted (Round 1)",
      badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      id: 3,
      name: "Diya Mehta",
      email: "diya.mehta_ug27@ashoka.edu.in",
      role: "Editorial Member",
      stage: "Approved",
      status: "approved",
      statusBadge: "Offer Sent",
      badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
  ]);

  const filteredApplicants =
    filter === "all" ? applicants : applicants.filter((a) => a.status === filter);

  return (
    <div className="rounded-2xl border border-border/80 bg-background/90 p-5 shadow-lg backdrop-blur-md text-left space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-border/70">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileUser className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground !text-left">Monsoon 2026 Induction Cycle</h4>
            <p className="text-[11px] text-muted-foreground">3 Roles Active &bull; 42 Applications Total</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
          ● Cycle Live
        </Badge>
      </div>

      {/* Stage Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: "all", label: "All Candidates (42)" },
          { id: "shortlisted", label: "Shortlisted (18)" },
          { id: "interview", label: "Interviews (9)" },
          { id: "approved", label: "Offers Sent (4)" },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id as any)}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filter === btn.id
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Candidate Rows */}
      <div className="space-y-2.5">
        {filteredApplicants.map((app) => (
          <div
            key={app.id}
            className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/60 bg-card/70 hover:border-primary/40 transition-colors"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground truncate">{app.name}</p>
                <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {app.role}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">{app.email}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${app.badgeColor}`}>
                {app.statusBadge}
              </span>
              <div className="flex items-center gap-1">
                <button
                  title="Approve / Offer"
                  onClick={() => {
                    setApplicants((prev) =>
                      prev.map((a) =>
                        a.id === app.id
                          ? { ...a, status: "approved", statusBadge: "Offer Sent", badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" }
                          : a
                      )
                    );
                  }}
                  className="h-6 w-6 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                </button>
                <button
                  title="Schedule Interview"
                  onClick={() => {
                    setApplicants((prev) =>
                      prev.map((a) =>
                        a.id === app.id
                          ? { ...a, status: "interview", statusBadge: "Interview Scheduled", badgeColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20" }
                          : a
                      )
                    );
                  }}
                  className="h-6 w-6 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Calendar className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Dispatch Indicator */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/60">
        <span className="flex items-center gap-1.5">
          <Send className="h-3.5 w-3.5 text-primary" />
          Status changes notify candidate in real-time
        </span>
        <span className="font-semibold text-primary">Interactive Preview</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. ADS SIMULATOR
// ---------------------------------------------------------------------------
function AdsSimulator() {
  const [selectedAd, setSelectedAd] = useState<"fest" | "recruitment" | "talk">("recruitment");

  const adsData = {
    recruitment: {
      headline: "The Edict is Recuiting!",
      sub: "Apply for Journalism, Design, Video, and Web Development roles.",
      cta: "Apply on Platform",
      org: "The Edict • Ashoka's Independent Student Newspaper",
      views: "2,420 Impressions",
      badge: "LIVE CAMPAIGN",
      bgGradient: "from-red-900/80 via-amber-900/60 to-zinc-900/90",
    },
    fest: {
      headline: "Jashn 2026: Pass Registrations Open!",
      sub: "3 Days of music, theatre, competitions and celebrity headliners.",
      cta: "Register Passes",
      org: "Cultural Ministry • Ashoka University",
      views: "3,810 Impressions",
      badge: "FEATURED FEST",
      bgGradient: "from-purple-900/80 via-pink-900/60 to-zinc-900/90",
    },
    talk: {
      headline: "Ashoka Economics Colloquium 2026",
      sub: "Keynote lecture with Nobel Laureate Dr. Esther Duflo.",
      cta: "Reserve Seat",
      org: "Economics Society",
      views: "1,940 Impressions",
      badge: "FLAGSHIP TALK",
      bgGradient: "from-blue-900/80 via-cyan-900/60 to-zinc-900/90",
    },
  };

  const currentAd = adsData[selectedAd];

  return (
    <div className="rounded-2xl border border-border/80 bg-background/90 p-5 shadow-lg backdrop-blur-md text-left space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/70">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-amber-500" />
          <h4 className="text-sm font-bold text-foreground !text-left">Platform Banner Live Preview</h4>
        </div>
        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
          Student Home Feed Placement
        </span>
      </div>

      {/* Preset Switcher */}
      <div className="flex items-center gap-1.5">
        {[
          { id: "recruitment", label: "Induction Call" },
          { id: "fest", label: "Flagship Fest" },
          { id: "talk", label: "Guest Talk" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedAd(item.id as any)}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedAd === item.id
                ? "bg-amber-600 text-white font-bold"
                : "bg-muted/60 text-muted-foreground hover:bg-muted"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Simulated Banner Card */}
      <div
        className={`rounded-2xl p-5 border border-white/10 bg-gradient-to-r ${currentAd.bgGradient} text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[160px]`}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
            {currentAd.badge}
          </span>
          <span className="text-[11px] font-medium text-white/80 flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {currentAd.views}
          </span>
        </div>

        <div className="my-2">
          <p className="text-[11px] font-semibold text-white/70 uppercase">{currentAd.org}</p>
          <h4 className="text-base sm:text-lg font-extrabold text-white leading-tight !text-left mt-0.5">
            {currentAd.headline}
          </h4>
          <p className="text-xs text-white/80 mt-1 max-w-sm">{currentAd.sub}</p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1 text-[11px] text-white/70">
            <Clock className="h-3 w-3" />
            <span>Active for 7 more days</span>
          </div>
          <button className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white text-zinc-900 hover:bg-white/90 shadow-md flex items-center gap-1.5 transition-transform hover:scale-105">
            <span>{currentAd.cta}</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <span>Instant placement on <strong className="text-foreground">/platform</strong></span>
        <span className="font-semibold text-amber-600 dark:text-amber-400">Scheduled Campaigns</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. FORMS SIMULATOR
// ---------------------------------------------------------------------------
function FormsSimulator() {
  return (
    <div className="rounded-2xl border border-border/80 bg-background/90 p-5 shadow-lg backdrop-blur-md text-left space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/70">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-bold text-foreground !text-left">Dynamic Form Builder</h4>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          Auto-Authenticated SSO
        </span>
      </div>

      {/* Mock Question Blocks */}
      <div className="space-y-3">
        <div className="p-3 rounded-xl border border-border/60 bg-card/60 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <span>Q1. Portfolio Link / Work Sample</span>
            <span className="text-[10px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">URL Input</span>
          </div>
          <div className="h-8 rounded-lg border border-border/60 bg-background/50 px-2.5 flex items-center text-xs text-muted-foreground">
            https://behance.net/ashoka-designer
          </div>
        </div>

        <div className="p-3 rounded-xl border border-border/60 bg-card/60 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <span>Q2. Department Preference</span>
            <span className="text-[10px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Single Choice</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="flex items-center gap-2 p-1.5 rounded-lg border border-primary/40 bg-primary/10 text-foreground font-semibold">
              <div className="h-3 w-3 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-2 w-2 text-primary-foreground" />
              </div>
              <span>Visual Design</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg border border-border/50 bg-background/40 text-muted-foreground">
              <div className="h-3 w-3 rounded-full border border-border/80" />
              <span>Event Operations</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-border/60 bg-card/60 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <span>Q3. Why do you want to join our core team?</span>
            <span className="text-[10px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Long Essay</span>
          </div>
          <div className="h-12 rounded-lg border border-border/60 bg-background/50 p-2 text-xs text-muted-foreground leading-snug">
            I have led branding campaigns in high school and want to help streamline our club&apos;s digital media presence...
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/60">
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Pre-filled Student ID & Email
        </span>
        <span className="font-semibold text-foreground">58 Responses Collected</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. PROFILE SIMULATOR
// ---------------------------------------------------------------------------
function ProfileSimulator() {
  const [recruitmentOpen, setRecruitmentOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-border/80 bg-background/90 p-5 shadow-lg backdrop-blur-md text-left space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/70">
        <div className="flex items-center gap-2">
          <UserCog className="h-4 w-4 text-emerald-500" />
          <h4 className="text-sm font-bold text-foreground !text-left">Public Club Catalogue Profile</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground font-medium">Recruitment Switch:</span>
          <button
            onClick={() => setRecruitmentOpen(!recruitmentOpen)}
            className={`text-xs px-2 py-0.5 rounded-full font-bold transition-colors cursor-pointer ${
              recruitmentOpen
                ? "bg-emerald-500 text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {recruitmentOpen ? "OPEN" : "CLOSED"}
          </button>
        </div>
      </div>

      {/* Simulated Catalogue Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
              AC
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h5 className="text-base font-extrabold text-foreground !text-left">Ashoka Coding Club</h5>
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Technology &bull; 140 Active Members</p>
            </div>
          </div>

          {recruitmentOpen ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Inductions Open
            </span>
          ) : (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              Recruitment Closed
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Ashoka&apos;s premier programming and open source collective. Building tools, hosting hackathons, and fostering developer culture.
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
          <span className="text-muted-foreground">
            {recruitmentOpen ? "⏳ Deadline: 31st August" : "Next cycle: Monsoon 2026"}
          </span>
          <span className="text-primary font-bold">Catalogue Preview</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <span>Updates propagate to <strong className="text-foreground">/platform/organisations-catalog</strong></span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Live Sync</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. SCHEDULING SIMULATOR
// ---------------------------------------------------------------------------
function SchedulingSimulator() {
  const [selectedSlot, setSelectedSlot] = useState("4:00 PM - 5:00 PM");

  const slots = [
    { time: "2:00 PM", availability: "4/5 Members Free", color: "bg-emerald-500/30 text-emerald-700 dark:text-emerald-300" },
    { time: "3:00 PM", availability: "3/5 Members Free", color: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" },
    { time: "4:00 PM", availability: "5/5 Full Panel Available", color: "bg-emerald-500/70 text-white font-bold" },
    { time: "5:00 PM", availability: "5/5 Full Panel Available", color: "bg-emerald-500/70 text-white font-bold" },
    { time: "6:00 PM", availability: "2/5 Members Free", color: "bg-muted text-muted-foreground" },
  ];

  return (
    <div className="rounded-2xl border border-border/80 bg-background/90 p-5 shadow-lg backdrop-blur-md text-left space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/70">
        <div className="flex items-center gap-2">
          <CalendarSearch className="h-4 w-4 text-blue-500" />
          <h4 className="text-sm font-bold text-foreground !text-left">When2meet Interview Panel Sync</h4>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
          5 Interviewers Synced
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Overlapping Panel Availability Grid (Friday, Aug 30):</p>
        <div className="grid grid-cols-1 gap-1.5">
          {slots.map((slot) => (
            <div
              key={slot.time}
              onClick={() => setSelectedSlot(slot.time)}
              className={`flex items-center justify-between p-2.5 rounded-xl border border-border/60 text-xs transition-all cursor-pointer ${
                slot.color
              } ${selectedSlot === slot.time ? "ring-2 ring-blue-500" : ""}`}
            >
              <span className="font-bold">{slot.time}</span>
              <span>{slot.availability}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/60">
        <span>Selected slot for candidate interview: <strong className="text-foreground">{selectedSlot}</strong></span>
        <span className="text-blue-600 dark:text-blue-400 font-semibold">Zero Friction</span>
      </div>
    </div>
  );
}
