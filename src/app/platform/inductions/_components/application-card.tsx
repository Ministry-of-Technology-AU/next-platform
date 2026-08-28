'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Info,
  MapPin,
  Timer,
  FileCheck,
} from 'lucide-react';
import { PopulatedResponseRecord } from '@/lib/forms/strapi-forms';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);
  const form = application.form;
  if (!form) return null;

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
                "{normalizedStatusMessage.replace(/<[^>]*>?/gm, '')}"
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
          form.status === 'active' ? (
            <Button asChild className="w-full h-9 gap-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs">
              <Link href={`/platform/forms/${form.uid}`}>
                <FileEdit className="w-3.5 h-3.5" />
                Resume Application
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </Link>
            </Button>
          ) : (
            <Button disabled variant="outline" className="w-full h-9 gap-2 text-xs font-semibold text-muted-foreground opacity-60 cursor-not-allowed">
              <FileEdit className="w-3.5 h-3.5" />
              Form Not Active
            </Button>
          )
        ) : (
          <div className="flex items-center gap-2 w-full">
            {targetForm && !targetForm.isCompleted && (
              <Button asChild className="flex-1 h-9 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs">
                <Link href={targetForm.formUrl}>
                  <FileText className="w-3.5 h-3.5" />
                  {targetForm.isDraft ? 'Resume' : 'Complete'} {targetForm.roundLabel || 'Round Form'}
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </Link>
              </Button>
            )}
            {resolvedInterviewUrl && !interview?.isBooked && !targetForm && (
              <Button asChild className="flex-1 h-9 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs">
                <Link href={resolvedInterviewUrl}>
                  <Calendar className="w-3.5 h-3.5" />
                  Book Interview Slot
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </Link>
              </Button>
            )}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                {(targetForm && !targetForm.isCompleted) || (resolvedInterviewUrl && !interview?.isBooked && !targetForm) ? (
                  <Button variant="outline" className="h-9 px-3 text-xs font-semibold border-border/80 hover:bg-background shrink-0">
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

                  {/* Live Form Submission Direct Box if available */}
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

                  {/* Live Interview Scheduling Direct Box if available */}
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
                              : 'Please choose an interview slot from the organizer’s schedule.'}
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
        </div>
      )}
    </div>
  </div>
);
}

