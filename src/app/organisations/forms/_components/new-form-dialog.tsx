'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function NewFormDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const create = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      toast.error('Give your form a name');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/organisations/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        toast.error(json?.error ?? 'Could not create the form');
        return;
      }
      router.push(`/organisations/forms/${json.data.id}/edit`);
    } catch {
      toast.error('Could not create the form');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          New form
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a form</DialogTitle>
          <DialogDescription>
            You can change everything later — this is just the name you&apos;ll recognise it by.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="new-form-title">Form name</Label>
          <Input
            id="new-form-title"
            value={title}
            autoFocus
            placeholder="e.g. Autumn 2026 Induction"
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void create();
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={creating}>
            Cancel
          </Button>
          <Button onClick={() => void create()} disabled={creating} className="gap-1.5">
            {creating && <Loader2 className="h-4 w-4 animate-spin" />}
            Create & edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
