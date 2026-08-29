'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ClockPlus,
  FileEdit,
  FileText,
  MessageSquare,
  XCircle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  MapPin,
  FileCheck,
  AlertTriangle,
  Send,
  Loader2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PopulatedResponseRecord } from '@/lib/forms/strapi-forms';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  isGrievanceSubmitted,
  checkGrievanceSubmittedAsync,
  recordGrievanceSubmission,
} from '@/lib/inductions/grievance-cache';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ApplicationCardProps {
  application: PopulatedResponseRecord;
  onDeleted?: (id: number | string) => void;
}

export function ApplicationCard({ application, onDeleted }: ApplicationCardProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isDeleted, setIsDeleted] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);
  const [grievanceOpen, setGrievanceOpen] = React.useState(false);
  const [grievanceSubject, setGrievanceSubject] = React.useState('');
  const [grievanceBody, setGrievanceBody] = React.useState('');
  const [grievanceLoading, setGrievanceLoading] = React.useState(false);
  const [grievanceError, setGrievanceError] = React.useState<string | null>(null);

  async function handleDeleteDraft() {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/platform/inductions/applications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseId: application.id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete draft');
      }
      toast.success('Draft application permanently deleted');
      setIsDeleted(true);
      setDeleteDialogOpen(false);
      onDeleted?.(application.id);
    } catch (err: any) {
      toast.error(err.message || 'Could not delete draft');
    } finally {
      setIsDeleting(false);
    }
  }
  
  // Initialize immediately from fast-tier cache (LocalStorage / Cookies)
  const [grievanceSent, setGrievanceSent] = React.useState(() =>
    isGrievanceSubmitted(application.id),
  );

  // Deep-check across all storage tiers (IndexedDB + self-healing) on mount
  React.useEffect(() => {
    let isMounted = true;
    checkGrievanceSubmittedAsync(application.id).then((record) => {
      if (isMounted && record) {
        setGrievanceSent(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [application.id]);

  async function handleGrievanceSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!grievanceSubject.trim() || !grievanceBody.trim()) return;
    setGrievanceLoading(true);
    setGrievanceError(null);
    try {
      const res = await fetch('/api/platform/inductions/grievance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: application.id,
          subject: grievanceSubject.trim(),
          body: grievanceBody.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Something went wrong');
      }
      
      // Persist across all 3 tiers (LocalStorage, Cookie, IndexedDB) with anti-eviction protection
      await recordGrievanceSubmission(application.id, {
        subject: grievanceSubject.trim(),
      });
      setGrievanceSent(true);
    } catch (err: any) {
      setGrievanceError(err.message || 'Failed to submit grievance');
    } finally {
      setGrievanceLoading(false);
    }
  }

  const form = application.form;
  if (!form || isDeleted) return null;

  const org = form.organisation;
  const role = application.role;
  const isDraft = application.state === 'draft';
  const isSubmitted = application.state === 'submitted';
  const appStatus = application.applicationStatus || 'pending';
  const currentRound = typeof application.currentRound === 'number' ? application.currentRound : 0;
  const interview = application.interviewDetails;
  const targetForm = application.formDetails;

  const logoUrl = org?.profile_url || (org as any)?.logoUrl || '';

  // Extract interview booking link from message if present as fallback
  const interviewLinkMatch = application.statusMessage?.match(
    /\/platform\/inductions?\/interviews\/[a-zA-Z0-9_-]+/i,
  );
  let resolvedInterviewUrl = interview?.bookingUrl || (interviewLinkMatch ? interviewLinkMatch[0] : null);
  if (resolvedInterviewUrl && resolvedInterviewUrl.includes('/platform/induction/')) {
    resolvedInterviewUrl = resolvedInterviewUrl.replace('/platform/induction/', '/platform/inductions/');
  }

  // Normalize any singular induction path in the stored status message so HTML links render correctly
  const normalizedStatusMessage = application.statusMessage
    ? application.statusMessage.replace(/\/platform\/induction\/interviews\//g, '/platform/inductions/interviews/')
    : '';

  const deadlineStr = form.endDate || org?.induction_end;
  const deadline = deadlineStr ? new Date(deadlineStr) : null;
  const isDeadlineSoon = deadline && deadline > new Date() && deadline.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;

  const renderStatusBadge = () => {
    const isFinalRound = currentRound >= (application.pipeline?.length || 1) - 1;
    const currentRoundLabel = application.pipeline?.[currentRound]?.label || `Round ${currentRound + 1}`;

    if (appStatus === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 shadow-2xs">
          <XCircle className="w-3.5 h-3.5" />
          <span>Not Selected</span>
        </span>
      );
    }
    if (appStatus === 'approved') {
      if (isFinalRound) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Selected</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Passed {currentRound > 0 ? `· ${currentRoundLabel}` : ''}</span>
        </span>
      );
    }
    if (appStatus === 'advanced') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{currentRound > 0 ? `In Progress · ${currentRoundLabel}` : 'Advanced'}</span>
        </span>
      );
    }
    if (isSubmitted) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 shadow-2xs">
          <Clock className="w-3.5 h-3.5" />
          <span>{currentRound > 0 ? `In Progress · ${currentRoundLabel}` : 'Under Review'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-2xs">
        <FileEdit className="w-3.5 h-3.5" />
        <span>Draft</span>
      </span>
    );
  };

  return (
    <div
      data-tour="tour-app-card"
      className="flex flex-col bg-card rounded-2xl border border-border/80 hover:border-border hover:shadow-md transition-all duration-200 overflow-hidden group text-left"
    >
      {/* Top Header Card */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
        <div className="text-left w-full">
          {/* Header Row: Org avatar, title, status pill */}
          <div className="flex items-start justify-between gap-3 mb-3 text-left w-full" style={{ textAlign: 'left' }}>
            <div className="flex items-center gap-3 min-w-0 flex-1 text-left" style={{ textAlign: 'left' }}>
              <div className="w-12 h-12 rounded-full bg-red-900 flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden shadow-xs">
                {logoUrl && !logoError ? (
                  <img
                    src={logoUrl}
                    alt={org?.name || 'Org'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  (org?.name?.charAt(0) || '?').toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1 text-left" style={{ textAlign: 'left' }}>
                <h3
                  className="font-semibold text-base text-foreground truncate group-hover:text-primary transition-colors !text-left text-left"
                  style={{ textAlign: 'left' }}
                >
                  {org?.name || 'Organization'}
                </h3>
                <div className="flex items-center justify-start gap-1.5 flex-wrap mt-0.5 text-left" style={{ textAlign: 'left' }}>
                  {role?.name ? (
                    <Badge variant="secondary" className="text-[11px] py-0 px-2 font-medium bg-secondary/80 text-foreground !text-left text-left">
                      {role.name}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground truncate text-left">{form.title}</span>
                  )}
                  {org?.type && (
                    <span className="text-[11px] text-muted-foreground/80 capitalize text-left">
                      · {org.type}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0">{renderStatusBadge()}</div>
          </div>

          {/* If there's a role and a separate form title, show it cleanly */}
          {role?.name && form.title && (
            <p className="text-xs text-muted-foreground line-clamp-1 mb-2 !text-left text-left" style={{ textAlign: 'left' }}>
              Form: {form.title}
            </p>
          )}

          {/* Action Required Callout: Interview Scheduling */}
          {resolvedInterviewUrl && (
            <div
              className={`mt-3 rounded-xl border p-3.5 transition-all text-left ${
                interview?.isBooked
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/25 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0 text-left">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      interview?.isBooked
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200'
                        : 'bg-primary text-primary-foreground shadow-2xs'
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-1.5 text-left">
                      <h4 className="text-xs font-bold text-foreground text-left">
                        {interview?.isBooked
                          ? 'Interview Confirmed'
                          : `${interview?.roundLabel || 'Next Round'}: Select Time Slot`}
                      </h4>
                      {!interview?.isBooked && (
                        <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 text-left">
                      {interview?.isBooked
                        ? `Slot: ${interview.booking?.slotKey}`
                        : `30-min interview · Select slot to sync with Google Calendar`}
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  size="sm"
                  className={`h-7 px-2.5 text-xs font-semibold gap-1 shrink-0 ${
                    interview?.isBooked
                      ? 'bg-background hover:bg-muted text-foreground border border-border shadow-2xs'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs'
                  }`}
                >
                  <Link href={resolvedInterviewUrl}>
                    {interview?.isBooked ? 'Details' : 'Book'}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Action Required Callout: Form Submission for Current Round */}
          {targetForm && (
            <div
              className={`mt-3 rounded-xl border p-3.5 transition-all text-left ${
                targetForm.isCompleted
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/25 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0 text-left">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      targetForm.isCompleted
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200'
                        : 'bg-primary text-primary-foreground shadow-2xs'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-1.5 text-left">
                      <h4 className="text-xs font-bold text-foreground text-left">
                        {targetForm.isCompleted
                          ? `${targetForm.roundLabel || 'Round Form'}: Submitted`
                          : `${targetForm.roundLabel || 'Next Round'}: Complete Form`}
                      </h4>
                      {!targetForm.isCompleted && (
                        <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 text-left">
                      {targetForm.isCompleted
                        ? 'Your response has been submitted for this stage.'
                        : targetForm.description || 'Please fill out and submit the required questionnaire for this stage.'}
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  size="sm"
                  className={`h-7 px-2.5 text-xs font-semibold gap-1 shrink-0 ${
                    targetForm.isCompleted
                      ? 'bg-background hover:bg-muted text-foreground border border-border shadow-2xs'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs'
                  }`}
                >
                  <Link href={targetForm.formUrl}>
                    {targetForm.isCompleted ? 'View' : targetForm.isDraft ? 'Resume' : 'Fill Form'}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Org Note / Status message snippet preview if present */}
          {normalizedStatusMessage && !resolvedInterviewUrl && !targetForm && (
            <div className="mt-3 rounded-xl bg-muted/40 border border-border/60 p-3 text-xs text-muted-foreground flex items-start gap-2 text-left">
              <MessageSquare className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <p className="line-clamp-2 italic text-foreground/80 text-left">
                &ldquo;{normalizedStatusMessage.replace(/<[^>]*>?/gm, '')}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Card Metadata (Dates & Status) */}
        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          {isDraft ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span className={isDeadlineSoon ? 'font-semibold text-amber-600 dark:text-amber-400' : ''}>
                {deadline ? `Due ${deadline.toLocaleDateString()}` : 'No deadline'}
              </span>
              {(application.deadlineExtension || (org as any)?.deadlineExtension) && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] py-0 px-1.5 font-semibold gap-1">
                  <ClockPlus className="w-2.5 h-2.5 text-amber-500" />
                  Extended
                </Badge>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                {application.submittedAt
                  ? `Submitted ${new Date(application.submittedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}`
                  : 'Submitted'}
              </span>
              {(application.deadlineExtension || (org as any)?.deadlineExtension) && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] py-0 px-1.5 font-semibold gap-1">
                  <ClockPlus className="w-2.5 h-2.5 text-amber-500" />
                  Extended
                </Badge>
              )}
            </div>
          )}

          <span className="text-[11px]">
            {application.lastSavedAt
              ? `Saved ${new Date(application.lastSavedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}`
              : ''}
          </span>
        </div>
      </div>

      {/* Footer Actions: Strictly tailored to state */}
      <div className="px-5 py-3.5 bg-muted/30 border-t border-border/70 flex items-center justify-between gap-3">
        {isDraft ? (
          <div className="flex items-center gap-2 w-full">
            {form.status === 'active' ? (
              <Button asChild className="flex-1 h-9 gap-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs">
                <Link href={`/platform/forms/${form.uid}`}>
                  <FileEdit className="w-3.5 h-3.5" />
                  Resume Application
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </Link>
              </Button>
            ) : (
              <Button disabled variant="outline" className="flex-1 h-9 gap-2 text-xs font-semibold text-muted-foreground opacity-60 cursor-not-allowed">
                <FileEdit className="w-3.5 h-3.5" />
                Form Not Active
              </Button>
            )}

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive rounded-xl"
                  title="Delete Draft Application"
                  aria-label="Delete draft application"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-2xl text-left">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-left font-bold text-base flex items-center gap-2 text-destructive">
                    <Trash2 className="h-4 w-4" />
                    Delete Draft Application?
                  </DialogTitle>
                  <DialogDescription className="text-left text-xs pt-1">
                    Are you sure you want to delete your draft application for <span className="font-semibold text-foreground">{form.organisation?.name || 'this organization'}</span>? This will permanently delete your saved answers from Strapi and cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setDeleteDialogOpen(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="text-xs gap-1.5"
                    onClick={handleDeleteDraft}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting…
                      </>
                    ) : (
                      'Yes, Delete Draft'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          /* ── Submitted footer ─────────────────────────────────────────── */
          <div className="flex flex-col gap-2 w-full">
            {/* Primary CTA: resume form for current round */}
            {targetForm && !targetForm.isCompleted && (
              <Button asChild className="w-full h-9 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs">
                <Link href={targetForm.formUrl}>
                  <FileText className="w-3.5 h-3.5" />
                  {targetForm.isDraft ? 'Resume' : 'Complete'} {targetForm.roundLabel || 'Round Form'}
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </Link>
              </Button>
            )}

            {/* Primary CTA: book interview slot */}
            {resolvedInterviewUrl && !interview?.isBooked && !targetForm && (
              <Button asChild className="w-full h-9 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs">
                <Link href={resolvedInterviewUrl}>
                  <Calendar className="w-3.5 h-3.5" />
                  Book Interview Slot
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </Link>
              </Button>
            )}

            {/* Status / Details dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                {(targetForm && !targetForm.isCompleted) || (resolvedInterviewUrl && !interview?.isBooked && !targetForm) ? (
                  <Button variant="outline" className="h-9 px-3 text-xs font-semibold border-border/80 hover:bg-background w-full">
                    <MessageSquare className="w-3.5 h-3.5 mr-1 text-primary" />
                    Details
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className={`w-full h-9 gap-1.5 text-xs font-semibold justify-between border-border/80 hover:bg-background transition-colors ${
                      appStatus === 'advanced'
                        ? 'border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                        : ''
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-primary" />
                      {appStatus === 'advanced'
                        ? 'View Round Updates & Feedback'
                        : appStatus === 'approved'
                        ? 'View Acceptance Details'
                        : appStatus === 'rejected'
                        ? 'View Application Outcome'
                        : 'Check Status & Notes'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </Button>
                )}
              </DialogTrigger>

              <DialogContent className="sm:max-w-lg rounded-2xl text-left">
                <DialogHeader className="text-left">
                  <div className="flex items-center gap-3 mb-1 text-left">
                    <div className="w-10 h-10 rounded-full bg-red-900 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden shadow-xs">
                      {logoUrl && !logoError ? (
                        <img
                          src={logoUrl}
                          alt={org?.name || 'Org'}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={() => setLogoError(true)}
                        />
                      ) : (
                        (org?.name?.charAt(0) || '?').toUpperCase()
                      )}
                    </div>
                    <div className="text-left">
                      <DialogTitle className="text-lg font-bold text-left">{org?.name || 'Organization'}</DialogTitle>
                      <DialogDescription className="text-xs text-left">
                        Application for {role?.name || form.title}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  {/* Stage Evaluation Badge */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/50 border border-border">
                    <div className="space-y-0.5">
                      <span className="text-xs font-medium text-muted-foreground">Current Stage</span>
                      <p className="text-sm font-semibold text-foreground capitalize">
                        {appStatus === 'advanced'
                          ? `Round ${currentRound + 1}: In Progress`
                          : appStatus === 'approved'
                          ? 'Inductions Completed'
                          : appStatus === 'rejected'
                          ? 'Recruitment Concluded'
                          : 'Application Under Review'}
                      </p>
                    </div>
                    <div>{renderStatusBadge()}</div>
                  </div>

                  {/* Live Form Submission Direct Box */}
                  {targetForm && (
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-2xs">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-foreground">
                            {targetForm.isCompleted
                              ? `${targetForm.roundLabel || 'Round Form'}: Submitted`
                              : `${targetForm.roundLabel || 'Next Round'}: Required Form`}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {targetForm.isCompleted
                              ? 'You have already submitted the questionnaire for this stage.'
                              : targetForm.description || 'Please complete and submit the required questionnaire for this round.'}
                          </p>
                          {targetForm.deadline && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                              <Calendar className="w-3.5 h-3.5 text-primary" />
                              <span>Due {new Date(targetForm.deadline).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button asChild className="w-full gap-2 font-semibold bg-primary text-primary-foreground shadow-xs">
                        <Link href={targetForm.formUrl}>
                          <FileText className="w-4 h-4" />
                          {targetForm.isCompleted ? 'View Form Response' : targetForm.isDraft ? 'Resume Form' : 'Fill Round Form'}
                          <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                        </Link>
                      </Button>
                    </div>
                  )}

                  {/* Live Interview Scheduling Direct Box */}
                  {resolvedInterviewUrl && (
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-2xs">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-foreground">
                            {interview?.isBooked ? 'Interview Slot Confirmed' : 'Interview Round Schedule'}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {interview?.isBooked
                              ? `You are scheduled for: ${interview.booking?.slotKey}`
                              : "Please choose an interview slot from the organizer's schedule."}
                          </p>
                          {interview?.location && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              <span>{interview.location}</span>
                              {interview.slotDuration && <span>· {interview.slotDuration} mins</span>}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button asChild className="w-full gap-2 font-semibold bg-primary text-primary-foreground shadow-xs">
                        <Link href={resolvedInterviewUrl}>
                          <Calendar className="w-4 h-4" />
                          {interview?.isBooked ? 'View Confirmed Slot' : 'Select Interview Slot'}
                          <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                        </Link>
                      </Button>
                    </div>
                  )}

                  {/* Message / Decision note */}
                  <div className="rounded-xl bg-card p-4 border border-border space-y-2">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
                      <MessageSquare className="w-3.5 h-3.5 text-primary" />
                      Message from {org?.name || 'Recruitment Team'}
                    </h4>
                    {normalizedStatusMessage ? (
                      <div
                        className="text-xs text-foreground/90 leading-relaxed prose prose-sm dark:prose-invert max-w-none [&_a]:text-primary [&_a]:underline"
                        dangerouslySetInnerHTML={{ __html: normalizedStatusMessage }}
                      />
                    ) : (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {appStatus === 'advanced'
                          ? 'Congratulations! You have been advanced to the next round of inductions. Check your calendar or booking link for details.'
                          : appStatus === 'approved'
                          ? 'Congratulations! You have been accepted to the organization. The core team will reach out with onboarding details.'
                          : appStatus === 'rejected'
                          ? 'Thank you for your time and effort in applying. While we cannot offer you a position at this time, we encourage you to apply again in future cycles.'
                          : 'Your submission has been received and is actively being reviewed by the induction team.'}
                      </p>
                    )}
                  </div>

                  {/* Submission summary info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pt-1">
                    <span>
                      Submitted on{' '}
                      {application.submittedAt
                        ? new Date(application.submittedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Recent'}
                    </span>
                    <Link
                      href={`/platform/forms/${form.uid}`}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      View submitted form
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Grievance button — full-width row below the status button, only for rejected */}
            {appStatus === 'rejected' && (
              <Dialog
                open={grievanceOpen}
                onOpenChange={(open) => {
                  setGrievanceOpen(open);
                  if (!open && !grievanceSent) {
                    setGrievanceSubject('');
                    setGrievanceBody('');
                    setGrievanceError(null);
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-9 gap-1.5 text-xs font-semibold border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {grievanceSent ? 'Grievance Submitted ✓' : 'Raise a Grievance'}
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-lg rounded-2xl text-left">
                  <DialogHeader className="text-left">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <DialogTitle className="text-lg font-bold">We&apos;re Sorry — Raise a Grievance</DialogTitle>
                        <DialogDescription className="text-xs">
                          {org?.name || 'Organization'} · {role?.name || form.title}
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  {grievanceSent ? (
                    <div className="py-6 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                        <Send className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Your Grievance Has Been Received 💛</p>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                        We&apos;ve forwarded your grievance to{' '}
                        <span className="font-medium">the Cultural Ministry</span> — you&apos;re CC&apos;d so
                        you can track the conversation directly. We&apos;ve also emailed you a complete
                        copy of your application record for your reference.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setGrievanceOpen(false)}
                      >
                        Close
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleGrievanceSubmit} className="space-y-4 py-2">
                      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 p-3.5 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                        <p className="font-semibold mb-1">We&apos;re sorry you&apos;re going through this.</p>
                        <p className="mb-2">
                          If you feel the outcome of your application was unfair or unclear, we
                          encourage you to raise a grievance — your concerns will be taken seriously.
                        </p>
                        <p className="font-medium">When you submit:</p>
                        <ol className="list-decimal list-inside mt-1 space-y-1">
                          <li>You&apos;ll receive a full copy of your application record (all form responses, round details, and interview info) by email.</li>
                          <li>Your grievance will be sent to the Cultural Ministry — you&apos;ll be CC&apos;d so you can track replies directly.</li>
                        </ol>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="grievance-subject" className="text-xs font-semibold">
                          Subject
                        </Label>
                        <Input
                          id="grievance-subject"
                          placeholder="e.g. Grievance regarding induction outcome for Design Team"
                          value={grievanceSubject}
                          onChange={(e) => setGrievanceSubject(e.target.value)}
                          maxLength={150}
                          required
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="grievance-body" className="text-xs font-semibold">
                          Reason / Statement
                        </Label>
                        <Textarea
                          id="grievance-body"
                          placeholder="Describe your grievance clearly. Include any relevant context, dates, or interactions that support your case."
                          value={grievanceBody}
                          onChange={(e) => setGrievanceBody(e.target.value)}
                          rows={5}
                          maxLength={2000}
                          required
                          className="text-sm resize-none"
                        />
                        <p className="text-[11px] text-muted-foreground text-right">
                          {grievanceBody.length}/2000
                        </p>
                      </div>

                      {grievanceError && (
                        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                          {grievanceError}
                        </p>
                      )}

                      <div className="flex gap-2 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 h-9 text-xs font-semibold"
                          onClick={() => setGrievanceOpen(false)}
                          disabled={grievanceLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 h-9 gap-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                          disabled={
                            grievanceLoading ||
                            !grievanceSubject.trim() ||
                            !grievanceBody.trim()
                          }
                        >
                          {grievanceLoading ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting…</>
                          ) : (
                            <><Send className="w-3.5 h-3.5" /> Submit Grievance</>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
