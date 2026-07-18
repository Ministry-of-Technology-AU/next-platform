'use client';

/**
 * Mandatory read-only review shown before submit (spec §9.1 step 2). Renders
 * every VISIBLE input block's question + formatted answer.
 */

import { format } from 'date-fns';
import { visiblePages, visibleBlocks } from '@/lib/forms/conditions';
import { isInputBlock, type FormSchema, type InputBlock, type FileDescriptor } from '@/lib/forms/schema';

function AnswerValue({ block, value }: { block: InputBlock; value: unknown }) {
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return <span className="text-[var(--form-text-muted)]">—</span>;
  }

  switch (block.type) {
    case 'checkbox':
      return <span>{value === true ? 'Yes' : 'No'}</span>;
    case 'select':
      return <span>{block.options.find((o) => o.value === value)?.label ?? String(value)}</span>;
    case 'multi-select':
      return (
        <span>
          {(value as string[])
            .map((v) => block.options.find((o) => o.value === v)?.label ?? v)
            .join(', ')}
        </span>
      );
    case 'date':
      try {
        return <span>{format(new Date(value as string), 'PPP')}</span>;
      } catch {
        return <span>{String(value)}</span>;
      }
    case 'datetime':
      try {
        return <span>{format(new Date(value as string), 'PPP p')}</span>;
      } catch {
        return <span>{String(value)}</span>;
      }
    case 'rich-text':
      return (
        <div
          className="prose max-w-none text-sm"
          dangerouslySetInnerHTML={{ __html: String(value) }}
        />
      );
    case 'file-upload':
      return (
        <ul className="space-y-1">
          {(value as FileDescriptor[]).map((f) => (
            <li key={f.publicId}>
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--form-primary)] underline"
              >
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

export function SubmissionPreview({
  schema,
  answers,
}: {
  schema: FormSchema;
  answers: Record<string, unknown>;
}) {
  const rows: InputBlock[] = [];
  for (const page of visiblePages(schema, answers)) {
    for (const block of visibleBlocks(page, answers)) {
      if (isInputBlock(block)) rows.push(block);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2
          className="text-xl font-bold text-[var(--form-text)]"
          style={{ fontFamily: 'var(--form-font-heading)' }}
        >
          Review your answers
        </h2>
        <p className="mt-1 text-sm text-[var(--form-text-muted)]">
          Check everything looks right before submitting. You can go back to edit.
        </p>
      </div>
      <dl className="divide-y divide-[var(--form-border)]">
        {rows.map((block) => (
          <div key={block.id} className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-[var(--form-text-muted)] sm:col-span-1">
              {block.title}
            </dt>
            <dd className="text-sm text-[var(--form-text)] sm:col-span-2">
              <AnswerValue block={block} value={answers[block.id]} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
