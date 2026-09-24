"use client";

import * as React from "react";
import {
  ExternalLink,
  File as FileIcon,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  Presentation,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FILE_KINDS, detectFileKind, formatBytes, previewKind, type FileKind } from "@/lib/forms/fields";

const KIND_ICON: Record<FileKind, React.ComponentType<{ className?: string }>> = {
  image: FileImage,
  pdf: FileText,
  document: FileText,
  spreadsheet: FileSpreadsheet,
  presentation: Presentation,
  text: FileText,
  archive: FileArchive,
};

export function FileKindIcon({ file, className }: { file: File; className?: string }) {
  const kind = detectFileKind(file);
  const Icon = kind ? KIND_ICON[kind] : FileIcon;
  return <Icon aria-hidden="true" className={className} />;
}

export function fileKindLabel(file: File): string {
  const kind = detectFileKind(file);
  return kind ? FILE_KINDS[kind].label : "File";
}

const TEXT_PREVIEW_LIMIT = 100_000;

/** False on browsers without an inline PDF viewer (Android Chrome, some in-app browsers). */
function canShowPdfInline(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.pdfViewerEnabled !== false;
}

function TextPreview({ file }: { file: File }) {
  const [text, setText] = React.useState<string | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    file
      .slice(0, TEXT_PREVIEW_LIMIT)
      .text()
      .then((t) => {
        if (!cancelled) setText(t);
      })
      .catch(() => {
        if (!cancelled) setText("");
      });
    return () => {
      cancelled = true;
    };
  }, [file]);

  if (text === null) return <Skeleton className="h-[60vh] w-full" />;
  return (
    <pre className="max-h-[65vh] overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground">
      {text}
      {file.size > TEXT_PREVIEW_LIMIT ? "\n\n… preview truncated" : ""}
    </pre>
  );
}

export interface FilePreviewDialogProps {
  file: File | null;
  url: string | undefined;
  onOpenChange: (open: boolean) => void;
}

/**
 * Full preview of a local file before it is uploaded: images, PDFs (browser's
 * own viewer) and plain text. Other kinds get an "open" link instead.
 */
export function FilePreviewDialog({ file, url, onOpenChange }: FilePreviewDialogProps) {
  const kind = file ? previewKind(file) : null;

  return (
    <Dialog open={file !== null} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] w-[calc(100vw-2rem)] max-w-4xl flex-col gap-4 overflow-hidden">
        {file ? (
          <>
            <DialogHeader className="pr-8 text-left">
              {/* `!` beats the unlayered global h2 rule (centred, text-3xl). */}
              <DialogTitle className="!text-left !text-lg truncate" title={file.name}>
                {file.name}
              </DialogTitle>
              <DialogDescription>
                {fileKindLabel(file)} · {formatBytes(file.size)} · not uploaded yet
              </DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
              {kind === "image" && url ? (
                // eslint-disable-next-line @next/next/no-img-element -- local object URL, not optimisable
                <img src={url} alt={`Preview of ${file.name}`} className="mx-auto max-h-[70dvh] w-auto rounded-md object-contain" />
              ) : kind === "pdf" && url && canShowPdfInline() ? (
                <iframe src={url} title={`Preview of ${file.name}`} className="h-[70dvh] w-full rounded-md border border-border bg-muted" />
              ) : kind === "text" ? (
                <TextPreview file={file} />
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border py-12 text-center">
                  <FileKindIcon file={file} className="size-10 text-muted-foreground" />
                  <p className="max-w-sm text-sm text-muted-foreground">
                    {kind === "pdf"
                      ? "This browser can't show PDFs inside the page. Open it in a new tab to check it before submitting."
                      : `${fileKindLabel(file)}s can't be previewed in the browser. Open it to check the contents before submitting.`}
                  </p>
                </div>
              )}
            </div>

            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                download={kind === null ? file.name : undefined}
                className="inline-flex min-h-11 items-center gap-2 self-start rounded-md px-1 text-sm font-medium text-primary underline-offset-4 hover:underline md:min-h-0 dark:text-primary-extralight"
              >
                <ExternalLink aria-hidden="true" className="size-4" />
                {kind === null ? "Download to check" : "Open in new tab"}
              </a>
            ) : null}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
