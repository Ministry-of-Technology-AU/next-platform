'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Eye,
  FileText,
  Send,
  Pencil,
  BarChart3,
  Link2,
  Trash2,
  MoreVertical,
  FilePlus2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export interface RoleFormSummary {
  id: string;
  title: string;
  form_status: 'draft' | 'active' | 'inactive';
  stats: {
    uniqueVisits: number;
    draftCount: number;
    submissionCount: number;
    completionRate: number;
  };
}

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-green/15 text-green-dark dark:text-green-light',
  draft: 'bg-secondary/40 text-secondary-extradark dark:text-secondary',
  inactive: 'bg-muted text-muted-foreground',
};

function Stat({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: number | string }) {
  return (
    <div className="flex items-center gap-1.5" title={label}>
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}

export function RoleForms({
  forms: initialForms,
  cycleId,
  roleId,
  onFormsChange,
}: {
  forms: RoleFormSummary[];
  cycleId: string;
  roleId: string;
  onFormsChange?: (forms: RoleFormSummary[]) => void;
}) {
  const [forms, setForms] = useState<RoleFormSummary[]>(initialForms);
  const [pendingDelete, setPendingDelete] = useState<RoleFormSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Sync with prop
  useState(() => {
    setForms(initialForms);
  });

  const formEditHref = (formId: string) =>
    `/organisations/inductions/forms/${formId}/edit`;
  const formResponsesHref = (formId: string) =>
    `/organisations/inductions/forms/${formId}/responses`;

  const copyShareLink = async (form: RoleFormSummary) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/forms/${form.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Form link copied to clipboard');
    } catch {
      toast.error('Could not copy link');
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold !text-left">Forms</h3>
          <span className="text-sm text-muted-foreground">
            {forms.length === 0 ? 'No forms linked' : `${forms.length} form${forms.length === 1 ? '' : 's'}`}
          </span>
        </div>
      </div>

      {forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FilePlus2 className="h-6 w-6" />
          </div>
          <h4 className="text-base font-semibold">No forms linked to this role yet</h4>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add a round in the pipeline above and select or create a form for it.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {forms.map((form) => {
            const completion = Math.round((form.stats.completionRate || 0) * 100);
            return (
              <div
                key={form.id}
                className="flex flex-col rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <Link
                    href={formEditHref(form.id)}
                    className="min-w-0 flex-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <h4 className="truncate text-sm font-semibold text-foreground !text-left hover:underline">{form.title}</h4>
                  </Link>
                  <span
                    className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[form.form_status]}`}
                  >
                    {form.form_status}
                  </span>
                </div>
                <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <Stat icon={Eye} label="Visits" value={form.stats.uniqueVisits} />
                  <Stat icon={Send} label="Submissions" value={form.stats.submissionCount} />
                  <Stat icon={BarChart3} label="Completion" value={`${completion}%`} />
                </div>
                <div className="mt-auto flex items-center gap-2">
                  <Button asChild size="sm" variant="outline" className="flex-1 gap-1.5">
                    <Link href={formEditHref(form.id)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="flex-1 gap-1.5">
                    <Link href={formResponsesHref(form.id)}>
                      <BarChart3 className="h-3.5 w-3.5" />
                      Responses
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-9 w-9" aria-label="More actions">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => void copyShareLink(form)}>
                        <Link2 className="mr-2 h-4 w-4" />
                        Copy share link
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setPendingDelete(form)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Form
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
