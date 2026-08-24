'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Users,
  Clock,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  XCircle,
  Loader2,
  Filter,
  Calendar,
  RefreshCw,
  ClipboardList,
  Eye,
  MoreVertical,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import type { PipelineRound, InterviewBooking } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ApplicantStatus =
  | 'pending'
  | 'submitted'
  | 'advanced'     // proceeded to next round
  | 'approved'     // final selection / passed
  | 'rejected';

export interface ApplicantRow {
  id: string;
  email: string;
  name: string | null;
  submittedAt: string | null;
  status: ApplicantStatus;
  currentRound: number; // 0-indexed round number
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<ApplicantStatus, { label: string; className: string }> = {
  pending: {
    label: 'Under Review',
    className: 'bg-blue/10 text-blue-dark dark:text-blue-light border-blue/20',
  },
  submitted: {
    label: 'Submitted',
    className: 'bg-blue/10 text-blue-dark dark:text-blue-light border-blue/20',
  },
  advanced: {
    label: 'Advanced',
    className: 'bg-green/15 text-green-dark dark:text-green-light border-green/20',
  },
  approved: {
    label: 'Selected',
    className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

// Placeholder applicants spread across rounds (submitted applicants only)
const PLACEHOLDER_APPLICANTS: ApplicantRow[] = [
  {
    id: '1',
    email: 'priya.sharma@ashoka.edu.in',
    name: 'Priya Sharma',
    submittedAt: '2026-08-18T14:30:00Z',
    status: 'submitted',
    currentRound: 0,
  },
  {
    id: '2',
    email: 'arjun.mehta@ashoka.edu.in',
    name: 'Arjun Mehta',
    submittedAt: '2026-08-17T10:15:00Z',
    status: 'advanced',
    currentRound: 1,
  },
  {
    id: '3',
    email: 'sneha.kapoor@ashoka.edu.in',
    name: 'Sneha Kapoor',
    submittedAt: '2026-08-17T13:00:00Z',
    status: 'submitted',
    currentRound: 0,
  },
  {
    id: '4',
    email: 'ananya.verma@ashoka.edu.in',
    name: 'Ananya Verma',
    submittedAt: '2026-08-16T09:45:00Z',
    status: 'rejected',
    currentRound: 0,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function avatarInitial(applicant: ApplicantRow): string {
  return (applicant.name || applicant.email).charAt(0).toUpperCase();
}

// ─── Action Dialog ────────────────────────────────────────────────────────────

interface ActionDialogProps {
  applicant: ApplicantRow | null;
  type: 'proceed' | 'reject';
  isLastRound?: boolean;
  nextRound?: PipelineRound | null;
  onClose: () => void;
  onConfirm: (applicant: ApplicantRow, sendEmail: boolean, content: string) => void;
}

function ActionDialog({ applicant, type, isLastRound = false, nextRound, onClose, onConfirm }: ActionDialogProps) {
  const [editorContent, setEditorContent] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const isProceed = type === 'proceed';

  const defaultContent = useMemo(() => {
    if (!isProceed) {
      return `<p>Dear ${applicant?.name || 'Applicant'},</p><p>Thank you for your interest and time in applying. After careful consideration, we regret to inform you that you have not been selected to proceed further at this time.</p><p>We appreciate your effort and encourage you to apply again in the future.</p><p>Best regards,<br/>The Inductions Team</p>`;
    }

    if (isLastRound || !nextRound) {
      return `<p>Dear ${applicant?.name || 'Applicant'},</p><p>Congratulations! We are delighted to inform you that you have been selected for this role.</p><p>We look forward to welcoming you to the team.</p><p>Warm regards,<br/>The Inductions Team</p>`;
    }

    const roundName = nextRound?.label || 'next round';
    const isInterview = nextRound?.type === 'interview';

    let bookingUrlHtml = '';
    if (isInterview && nextRound) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const scheduleUrl = `${origin}/platform/inductions/interviews/${nextRound.id}`;
      bookingUrlHtml = `<p><strong>Next Step:</strong> Please schedule your interview slot using the link below:</p><p><a href="${scheduleUrl}">${scheduleUrl}</a></p><p><em>Note: Please do not modify the pre-filled Google Calendar event title or host invitees.</em></p>`;
    }

    return `<p>Dear ${applicant?.name || 'Applicant'},</p><p>Congratulations! We are pleased to inform you that you have been selected to proceed to <strong>${roundName}</strong> in our induction process.</p>${bookingUrlHtml}<p>We look forward to meeting you.</p><p>Warm regards,<br/>The Inductions Team</p>`;
  }, [isProceed, isLastRound, applicant, nextRound]);

  const handleOpen = () => {
    setEditorContent(defaultContent);
    setSendEmail(true);
  };

  const handleConfirm = async () => {
    if (!applicant) return;
    setLoading(true);
    try {
      if (sendEmail) {
        await new Promise((r) => setTimeout(r, 600)); // simulate
        toast.success(`Email sent to ${applicant.email}`);
      }
      onConfirm(applicant, sendEmail, editorContent);
      onClose();
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={!!applicant}
      onOpenChange={(open) => {
        if (!open) onClose();
        else handleOpen();
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isProceed ? (
              isLastRound ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Final Selection / Accept Candidate
                </>
              ) : (
                <>
                  <ArrowRight className="h-5 w-5 text-green-dark dark:text-green-light" />
                  Proceed to Next Round ({nextRound?.label || 'Next Round'})
                </>
              )
            ) : (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                Reject Applicant
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isProceed
              ? isLastRound
                ? `You are selecting ${applicant?.name || applicant?.email} for this role.`
                : `You are advancing ${applicant?.name || applicant?.email} to ${nextRound?.label || 'the next round'}.`
              : `You are rejecting ${applicant?.name || applicant?.email}'s application.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Applicant badge */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
              {applicant ? avatarInitial(applicant) : '?'}
            </div>
            <div>
              <p className="text-sm font-medium !text-left">{applicant?.name || 'Unknown'}</p>
              <p className="text-xs text-muted-foreground !text-left">{applicant?.email}</p>
            </div>
          </div>

          {/* Rich text editor */}
          <div className="space-y-2">
            <Label>{isProceed ? (isLastRound ? 'Acceptance Email / Message Content' : 'Email / Message Content') : 'Rejection Reason / Email Content'}</Label>
            <RichTextEditor
              value={editorContent}
              onChange={setEditorContent}
              placeholder={
                isProceed
                  ? isLastRound
                    ? 'Write an acceptance message to send to the candidate...'
                    : 'Write a message to send to the applicant...'
                  : 'Provide a reason for rejection or a message to send...'
              }
              className="min-h-[180px]"
            />
          </div>

          {/* Send email checkbox */}
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <Checkbox
              id="send-email-checkbox"
              checked={sendEmail}
              onCheckedChange={(checked) => setSendEmail(!!checked)}
            />
            <div>
              <Label htmlFor="send-email-checkbox" className="cursor-pointer text-sm font-medium">
                Send email to applicant
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {sendEmail
                  ? `An email will be sent to ${applicant?.email}`
                  : 'The applicant will not receive an email notification'}
              </p>
            </div>
            <Mail className="ml-auto h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleConfirm()}
            disabled={loading}
            className={`gap-1.5 ${
              isProceed
                ? isLastRound
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-green-dark hover:bg-green-dark/90 text-white dark:bg-green dark:text-black'
                : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
            }`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isProceed ? (isLastRound ? 'Confirm & Select' : 'Confirm & Advance') : 'Confirm & Reject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function RoleApplicants({
  roleId,
  cycleId,
  applicants: initialApplicants = [],
  roundLabels = ['Application Form'],
  pipeline = [],
  primaryFormId,
}: {
  roleId?: string;
  cycleId?: string;
  applicants?: ApplicantRow[];
  roundLabels?: string[];
  pipeline?: PipelineRound[];
  primaryFormId?: string | null;
}) {
  const [applicants, setApplicants] = useState<ApplicantRow[]>(initialApplicants);
  const [roundFilter, setRoundFilter] = useState<number | 'all'>('all');
  const [actionTarget, setActionTarget] = useState<ApplicantRow | null>(null);
  const [actionType, setActionType] = useState<'proceed' | 'reject'>('proceed');

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setApplicants(initialApplicants);
  }, [initialApplicants]);

  const handleRefresh = async () => {
    if (!roleId) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/organisations/inductions/roles/${roleId}/applicants`, {
        cache: 'no-store',
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.success && Array.isArray(json.data)) {
        setApplicants(json.data);
        toast.success(`Refreshed: ${json.data.length} applicants found`);
      }
    } catch {
      toast.error('Could not refresh applicants list');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Round filter counts
  const roundCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const a of applicants) {
      counts[a.currentRound] = (counts[a.currentRound] || 0) + 1;
    }
    return counts;
  }, [applicants]);

  const filtered = useMemo(
    () =>
      roundFilter === 'all'
        ? applicants
        : applicants.filter((a) => a.currentRound === roundFilter),
    [applicants, roundFilter],
  );

  const openAction = (applicant: ApplicantRow, type: 'proceed' | 'reject') => {
    setActionType(type);
    setActionTarget(applicant);
  };

  const handleActionConfirm = async (
    applicant: ApplicantRow,
    sendEmail: boolean,
    content: string,
  ) => {
    const totalRounds = pipeline?.length || roundLabels?.length || 1;
    const isLastRound = applicant.currentRound >= totalRounds - 1;

    let nextStatus: ApplicantStatus = 'rejected';
    let nextRound = applicant.currentRound;

    if (actionType === 'proceed') {
      if (isLastRound) {
        nextStatus = 'approved';
        nextRound = applicant.currentRound;
      } else {
        nextStatus = 'advanced';
        nextRound = applicant.currentRound + 1;
      }
    } else {
      nextStatus = 'rejected';
    }

    try {
      if (roleId) {
        await fetch(`/api/organisations/inductions/roles/${roleId}/applicants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            responseId: applicant.id,
            status: nextStatus,
            currentRound: nextRound,
            statusMessage: content,
            rejectionReason: actionType === 'reject' ? content : undefined,
            sendEmail,
            email: applicant.email,
          }),
        });
      }
      setApplicants((prev) =>
        prev.map((a) => {
          if (a.id !== applicant.id) return a;
          return { ...a, status: nextStatus, currentRound: nextRound };
        }),
      );
      toast.success(
        actionType === 'proceed'
          ? isLastRound
            ? `${applicant.name || applicant.email} selected for this role!`
            : `${applicant.name || applicant.email} advanced to next round`
          : `${applicant.name || applicant.email} rejected`,
      );
    } catch {
      toast.error('Failed to update applicant status');
    }
  };

  const handleQuickMoveRound = async (applicant: ApplicantRow, targetRoundIdx: number) => {
    try {
      if (roleId) {
        await fetch(`/api/organisations/inductions/roles/${roleId}/applicants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            responseId: applicant.id,
            status: 'advanced',
            currentRound: targetRoundIdx,
            email: applicant.email,
          }),
        });
      }
      setApplicants((prev) =>
        prev.map((a) => (a.id === applicant.id ? { ...a, currentRound: targetRoundIdx, status: 'advanced' } : a)),
      );
      const targetRoundName = pipeline?.[targetRoundIdx]?.label || roundLabels?.[targetRoundIdx] || `Round ${targetRoundIdx + 1}`;
      toast.success(`${applicant.name || applicant.email} moved to ${targetRoundName}`);
    } catch {
      toast.error('Failed to move applicant to stage');
    }
  };

  const handleResetStatus = async (applicant: ApplicantRow) => {
    try {
      if (roleId) {
        await fetch(`/api/organisations/inductions/roles/${roleId}/applicants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            responseId: applicant.id,
            status: 'submitted',
            currentRound: applicant.currentRound,
            email: applicant.email,
          }),
        });
      }
      setApplicants((prev) =>
        prev.map((a) => (a.id === applicant.id ? { ...a, status: 'submitted' } : a)),
      );
      toast.success(`${applicant.name || applicant.email} reset to Under Review`);
    } catch {
      toast.error('Failed to reset applicant status');
    }
  };

  const totalCount = applicants.length;
  const advancedCount = applicants.filter((a) => a.status === 'advanced').length;
  const rejectedCount = applicants.filter((a) => a.status === 'rejected').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold !text-left">Applicants</h3>
          <Badge variant="outline" className="text-xs">
            {totalCount} total
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {primaryFormId && (
            <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs font-medium">
              <Link href={`/organisations/inductions/forms/${primaryFormId}/responses${cycleId && roleId ? `?cycleId=${cycleId}&roleId=${roleId}` : ''}`}>
                <ClipboardList className="h-3.5 w-3.5" />
                View Form Responses
              </Link>
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
            title="Refresh applicants list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Round Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
          <Filter className="h-3.5 w-3.5" />
          Filter by round:
        </span>
        <button
          onClick={() => setRoundFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
            roundFilter === 'all'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-muted/40 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
          }`}
        >
          All ({totalCount})
        </button>
        {roundLabels.map((label, idx) => (
          <button
            key={idx}
            onClick={() => setRoundFilter(idx)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              roundFilter === idx
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted/40 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            }`}
          >
            {label} ({roundCounts[idx] || 0})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="!text-left">Applicant</TableHead>
              <TableHead className="!text-left">Current Round &amp; Schedule</TableHead>
              <TableHead className="!text-left">Submitted</TableHead>
              <TableHead className="!text-left">Status</TableHead>
              <TableHead className="!text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No applicants in this round.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((applicant) => {
                const badge = STATUS_BADGE[applicant.status] || STATUS_BADGE.submitted;
                const totalRounds = pipeline?.length || roundLabels?.length || 1;
                const isLastRound = applicant.currentRound >= totalRounds - 1;
                const isTerminal =
                  applicant.status === 'rejected' || (applicant.status === 'approved' && isLastRound);
                const currentRoundLabel =
                  roundLabels[applicant.currentRound] ?? `Round ${applicant.currentRound + 1}`;

                const currentRoundObj = pipeline[applicant.currentRound];
                const isInterviewRound = currentRoundObj?.type === 'interview';
                const applicantBooking = isInterviewRound
                  ? currentRoundObj?.interviewConfig?.bookings?.find(
                      (b: InterviewBooking) => b.candidateEmail.toLowerCase() === applicant.email.toLowerCase(),
                    )
                  : null;

                return (
                  <TableRow key={applicant.id}>
                    {/* Applicant */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {avatarInitial(applicant)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground !text-left">
                            {applicant.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 !text-left">
                            <Mail className="h-3 w-3" />
                            {applicant.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Round & Booking State */}
                    <TableCell>
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-foreground block">
                          {currentRoundLabel}
                        </span>
                        {isInterviewRound && (
                          applicantBooking ? (
                            <Badge variant="outline" className="text-[10px] bg-green/10 text-green-dark dark:text-green-light border-green/30 gap-1 font-semibold py-0">
                              <Calendar className="h-2.5 w-2.5" />
                              {applicantBooking.slotKey}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 py-0">
                              <Clock className="h-2.5 w-2.5" />
                              Slot Pending
                            </Badge>
                          )
                        )}
                      </div>
                    </TableCell>

                    {/* Submitted */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        {formatDate(applicant.submittedAt)}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${badge.className}`}>
                        {(applicant.status === 'submitted' || applicant.status === 'pending') && (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        )}
                        {applicant.status === 'advanced' && (
                          <ArrowRight className="h-3 w-3 mr-1" />
                        )}
                        {applicant.status === 'approved' && (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        )}
                        {applicant.status === 'rejected' && (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {badge.label}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {primaryFormId && applicant.email && (
                          <Button
                            asChild
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                            title="View form response"
                            aria-label={`View response for ${applicant.email}`}
                          >
                            <Link
                              href={`/organisations/inductions/forms/${primaryFormId}/responses?email=${encodeURIComponent(
                                applicant.email,
                              )}${cycleId && roleId ? `&cycleId=${cycleId}&roleId=${roleId}` : ''}`}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        )}

                        {!isTerminal && (
                          <>
                            <Button
                              size="sm"
                              className={`h-7 px-2.5 gap-1 text-xs ${
                                isLastRound
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white'
                                  : 'bg-green-dark hover:bg-green-dark/90 text-white dark:bg-green dark:text-black dark:hover:bg-green/80'
                              }`}
                              onClick={() => openAction(applicant, 'proceed')}
                            >
                              {isLastRound ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3" />
                                  Select
                                </>
                              ) : (
                                <>
                                  <ArrowRight className="h-3 w-3" />
                                  Proceed
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2.5 gap-1 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive"
                              onClick={() => openAction(applicant, 'reject')}
                            >
                              <XCircle className="h-3 w-3" />
                              Reject
                            </Button>
                          </>
                        )}

                        {/* Extra Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                              aria-label="More applicant actions"
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            {pipeline && pipeline.length > 1 && (
                              <>
                                <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                  Move to Pipeline Stage
                                </div>
                                {pipeline.map((round, rIdx) => (
                                  <DropdownMenuItem
                                    key={round.id || rIdx}
                                    disabled={applicant.currentRound === rIdx}
                                    onClick={() => void handleQuickMoveRound(applicant, rIdx)}
                                    className="cursor-pointer text-xs justify-between"
                                  >
                                    <span className="truncate">{round.label || `Round ${rIdx + 1}`}</span>
                                    {applicant.currentRound === rIdx && (
                                      <Check className="h-3.5 w-3.5 text-primary ml-1.5 shrink-0" />
                                    )}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                              </>
                            )}
                            {applicant.status !== 'approved' && (
                              <DropdownMenuItem
                                onClick={() => openAction(applicant, 'proceed')}
                                className="cursor-pointer text-xs font-medium text-emerald-600 dark:text-emerald-400"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                                {isLastRound ? 'Select Candidate' : 'Advance to Next Stage'}
                              </DropdownMenuItem>
                            )}
                            {applicant.status !== 'rejected' && (
                              <DropdownMenuItem
                                onClick={() => openAction(applicant, 'reject')}
                                className="cursor-pointer text-xs font-medium text-destructive"
                              >
                                <XCircle className="h-3.5 w-3.5 mr-2" />
                                Reject Applicant
                              </DropdownMenuItem>
                            )}
                            {(applicant.status === 'rejected' || applicant.status === 'approved') && (
                              <DropdownMenuItem
                                onClick={() => void handleResetStatus(applicant)}
                                className="cursor-pointer text-xs"
                              >
                                <RotateCcw className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                Reset to Under Review
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Action Dialog */}
      <ActionDialog
        applicant={actionTarget}
        type={actionType}
        isLastRound={
          actionTarget != null &&
          actionTarget.currentRound >= (pipeline?.length || roundLabels?.length || 1) - 1
        }
        nextRound={
          actionTarget != null && pipeline
            ? pipeline[actionTarget.currentRound + 1] ?? null
            : null
        }
        onClose={() => setActionTarget(null)}
        onConfirm={handleActionConfirm}
      />
    </div>
  );
}

