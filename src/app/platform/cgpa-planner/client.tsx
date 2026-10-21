"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Calculator, Target } from "lucide-react";
import { toast } from "sonner";
import { TourStep } from "@/components/guided-tour";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@/components/ui/shadcn-io/tabs";
import { haptic } from "@/lib/haptics";
import type { ParsedCGPAData } from "./types";
import { GoalCalculators } from "./_components/goal-calculators";
import { GradePlanner } from "./_components/grade-planner";
import { ImportForm } from "./_components/import-form";
import { Overview } from "./_components/overview";
import { RetakePicker } from "./_components/retake-picker";
import { ShortcutsDialog } from "./_components/shortcuts-dialog";
import { TermPanel } from "./_components/term-panel";
import { TermRail } from "./_components/term-rail";
import type { PlannerTab } from "./types";
import { usePlan } from "./use-plan";
import { inSettledTab, isTypingTarget } from "./utils";

const TABS: ReadonlyArray<{ value: PlannerTab; label: string; short: string; icon: typeof BookOpen; key: string }> = [
  { value: "terms", label: "Terms", short: "Terms", icon: BookOpen, key: "1" },
  { value: "grade-planner", label: "Grade planner", short: "Grades", icon: Calculator, key: "2" },
  { value: "goals", label: "Goals", short: "Goals", icon: Target, key: "3" },
];

/** Long enough for the TabsContents spring to come to rest. */
const TAB_SLIDE_MS = 600;

/** The term a student most likely came to plan: the latest in-progress one, else the latest. */
function defaultTermIndex(report: ParsedCGPAData | null): number {
  if (!report || report.semesters.length === 0) return 0;
  const inProgress = report.semesters.findLastIndex((term) => term.status === "in-progress");
  return inProgress !== -1 ? inProgress : report.semesters.length - 1;
}

