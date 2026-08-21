import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  FileEdit,
  MessageSquare,
  Sparkles,
  XCircle,
  ArrowRight,
  ExternalLink,
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
  const form = application.form;
  if (!form) return null;

  const org = form.organisation;
  const role = application.role;
  const isDraft = application.state === 'draft';
  const isSubmitted = application.state === 'submitted';
  const appStatus = application.applicationStatus || 'pending';
  const currentRound = typeof application.currentRound === 'number' ? application.currentRound : 0;
  const interview = application.interviewDetails;

  // Extract interview booking link from message if present as fallback
  const interviewLinkMatch = application.statusMessage?.match(
    /\/platform\/inductions\/interviews\/[a-zA-Z0-9_-]+/i,
  );
  const resolvedInterviewUrl = interview?.bookingUrl || (interviewLinkMatch ? interviewLinkMatch[0] : null);

  const renderStatusBadge = () => {
    if (appStatus === 'advanced') {
      return (
        <Badge className="bg-green/15 text-green-dark dark:text-green-light border border-green/30 font-semibold gap-1 text-xs py-1">
          <Sparkles className="w-3.5 h-3.5" />
          Advanced · Round {currentRound + 1}
        </Badge>
      );
    }
    if (appStatus === 'approved') {
      return (
        <Badge className="bg-green/15 text-green-dark dark:text-green-light border border-green/30 font-semibold gap-1 text-xs py-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Selected / Approved
        </Badge>
      );
    }
    if (appStatus === 'rejected') {
      return (
        <Badge className="bg-destructive/15 text-destructive border border-destructive/30 font-semibold gap-1 text-xs py-1">
          <XCircle className="w-3.5 h-3.5" />
          Not Selected
        </Badge>
      );
    }
    if (isSubmitted) {
      return (
        <Badge className="bg-primary/10 text-primary border border-primary/20 font-semibold gap-1 text-xs py-1">
          <Clock className="w-3.5 h-3.5" />
          Submitted · Under Review
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs py-1">
        Draft
      </Badge>
    );
  };

  return (
    <div className="flex flex-col bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5 flex-grow space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {org?.profile_url ? (
              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                <Image src={org.profile_url} alt={org.name || 'Org'} width={40} height={40} className="object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                {org?.name ? org.name.substring(0, 2).toUpperCase() : '??'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-foreground line-clamp-1">{org?.name || 'Unknown Organization'}</h3>
                {role?.name && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-primary/30 text-primary font-semibold">
                    {role.name}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{form.title}</p>
            </div>
          </div>

          <div className="flex-shrink-0">{renderStatusBadge()}</div>
        </div>

        {/* Live Interview Scheduling Notification Banner */}
        {resolvedInterviewUrl && (
          <div
            className={`rounded-xl border p-3.5 space-y-2.5 ${
              interview?.isBooked
                ? 'bg-green/10 border-green/30'
                : 'bg-secondary/15 border-secondary/40'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    interview?.isBooked
                      ? 'bg-green/20 text-green-dark dark:text-green-light'
                      : 'bg-secondary/25 text-secondary-extradark dark:text-secondary'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {interview?.isBooked
                      ? `Interview Confirmed: ${interview.booking?.slotKey}`
                      : `${interview?.roundLabel || 'Interview Round'}: Schedule Your Slot`}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {interview?.isBooked
                      ? 'Your interview slot is confirmed on Google Calendar.'
                      : 'Select your preferred time slot and add it to your Google Calendar.'}
                  </p>
                </div>
              </div>

              <Button
                asChild
                size="sm"
                className={`text-xs font-bold gap-1 shrink-0 ${
                  interview?.isBooked
                    ? 'bg-background hover:bg-muted text-foreground border border-border'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                }`}
              >
                <Link href={resolvedInterviewUrl}>
                  {interview?.isBooked ? 'View Slot' : 'Book Slot'}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              Deadline:{' '}
              {form.endDate
                ? new Date(form.endDate).toLocaleDateString()
                : org?.induction_end
                ? new Date(org.induction_end).toLocaleDateString()
                : 'No deadline'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Last updated:{' '}
              {application.lastSavedAt
                ? new Date(application.lastSavedAt).toLocaleDateString()
                : application.submittedAt
                ? new Date(application.submittedAt).toLocaleDateString()
                : 'Recent'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between gap-3">
        <Link href={`/platform/forms/${form.uid}`} className="flex-1">
          <Button variant={isDraft ? 'default' : 'outline'} className="w-full h-9 gap-1.5 text-xs font-semibold">
            {isDraft ? <FileEdit className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
            {isDraft ? 'Resume Application' : 'View Form Submission'}
          </Button>
        </Link>

        {isSubmitted && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant={appStatus === 'advanced' ? 'default' : 'secondary'}
                className={`flex-1 h-9 gap-1.5 text-xs font-semibold ${
                  appStatus === 'advanced'
                    ? 'bg-green-dark hover:bg-green-dark/90 text-white dark:bg-green dark:text-black'
                    : ''
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                {appStatus === 'advanced' ? 'View Next Steps' : 'Check Update'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Application Update
                </DialogTitle>
                <DialogDescription>
                  Status update for your application to <span className="font-semibold text-foreground">{org?.name}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
                  <span className="text-xs font-medium text-muted-foreground">Evaluation Stage:</span>
                  <div>{renderStatusBadge()}</div>
                </div>

                <div className="rounded-xl bg-card p-4 border border-border space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    Message from {org?.name || 'Organization'}
                  </h4>

                  {application.statusMessage ? (
                    <div
                      className="text-xs text-foreground/90 leading-relaxed prose prose-sm dark:prose-invert max-w-none [&_a]:text-primary [&_a]:underline font-normal"
                      dangerouslySetInnerHTML={{ __html: application.statusMessage }}
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {appStatus === 'advanced'
                        ? 'Congratulations! You have been advanced to the next round of inductions. Check your email or schedule link for further instructions.'
                        : 'Your application has been received and is under review.'}
                    </p>
                  )}
                </div>

                {/* Direct Action for interview scheduling if available */}
                {resolvedInterviewUrl && (
                  <Button asChild className="w-full gap-2 font-bold bg-primary text-primary-foreground shadow-md py-5">
                    <Link href={resolvedInterviewUrl}>
                      <Calendar className="w-4 h-4" />
                      {interview?.isBooked ? 'View Confirmed Interview Slot' : 'Schedule Interview Slot Now'}
                      <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                    </Link>
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
