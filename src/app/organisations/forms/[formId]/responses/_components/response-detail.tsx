'use client';

import { format } from 'date-fns';
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
    return <span className="text-muted-foreground">—</span>;
  }
  switch (block.type) {
    case 'checkbox':
      return <span>{value === true ? 'Yes' : 'No'}</span>;
    case 'select':
      return <span>{block.options.find((o) => o.value === value)?.label ?? String(value)}</span>;
    case 'multi-select':
      return (
        <span>
          {(value as string[]).map((v) => block.options.find((o) => o.value === v)?.label ?? v).join(', ')}
        </span>
      );
    case 'date':
    case 'datetime':
      try {
        return <span>{format(new Date(value as string), block.type === 'date' ? 'PPP' : 'PPP p')}</span>;
      } catch {
        return <span>{String(value)}</span>;
      }
    case 'rich-text':
      return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: String(value) }} />;
    case 'file-upload':
      return (
        <ul className="space-y-1">
          {(value as FileDescriptor[]).map((f) => (
            <li key={f.publicId}>
              <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                {f.filename}
              </a>
            </li>
          ))}
        </ul>
      );
    default:
      return <span className="whitespace-pre-wrap">{String(value)}</span>;
  }
}

export function ResponseDetail({ schema, response }: { schema: FormSchema; response: ResponseRow }) {
  const blocks: InputBlock[] = [];
  for (const page of schema.pages) {
    for (const block of page.blocks) {
      if (isInputBlock(block)) blocks.push(block);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Respondent</span>
          <span className="font-medium">{response.email}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-muted-foreground">
            {response.state === 'submitted' ? 'Submitted' : 'Last saved'}
          </span>
          <span className="font-medium">
            {(() => {
              const ts = response.submittedAt ?? response.lastSavedAt;
              try {
                return ts ? format(new Date(ts), 'PPP p') : '—';
              } catch {
                return '—';
              }
            })()}
          </span>
        </div>
      </div>

      <dl className="divide-y divide-border">
        {blocks.map((block) => (
          <div key={block.id} className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-muted-foreground sm:col-span-1">{block.title}</dt>
            <dd className="text-sm sm:col-span-2">
              <AnswerValue block={block} value={response.data[block.id]} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
