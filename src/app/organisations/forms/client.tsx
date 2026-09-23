'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { FilePlus2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormCard } from './_components/form-card';
import { NewFormDialog } from './_components/new-form-dialog';
import type { FormSummary } from './types';

export function FormsClient({ initialForms }: { initialForms: FormSummary[] }) {
  const [forms, setForms] = useState<FormSummary[]>(initialForms);
  const [pendingDelete, setPendingDelete] = useState<FormSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const copyLink = async (form: FormSummary) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/platform/forms/${form.id}`);
      toast.success('Share link copied');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/organisations/forms/${pendingDelete.id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        toast.error(json?.error ?? 'Could not delete the form');
        return;
      }
      setForms((prev) => prev.filter((f) => f.id !== pendingDelete.id));
      toast.success('Form deleted');
      setPendingDelete(null);
    } catch {
      toast.error('Could not delete the form');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {forms.length === 0
            ? 'No forms yet.'
            : `${forms.length} form${forms.length === 1 ? '' : 's'}`}
        </p>
        <NewFormDialog />
      </div>

      {forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FilePlus2 className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold">Build your first induction form</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Drag together questions, add logic and pages, theme it to your society, and share one
            link.
          </p>
          <div className="mt-5">
            <NewFormDialog />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {forms.map((form) => (
            <FormCard key={form.id} form={form} onCopyLink={copyLink} onDelete={setPendingDelete} />
          ))}
        </div>
      )}

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this form?</DialogTitle>
            <DialogDescription>
              &ldquo;{pendingDelete?.title}&rdquo; and its drafts will be permanently removed. Forms
              with submissions can&apos;t be deleted — set them to inactive instead.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void confirmDelete()} disabled={deleting} className="gap-1.5">
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
