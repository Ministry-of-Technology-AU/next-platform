'use client';

import { format } from 'date-fns';
import { Mail, Calendar, CheckCircle2, FileText, Download, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { isInputBlock, type FormSchema, type InputBlock, type FileDescriptor } from '@/lib/forms/schema';

export interface ResponseRow {
  id: number;
  email: string;
  state: 'draft' | 'submitted';
  data: Record<string, unknown>;
  submittedAt: string | null;
  lastSavedAt: string | null;
}

function AnswerValue({ block, value }: { block: InputBlock; value: unknown }) {
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return <span className="text-xs italic text-muted-foreground">Not answered</span>;
  }

  switch (block.type) {
    case 'checkbox':
      return (
        <Badge
          variant="outline"
          className={`text-xs font-semibold ${
            value === true
              ? 'bg-green/15 text-green-dark dark:text-green-light border-green/30'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {value === true ? 'Yes' : 'No'}
        </Badge>
      );

    case 'select':
      return (
        <Badge variant="secondary" className="text-xs font-medium px-2.5 py-1">
          {block.options.find((o) => o.value === value)?.label ?? String(value)}
        </Badge>
      );

    case 'multi-select':
      return (
        <div className="flex flex-wrap gap-1.5">
          {(value as string[]).map((v) => (
            <Badge key={v} variant="secondary" className="text-xs font-medium px-2.5 py-0.5">
              {block.options.find((o) => o.value === v)?.label ?? v}
            </Badge>
          ))}
        </div>
      );

    case 'date':
    case 'datetime':
      try {
        const formatted = format(
          new Date(value as string),
          block.type === 'date' ? 'PPP' : 'PPP, p',
        );
        return (
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground border border-border/50">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{formatted}</span>
          </div>
        );
      } catch {
        return <span className="text-sm font-medium">{String(value)}</span>;
      }

    case 'rich-text':
      return (
        <div
          className="prose prose-sm dark:prose-invert max-w-none rounded-xl bg-muted/30 p-3 border border-border/60 text-sm"
          dangerouslySetInnerHTML={{ __html: String(value) }}
        />
      );

    case 'file-upload':
      return (
        <ul className="space-y-2">
          {(value as FileDescriptor[]).map((f) => (
            <li key={f.publicId}>
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/50 hover:text-primary transition-colors shadow-sm group"
              >
                <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="truncate max-w-[240px] font-semibold">{f.filename}</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary ml-auto" />
              </a>
            </li>
          ))}
        </ul>
      );

    case 'long-text':
      return (
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {String(value)}
        </div>
      );

    default:
      return (
        <div className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-sm text-foreground font-medium">
          {String(value)}
        </div>
      );
  }
}

export function ResponseDetail({
  schema,
  response,
}: {
  schema: FormSchema;
  response: ResponseRow;
}) {
  const blocks: InputBlock[] = [];
  for (const page of schema.pages) {
    for (const block of page.blocks) {
      if (isInputBlock(block)) blocks.push(block);
    }
  }

  const ts = response.submittedAt ?? response.lastSavedAt;
  let formattedTime = '—';
  try {
    if (ts) formattedTime = format(new Date(ts), 'PPP, p');
  } catch {
    /* keep dash */
  }

  return (
    <div className="space-y-6 pt-2">
      {/* Header Info Card */}
      <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <span className="font-bold text-base text-foreground truncate">{response.email}</span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green/15 text-green-dark dark:text-green-light capitalize">
            <CheckCircle2 className="w-3 h-3" />
            {response.state}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t border-border/50">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
          <span>Submitted on <strong className="font-semibold text-foreground/80">{formattedTime}</strong></span>
        </div>
      </div>

      {/* Answers List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-border/60">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Form Responses ({blocks.length})
          </h4>
        </div>

        <div className="space-y-4">
          {blocks.map((block, idx) => (
            <div
              key={block.id}
              className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Q{idx + 1}. {block.title}
                </span>
                {block.required && (
                  <span className="text-[10px] font-semibold text-destructive uppercase">Required</span>
                )}
              </div>
              <div className="pt-1">
                <AnswerValue block={block} value={response.data[block.id]} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

