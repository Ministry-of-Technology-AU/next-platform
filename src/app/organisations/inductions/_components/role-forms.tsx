'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  FileText,
  Pencil,
  BarChart3,
  Trash2,
  MoreVertical,
  FilePlus2,
  Loader2,
  ExternalLink,
  Link2,
  CopyPlus,
  Check,
  Send,
  Globe,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import type { PipelineRound } from '../types';

export interface RoleFormSummary {
  id: string;
  title: string;
  form_status: 'draft' | 'active' | 'inactive';
  startDate?: string | null;
  endDate?: string | null;
  updatedAt?: string | null;
  fieldsCount?: number;
  stats: {
    uniqueVisits: number;
    draftCount: number;
    submissionCount: number;
    completionRate: number;
    lastSubmissionAt?: string | null;
  };
}

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-green/15 text-green-dark dark:text-green-light',
  draft: 'bg-secondary/40 text-secondary-extradark dark:text-secondary',
  inactive: 'bg-muted text-muted-foreground',
};

interface RoleFormsProps {
  forms: RoleFormSummary[];
  cycleId: string;
  roleId: string;
  pipeline?: PipelineRound[];
  onFormsChange?: (forms: RoleFormSummary[]) => void;
  onFormCreated?: (newForm: RoleFormSummary) => void;
}