export function CGPAPlannerClient({
  initialData,
  initialError,
}: {
  initialData: ParsedCGPAData | null;
  initialError: string | null;
}) {
  const [report, setReport] = useState<ParsedCGPAData | null>(initialData);
  const [importing, setImporting] = useState(!initialData || initialData.semesters.length === 0);
  const [tab, setTab] = useState<PlannerTab>("terms");
  const [termIndex, setTermIndex] = useState(() => defaultTermIndex(initialData));
  const [retakeFor, setRetakeFor] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Tab panels slide in. Tour steps inside a tab only resolve once its slide has finished,
  // otherwise the tour measures (and scrolls to) a card that is still moving.
  const [settledTab, setSettledTab] = useState<PlannerTab | null>(tab);
  useEffect(() => {
    setSettledTab(null);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(() => setSettledTab(tab), reduceMotion ? 0 : TAB_SLIDE_MS);
    return () => clearTimeout(timer);
  }, [tab]);

  const terms = report?.semesters ?? [];
  const planApi = usePlan(terms);
  const { summary, baseline, hasPlannedGrades, linkRetake, unlinkRetake, restoreRetake } = planApi;
  const selectedTerm = terms[termIndex] ?? terms[terms.length - 1] ?? null;

  const showTerm = useCallback((index: number) => {
    setTermIndex(index);
    setTab("terms");
  }, []);

  /** Tour helper: shows the Terms tab on the term being planned (or the latest one). */
  const openPlannedTerm = useCallback(() => {
    setTab("terms");
    setTermIndex(defaultTermIndex(report));
  }, [report]);

  const changeTab = (value: PlannerTab) => {
    void haptic.select();
    setTab(value);
  };

  const onImported = (next: ParsedCGPAData) => {
    setReport(next);
    setTermIndex(defaultTermIndex(next));
    setImporting(false);
    setTab("terms");
  };

  const clearSaved = async () => {
    const previous = report;
    setConfirmClear(false);
    setReport(null); // optimistic
    setImporting(true);
    try {
      const response = await fetch("/api/platform/cgpa-planner", { method: "DELETE" });
      const result = (await response.json().catch(() => null)) as { success?: boolean; error?: string } | null;
      if (!response.ok || !result?.success) throw new Error(result?.error ?? "Your saved grades weren't removed.");
      void haptic.confirm();
      toast.success("Saved grades removed.");
    } catch (error) {
      setReport(previous);
      setImporting(false);
      void haptic.error();
      platform.error("Clearing CGPA data failed:", error);
      toast.error("Your saved grades weren't removed. Try again.");
    }
  };

  // Page shortcuts. Bare keys only, and never while typing (frontend.md, shortcuts).
  useEffect(() => {
    if (importing) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) return;
      const tabMatch = TABS.find((item) => item.key === event.key);
      if (tabMatch) {
        void haptic.select();
        setTab(tabMatch.value);
      } else if (event.key === "[" || event.key === "]") {
        // The rail lists newest first, so "next" in reading order is an older term.
        const step = event.key === "]" ? -1 : 1;
        setTermIndex((index) => Math.min(Math.max(index + step, 0), terms.length - 1));
        setTab("terms");
      } else if (event.key === "u" || event.key === "U") {
        setImporting(true);
      } else if (event.key === "?") {
        setShortcutsOpen(true);
      } else {
        return;
      }
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [importing, terms.length]);

  if (importing || !report) {
    return (
      <div className="space-y-4">
        {initialError && !report && (
          <Alert variant="destructive">
            <AlertDescription>{initialError}</AlertDescription>
          </Alert>
        )}
        <ImportForm onImported={onImported} onCancel={report ? () => setImporting(false) : undefined} />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <Overview
        report={report}
        projectedCGPA={hasPlannedGrades ? summary.cgpa : null}
        selectedTermIndex={tab === "terms" ? termIndex : null}
        onSelectTerm={showTerm}
        onUpdate={() => setImporting(true)}
        onClear={() => setConfirmClear(true)}
      />

      {report.warnings.length > 0 && (
        <Alert>
          <AlertDescription>
            {report.warnings.length === 1 ? "One row" : `${report.warnings.length} rows`} from AMS couldn&apos;t be read, so a course may be
            missing. Update from AMS to try again, or link it by hand.
          </AlertDescription>
        </Alert>
      )}

      <Tabs<PlannerTab> value={tab} onValueChange={changeTab} className="w-full gap-0">
        <TourStep
          id="cgpa-tabs"
          order={60}
          title="Three ways to plan"
          content="Terms is for this term's grades, Grade planner works out a course grade from your assessments, and Goals shows what you need for a target CGPA. Press 1, 2 or 3 to switch, or ? for every shortcut."
          position="bottom"
        >
          {/* The sliding highlight is the only active state, so nothing trails behind it. */}
          <TabsList
            activeClassName="rounded-md bg-primary shadow-none"
            className="mb-4 grid h-12 w-full grid-cols-3 gap-1 rounded-lg bg-muted"
          >
            {TABS.map(({ value, label, short, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:text-white data-[state=active]:hover:text-white sm:px-4"
              >
                <Icon className="mr-2 size-4 shrink-0" aria-hidden />
                <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </TourStep>

        <TabsContents data-tour-tab-settled={settledTab ?? undefined}>
          <TabsContent value="terms">
            {selectedTerm ? (
              <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-6">
                <TourStep
                  id="cgpa-terms"
                  order={70}
                  title="Pick a term"
                  content="Every term from AMS is here, newest first, including summer terms, semesters abroad and internships. Press [ or ] to move between them."
                  position="right"
                  onOpen={openPlannedTerm}
                  selector={inSettledTab("terms", '[data-tour-step="cgpa-terms"]')}
                  className="min-w-0"
                >
                  <TermRail terms={terms} selectedIndex={termIndex} onSelect={setTermIndex} />
                </TourStep>
                <TermPanel
                  key={selectedTerm.semester}
                  term={selectedTerm}
                  planApi={planApi}
                  retakeActions={{ onPickRetake: setRetakeFor, onUnlink: unlinkRetake, onRestore: restoreRetake }}
                  onTourOpen={openPlannedTerm}
                />
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="space-y-3 p-8 text-center">
                  <p className="text-sm text-muted-foreground">Your report has no terms yet. Paste a fresh copy from AMS.</p>
                  <Button onClick={() => setImporting(true)}>Update from AMS</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="grade-planner">
            <GradePlanner onTourOpen={() => setTab("grade-planner")} />
          </TabsContent>

          <TabsContent value="goals">
            <GoalCalculators
              standing={{
                cgpa: (hasPlannedGrades ? summary.cgpa : baseline.cgpa) ?? report.degreeCGPA,
                gpaCredits: hasPlannedGrades ? summary.totalGpaCredits : baseline.totalGpaCredits,
                gradePoints: hasPlannedGrades ? summary.totalGradePoints : baseline.totalGradePoints,
              }}
              includesPlan={hasPlannedGrades}
              onTourOpen={() => setTab("goals")}
            />
          </TabsContent>
        </TabsContents>
      </Tabs>

      <p className="hidden text-center text-xs text-muted-foreground md:block">
        Press <kbd className="font-mono">?</kbd> for keyboard shortcuts.
      </p>

      <RetakePicker terms={terms} forRef={retakeFor} onPick={linkRetake} onClose={() => setRetakeFor(null)} />
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove your saved grades?</DialogTitle>
            <DialogDescription>
              This deletes the AMS report saved to your account. You&apos;ll need to paste it again to use the planner.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="ghost" className="h-11 sm:h-9">Keep them</Button>
            </DialogClose>
            <Button className="h-11 bg-destructive text-white hover:bg-destructive/90 sm:h-9" onClick={() => void clearSaved()}>
              Remove grades
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
