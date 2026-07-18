'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { FileDescriptor, FileUploadBlock } from '@/lib/forms/schema';

export type UploadFn = (file: File, blockId: string) => Promise<FileDescriptor>;
export type DeleteFn = (descriptor: FileDescriptor) => Promise<void>;

interface FileUploadFieldProps {
  block: FileUploadBlock;
  value: FileDescriptor[];
  onChange: (files: FileDescriptor[]) => void;
  errorMessage?: string;
  /** Injected by the filler; when absent the field is read-only (preview). */
  uploadFile?: UploadFn;
  deleteFile?: DeleteFn;
}

const ACCEPT_MAP: Record<FileUploadBlock['accept'], string> = {
  images: 'image/*',
  documents: '.pdf,.doc,.docx',
  both: 'image/*,.pdf,.doc,.docx',
};

/**
 * Upload-on-select file field. Each selected file is uploaded immediately via
 * the injected `uploadFile`; only the returned descriptor is stored in the
 * answer (spec §11). In builder preview mode `uploadFile` is undefined, so the
 * dropzone is disabled.
 */
export function FileUploadField({
  block,
  value,
  onChange,
  errorMessage,
  uploadFile,
  deleteFile,
}: FileUploadFieldProps) {
  const [busy, setBusy] = useState(false);
  const readOnly = !uploadFile;

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ''; // allow re-selecting the same file
    if (!uploadFile || files.length === 0) return;

    const remaining = block.maxFiles - value.length;
    if (remaining <= 0) {
      toast.error(`You can upload at most ${block.maxFiles} file(s).`);
      return;
    }
    const toUpload = files.slice(0, block.multiple ? remaining : 1);

    setBusy(true);
    const uploaded: FileDescriptor[] = [];
    for (const file of toUpload) {
      if (file.size > block.maxSizeMB * 1024 * 1024) {
        toast.error(`${file.name} exceeds ${block.maxSizeMB}MB.`);
        continue;
      }
      try {
        uploaded.push(await uploadFile(file, block.id));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Failed to upload ${file.name}.`);
      }
    }
    setBusy(false);
    if (uploaded.length > 0) onChange(block.multiple ? [...value, ...uploaded] : uploaded);
  };

  const handleRemove = async (descriptor: FileDescriptor) => {
    onChange(value.filter((f) => f.publicId !== descriptor.publicId));
    if (deleteFile) {
      try {
        await deleteFile(descriptor);
      } catch {
        /* best-effort orphan cleanup — non-blocking */
      }
    }
  };

  const inputId = `file-${block.id}`;

  return (
    <div className="space-y-2">
      <Label className="text-base font-medium">
        {block.title} {block.required && <span className="text-destructive">*</span>}
      </Label>
      {block.subtitle && <p className="text-sm text-muted-foreground">{block.subtitle}</p>}

      <label
        htmlFor={inputId}
        aria-disabled={readOnly || busy}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          readOnly || busy
            ? 'cursor-not-allowed border-input opacity-70'
            : 'cursor-pointer border-input hover:border-primary'
        } ${errorMessage ? 'border-destructive' : ''}`}
      >
        {busy ? (
          <Loader2 className="mb-2 h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        )}
        <p className="text-sm text-muted-foreground">
          {busy ? 'Uploading…' : readOnly ? 'File upload' : 'Click to upload'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {block.accept === 'images' ? 'Images' : block.accept === 'documents' ? 'PDF / Word' : 'Images or documents'}
          {' · '}max {block.maxSizeMB}MB{block.multiple ? ` · up to ${block.maxFiles}` : ''}
        </p>
        <input
          id={inputId}
          type="file"
          accept={ACCEPT_MAP[block.accept]}
          multiple={block.multiple}
          onChange={handleSelect}
          disabled={readOnly || busy}
          className="hidden"
        />
      </label>

      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((file) => (
            <li
              key={file.publicId}
              className="flex items-center justify-between rounded-md bg-muted p-2"
            >
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 items-center gap-2 text-sm hover:underline"
              >
                <FileText className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{file.filename}</span>
              </a>
              {!readOnly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(file)}
                  className="h-6 w-6 flex-shrink-0 p-0"
                  aria-label={`Remove ${file.filename}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
    </div>
  );
}