export function RoleForms({
  forms: initialForms,
  cycleId: _cycleId,
  roleId: _roleId,
  pipeline = [],
  onFormsChange,
  onFormCreated,
}: RoleFormsProps) {
  const [forms, setForms] = useState<RoleFormSummary[]>(initialForms);
  const [pendingDelete, setPendingDelete] = useState<RoleFormSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync state if props change
  useEffect(() => {
    setForms(initialForms);
  }, [initialForms]);

  const formEditHref = (formId: string) =>
    `/organisations/inductions/forms/${formId}/edit`;
  const formResponsesHref = (formId: string) =>
    `/organisations/inductions/forms/${formId}/responses`;

  const copyShareLink = async (form: RoleFormSummary) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/platform/forms/${form.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(form.id);
      toast.success('Form link copied to clipboard');
      setTimeout(() => {
        setCopiedId((current) => (current === form.id ? null : current));
      }, 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  const duplicateForm = async (form: RoleFormSummary) => {
    setDuplicatingId(form.id);
    try {
      const res = await fetch(`/api/organisations/forms/${form.id}/duplicate`, {
        method: 'POST',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to duplicate form');
      }

      const newForm: RoleFormSummary = {
        id: json.data.id,
        title: json.data.title,
        form_status: json.data.form_status,
        startDate: json.data.start_date,
        endDate: json.data.end_date,
        updatedAt: json.data.updatedAt,
        fieldsCount: form.fieldsCount,
        stats: json.data.stats,
      };

      const next = [newForm, ...forms];
      setForms(next);
      onFormsChange?.(next);
      onFormCreated?.(newForm);
      toast.success(`Form duplicated: "${newForm.title}"`);
    } catch (err: any) {
      toast.error(err.message || 'Could not duplicate form');
    } finally {
      setDuplicatingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/organisations/forms/${pendingDelete.id}`, {
        method: 'DELETE',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to delete form');
      }

      const next = forms.filter((f) => f.id !== pendingDelete.id);
      setForms(next);
      onFormsChange?.(next);
      toast.success('Form deleted successfully');
      setPendingDelete(null);
    } catch (err: any) {
      toast.error(err.message || 'Could not delete form');
    } finally {
      setDeleting(false);
    }
  };

  const togglePublishForm = async (form: RoleFormSummary) => {
    const nextStatus: 'draft' | 'active' = form.form_status === 'active' ? 'draft' : 'active';
    try {
      const res = await fetch(`/api/organisations/forms/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_status: nextStatus }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to update form status');
      }

      const next = forms.map((f) => (f.id === form.id ? { ...f, form_status: nextStatus } : f));
      setForms(next);
      onFormsChange?.(next);
      toast.success(
        nextStatus === 'active'
          ? `"${form.title}" is now published and active!`
          : `"${form.title}" unpublished and set to Draft.`,
      );
    } catch (err: any) {
      toast.error(err.message || 'Could not update form status');
    }
  };

  // Find linked pipeline round for a form
  const getLinkedRound = (formId: string) => {
    return pipeline.find(
      (r) =>
        (r.formIds ?? []).some((id) => id === formId || String(id) === String(formId)) ||
        r.formId === formId ||
        String(r.formId) === String(formId),
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold !text-left">Application Forms</h3>
          <span className="text-sm text-muted-foreground">
            {forms.length === 0 ? '· No forms linked' : `· ${forms.length} linked`}
          </span>
        </div>
      </div>

      {/* Forms Grid / Empty State */}
      {forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-10 px-4 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FilePlus2 className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">No form linked to this role yet</h4>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Select or create a form in the pipeline below to start collecting applicant responses.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {forms.map((form) => {
            const completion = Math.round((form.stats.completionRate || 0) * 100);
            const linkedRound = getLinkedRound(form.id);
            const roundName = linkedRound?.label || 'Round 1: Application Form';

            return (
              <div
                key={form.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div>
                  {/* Top: Icon + Title + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                        <FileText className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <Link
                          href={formResponsesHref(form.id)}
                          className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded min-w-0"
                          title={form.title}
                        >
                          <h4 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors !text-left line-clamp-2 leading-snug break-words">
                            {form.title}
                          </h4>
                        </Link>
                        <p className="text-xs font-medium text-muted-foreground truncate" title={roundName}>
                          {roundName}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[form.form_status] || STATUS_STYLE.draft}`}
                    >
                      {form.form_status}
                    </span>
                  </div>

                  {/* Clean Simple Stats */}
                  <div className="mt-5 flex items-center gap-4 text-xs font-medium text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1.5" title="Completed Submissions">
                      <Send className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span className="tabular-nums font-semibold text-foreground/80">
                        {form.stats.submissionCount}
                      </span>
                      <span>applicant{form.stats.submissionCount === 1 ? '' : 's'}</span>
                    </div>

                    <span className="text-muted-foreground/40">•</span>

                    <div className="flex items-center gap-1.5" title="Unique Visits">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span className="tabular-nums font-semibold text-foreground/80">
                        {form.stats.uniqueVisits}
                      </span>
                      <span>views</span>
                    </div>

                    <span className="text-muted-foreground/40">•</span>

                    <div className="flex items-center gap-1.5" title="Completion Rate">
                      <BarChart3 className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span className="tabular-nums font-semibold text-foreground/80">
                        {completion}%
                      </span>
                      <span>rate</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-6 flex items-center gap-2 pt-4 border-t border-border/40">
                  <Button asChild size="sm" variant="default" className="flex-1 gap-1.5 font-medium">
                    <Link href={formResponsesHref(form.id)}>
                      View Responses
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>

                  <Button asChild size="sm" variant="outline" className="gap-1.5 font-medium">
                    <Link href={formEditHref(form.id)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => void copyShareLink(form)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title={copiedId === form.id ? 'Copied link' : 'Copy link'}
                    aria-label="Copy share link"
                  >
                    {copiedId === form.id ? (
                      <Check className="h-4 w-4 text-green" />
                    ) : (
                      <Link2 className="h-4 w-4" />
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        aria-label="More options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => void togglePublishForm(form)} className="cursor-pointer font-medium">
                        {form.form_status === 'active' ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4 text-muted-foreground" />
                            Unpublish (Set to Draft)
                          </>
                        ) : (
                          <>
                            <Globe className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            Publish (Set Active)
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/platform/forms/${form.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center cursor-pointer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Live preview
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => void copyShareLink(form)} className="cursor-pointer">
                        <Link2 className="mr-2 h-4 w-4" />
                        Copy share link
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => void duplicateForm(form)}
                        disabled={duplicatingId === form.id}
                        className="cursor-pointer"
                      >
                        {duplicatingId === form.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CopyPlus className="mr-2 h-4 w-4" />
                        )}
                        Duplicate form
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          if (form.stats.submissionCount > 0) {
                            toast.error('Cannot delete a form that has active submissions');
                            return;
                          }
                          setPendingDelete(form);
                        }}
                        disabled={form.stats.submissionCount > 0}
                        className="text-destructive focus:text-destructive cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete form
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!pendingDelete} onOpenChange={(open: boolean) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &ldquo;{pendingDelete?.title}&rdquo;?</DialogTitle>
            <DialogDescription>
              This will permanently delete the form, all questions, and drafts. Forms with existing
              submissions cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={() => void confirmDelete()}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Delete Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
