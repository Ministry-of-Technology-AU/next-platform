'use client';

/**
 * Renders a list of already-visibility-filtered blocks. Shared verbatim by the
 * filler and the builder preview so "preview ≡ filler reality" (spec §8.5).
 * The caller is responsible for computing which blocks are visible.
 */

import { BlockInput } from './block-input';
import {
  TitleDisplay,
  ParagraphDisplay,
  DividerDisplay,
  ImageDisplay,
  SocialLinksDisplay,
} from './display-blocks';
import { isInputBlock, type FormBlock } from '@/lib/forms/schema';
import type { UploadFn, DeleteFn } from './file-upload-field';

interface FormBlocksProps {
  blocks: FormBlock[];
  answers: Record<string, unknown>;
  onChange: (blockId: string, value: unknown) => void;
  errors?: Record<string, string>;
  uploadFile?: UploadFn;
  deleteFile?: DeleteFn;
}

export function FormBlocks({
  blocks,
  answers,
  onChange,
  errors = {},
  uploadFile,
  deleteFile,
}: FormBlocksProps) {
  return (
    <div className="space-y-6">
      {blocks.map((block) => (
        <div key={block.id} id={`fb-${block.id}`} data-block-id={block.id} className="scroll-mt-24">
          {renderBlock(block, answers, onChange, errors, uploadFile, deleteFile)}
        </div>
      ))}
    </div>
  );
}

function renderBlock(
  block: FormBlock,
  answers: Record<string, unknown>,
  onChange: (blockId: string, value: unknown) => void,
  errors: Record<string, string>,
  uploadFile?: UploadFn,
  deleteFile?: DeleteFn,
) {
  if (isInputBlock(block)) {
    return (
      <BlockInput
        block={block}
        value={answers[block.id]}
        onChange={(v) => onChange(block.id, v)}
        error={errors[block.id]}
        uploadFile={uploadFile}
        deleteFile={deleteFile}
      />
    );
  }

  switch (block.type) {
    case 'title':
      return <TitleDisplay block={block} />;
    case 'paragraph':
      return <ParagraphDisplay block={block} />;
    case 'divider':
      return <DividerDisplay />;
    case 'image':
      return <ImageDisplay block={block} />;
    case 'social-links':
      return <SocialLinksDisplay block={block} />;
    default:
      // Forward compatibility: unknown display types render nothing (spec §3.2).
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Unknown block type, skipping:', (block as { type: string }).type);
      }
      return null;
  }
}
