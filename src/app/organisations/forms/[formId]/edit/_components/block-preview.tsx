'use client';

/**
 * Lightweight approximate render of a block for the canvas cards. Not the live
 * component (that would mount Tiptap/popovers per card) — the full-fidelity
 * render is the separate Preview mode (builder-preview.tsx, spec §8.5).
 */

import { ChevronDown, Calendar, Clock, Upload } from 'lucide-react';
import { isInputBlock, type FormBlock, type InputBlock } from '@/lib/forms/schema';

function FakeField({ tall = false }: { tall?: boolean }) {
  return (
    <div
      className={`w-full rounded-md border border-input bg-muted/40 ${tall ? 'h-16' : 'h-9'}`}
    />
  );
}

function Label({ block }: { block: InputBlock }) {
  return (
    <div className="mb-1.5">
      <p className="text-sm font-medium text-foreground">
        {block.title || 'Untitled question'}
        {block.required && <span className="ml-0.5 text-destructive">*</span>}
      </p>
      {block.subtitle && <p className="text-xs text-muted-foreground">{block.subtitle}</p>}
    </div>
  );
}

export function BlockPreview({ block }: { block: FormBlock }) {
  if (isInputBlock(block)) {
    return (
      <div>
        <Label block={block} />
        <InputPreview block={block} />
      </div>
    );
  }

  switch (block.type) {
    case 'title': {
      const size = block.level === 1 ? 'text-xl' : block.level === 2 ? 'text-lg' : 'text-base';
      const align =
        block.align === 'center' ? 'text-center' : block.align === 'right' ? 'text-right' : 'text-left';
      return <p className={`font-bold text-foreground ${size} ${align}`}>{block.text || 'Heading'}</p>;
    }
    case 'paragraph':
      return (
        <div
          className="prose prose-sm max-w-none text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: block.html || '<p>Text block</p>' }}
        />
      );
    case 'divider':
      return <hr className="border-border" />;
    case 'image':
      return block.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={block.url} alt={block.alt} className="max-h-32 rounded-md object-cover" />
      ) : (
        <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-input text-xs text-muted-foreground">
          No image selected
        </div>
      );
    case 'social-links':
      return (
        <div className="flex gap-2">
          {(block.links.length ? block.links : [{ platform: 'website' }]).map((l, i) => (
            <span
              key={i}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-[10px] capitalize text-muted-foreground"
            >
              {('platform' in l ? l.platform : 'link').slice(0, 2)}
            </span>
          ))}
        </div>
      );
    default:
      return null;
  }
}

function InputPreview({ block }: { block: InputBlock }) {
  switch (block.type) {
    case 'short-text':
    case 'email':
    case 'phone':
    case 'number':
      return <FakeField />;
    case 'long-text':
    case 'rich-text':
      return <FakeField tall />;
    case 'select':
      return (
        <div className="flex h-9 items-center justify-between rounded-md border border-input bg-muted/40 px-3 text-xs text-muted-foreground">
          {block.placeholder || 'Select an option'}
          <ChevronDown className="h-4 w-4" />
        </div>
      );
    case 'multi-select':
      return block.style === 'dropdown' ? (
        <div className="flex h-9 items-center justify-between rounded-md border border-input bg-muted/40 px-3 text-xs text-muted-foreground">
          {block.placeholder || 'Select…'}
          <ChevronDown className="h-4 w-4" />
        </div>
      ) : (
        <div className="space-y-1.5">
          {block.options.slice(0, 4).map((o) => (
            <div key={o.value} className="flex items-center gap-2">
              <span className="h-4 w-4 rounded border border-input" />
              <span className="text-sm text-muted-foreground">{o.label}</span>
            </div>
          ))}
        </div>
      );
    case 'checkbox':
      return (
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded border border-input" />
          <span className="text-sm text-muted-foreground">{block.title}</span>
        </div>
      );
    case 'date':
      return (
        <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-muted/40 px-3 text-xs text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {block.placeholder || 'Select date'}
        </div>
      );
    case 'datetime':
      return (
        <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-muted/40 px-3 text-xs text-muted-foreground">
          <Clock className="h-4 w-4" />
          {block.placeholder || 'Select date & time'}
        </div>
      );
    case 'file-upload':
      return (
        <div className="flex h-16 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-input text-xs text-muted-foreground">
          <Upload className="h-4 w-4" />
          Upload {block.accept === 'images' ? 'images' : block.accept === 'documents' ? 'documents' : 'files'}
        </div>
      );
    default:
      return <FakeField />;
  }
}
