"use client";

import { useId, useState } from "react";
import { ClipboardPaste, X } from "lucide-react";
import { toast } from "sonner";
import { TourStep } from "@/components/guided-tour";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useIsMac } from "@/hooks/useIsMac";
import { haptic } from "@/lib/haptics";
import type { ParsedCGPAData } from "@/lib/cgpa/types";

type SaveResponse = { success?: boolean; data?: ParsedCGPAData; error?: string };

const STEPS = [
  "Open AMS and go to Grades and Evaluations, then My Course Report.",
  "Select the whole page (Ctrl+A, or Cmd+A on a Mac) and copy it.",
  "Paste it below. Everything is read on our server and saved to your account.",
];

/**
 * Paste box for the AMS course report. The text goes to the API as-is; parsing happens
 * on the server so every client of the route gets the same result.
 */
export function ImportForm({
  onImported,
  onCancel,
}: {
  onImported: (report: ParsedCGPAData) => void;
  /** Present when there is already a saved report to go back to. */
  onCancel?: () => void;
}) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMac = useIsMac();
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const empty = !text.trim();

  const submit = async () => {
    if (empty || saving) return;
    void haptic.press();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/platform/cgpa-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const result = (await response.json().catch(() => null)) as SaveResponse | null;
      if (!response.ok || !result?.success || !result.data) {
        throw new Error(result?.error ?? "Your report didn't save. Try again.");
      }
      void haptic.confirm();
      const { semesters, warnings } = result.data;
      const courseCount = semesters.reduce((sum, term) => sum + term.courses.length, 0);
      toast.success(`Imported ${semesters.length} terms and ${courseCount} courses.`);
      if (warnings.length > 0) {
        toast.warning(`${warnings.length} row${warnings.length === 1 ? "" : "s"} couldn't be read. Check the terms list for anything missing.`);
      }
      onImported(result.data);
    } catch (err) {
      void haptic.error();
      setError(err instanceof Error ? err.message : "Your report didn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mx-auto max-w-4xl">
      <CardContent className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-left text-xl font-bold">Import your grades from AMS</h2>
            <p className="mt-1 text-sm text-muted-foreground">You only need to do this once a term, after grades come out.</p>
          </div>
          {onCancel && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Back to the planner without importing"
              onClick={() => {
                void haptic.tap();
                onCancel();
              }}
            >
              <X />
            </Button>
          )}
        </div>

        <ol className="grid gap-3 text-sm sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step} className="flex gap-3 rounded-lg border border-border bg-background/60 p-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {index + 1}
              </span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>

        <TourStep
          id="cgpa-import-paste"
          order={10}
          title="Paste your AMS report"
          content="Open My Course Report on AMS, select the whole page and copy it. Paste everything here, menus and all, and we pick out the grades."
          position="top"
          className="space-y-2"
        >
          <Label htmlFor={fieldId}>AMS course report</Label>
          <Textarea
            id={fieldId}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                void submit();
              }
            }}
            placeholder="Paste the whole My Course Report page here"
            rows={12}
            spellCheck={false}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="max-h-[50vh] resize-y font-mono text-sm"
          />
          {error && (
            <p id={errorId} role="alert" className="text-sm text-destructive-text">
              {error}
            </p>
          )}
        </TourStep>

        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {empty ? "Paste your report to continue." : `Press ${isMac ? "⌘" : "Ctrl"}+Enter to import.`}
          </p>
          <TourStep
            id="cgpa-import-submit"
            order={20}
            title="Import your grades"
            content="Press Import grades to save the report to your account. You only need to do this again when new grades come out."
            position="top"
          >
            <Button onClick={() => void submit()} disabled={empty || saving} size="lg" aria-busy={saving} className="w-full sm:w-auto">
              {saving ? <Spinner /> : <ClipboardPaste />}
              {saving ? "Importing..." : "Import grades"}
            </Button>
          </TourStep>
        </div>
      </CardContent>
    </Card>
  );
}
