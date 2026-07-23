'use client';

import Link from 'next/link';
import { Eye, FileText, Send, Pencil, BarChart3, Link2, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import type { FormStatus } from '@/lib/forms/strapi-forms';
import type { FormSummary } from '../types';

const STATUS_STYLE: Record<FormStatus, string> = {
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

export function FormCard({
  form,
  onCopyLink,
  onDelete,
}: {
  form: FormSummary;
  onCopyLink: (form: FormSummary) => void;
  onDelete: (form: FormSummary) => void;
}) {
  const completion = Math.round((form.stats.completionRate || 0) * 100);
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <Link
          href={`/organisations/forms/${form.id}/edit`}
          className="min-w-0 flex-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <h3 className="truncate text-base font-semibold text-foreground">{form.title}</h3>
        </Link>
        <span
          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[form.form_status]}`}
        >
          {form.form_status}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <Stat icon={Eye} label="Unique visits" value={form.stats.uniqueVisits} />
        <Stat icon={FileText} label="Drafts" value={form.stats.draftCount} />
        <Stat icon={Send} label="Submissions" value={form.stats.submissionCount} />
        <Stat icon={BarChart3} label="Completion rate" value={`${completion}%`} />
      </div>

      <div className="mt-auto flex items-center gap-2">
        <Button asChild size="sm" variant="outline" className="flex-1 gap-1.5">
          <Link href={`/organisations/forms/${form.id}/edit`}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="flex-1 gap-1.5">
          <Link href={`/organisations/forms/${form.id}/responses`}>
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
            <DropdownMenuItem onClick={() => onCopyLink(form)}>
              <Link2 className="mr-2 h-4 w-4" />
              Copy share link
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(form)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
