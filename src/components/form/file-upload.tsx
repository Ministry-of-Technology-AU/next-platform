"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Eye, ImagePlus, Upload, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  MAX_UPLOAD_MB,
  acceptForKinds,
  describeAccept,
  formatBytes,
  previewKind,
  type CompressOptions,
  type FileKind,
} from "@/lib/forms/fields";
import { cn } from "@/lib/utils";
import { FieldShell, controlAria, useFieldIds, type FieldIds } from "./field-shell";
import { FileKindIcon, FilePreviewDialog, fileKindLabel } from "./file-preview";
import type { FieldBaseProps } from "./types";
import { useFieldValidation } from "./use-field-validation";
import { useFileIntake, useObjectUrls } from "./use-file-intake";
import { useForwardedRef } from "./utils";

/**
 * Local file fields. Files are validated (type, magic bytes, size), images are
 * compressed, and everything stays in form state as `File` objects with a
 * preview. Nothing is uploaded until the form is submitted — call
 * `uploadFiles()` from `@/lib/forms/fields` in your submit handler.
 */

interface UploadFieldProps extends FieldBaseProps {
  multiple?: boolean;
  /** Per-file limit in MB. Capped at 10. */
  maxSize?: number;
  /** Maximum number of files when `multiple`. */
  maxFiles?: number;
  /** Combined size limit in MB. */
  maxTotalSize?: number;
  value?: File[];
  onChange?: (files: File[]) => void;
  /** Compress images as they are added. Default true. */
  compressImages?: boolean | CompressOptions;
  ref?: React.Ref<HTMLElement>;
}

// ---------------------------------------------------------------------------
// Dropzone
// ---------------------------------------------------------------------------

interface DropzoneProps {
  ids: FieldIds;
  accept: string;
  multiple: boolean;
  disabled?: boolean;
  busy: boolean;
  invalid: boolean;
  aria: ReturnType<typeof controlAria>;
  icon: React.ReactNode;
  prompt: string;
  hint: string;
  onFiles: (files: File[]) => void;
  onBlur: () => void;
  forwardRef: (el: HTMLButtonElement | null) => void;
  compact?: boolean;
}

/**
 * Click, keyboard (Enter/Space), drag-and-drop and paste all feed one intake.
 * The trigger is a real <button>, so it is focusable and announced; the file
 * input itself stays hidden from the tab order.
 */
function Dropzone({
  ids,
  accept,
  multiple,
  disabled,
  busy,
  invalid,
  aria,
  icon,
  prompt,
  hint,
  onFiles,
  onBlur,
  forwardRef,
  compact,
}: DropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const depth = React.useRef(0);
  const reduceMotion = useReducedMotion();
  const inactive = disabled || busy;

  const takeFiles = (list: FileList | null | undefined) => {
    const files = Array.from(list ?? []);
    if (files.length > 0) onFiles(files);
  };

  return (
    <motion.div
      animate={dragging && !reduceMotion ? { scale: 1.01 } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onDragEnter={(e) => {
        if (inactive || !e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        depth.current += 1;
        setDragging(true);
      }}
      onDragOver={(e) => {
        if (inactive || !e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setDragging(false);
      }}
      onDrop={(e) => {
        if (inactive) return;
        e.preventDefault();
        depth.current = 0;
        setDragging(false);
        takeFiles(e.dataTransfer.files);
      }}
    >
      <button
        ref={forwardRef}
        id={ids.controlId}
        type="button"
        disabled={disabled}
        aria-disabled={busy || undefined}
        aria-busy={busy || undefined}
        onClick={() => {
          if (!inactive) inputRef.current?.click();
        }}
        onPaste={(e) => {
          if (inactive) return;
          if (e.clipboardData.files.length > 0) {
            e.preventDefault();
            takeFiles(e.clipboardData.files);
          }
        }}
        onBlur={onBlur}
        {...aria}
        className={cn(
          "group/drop flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-background text-center transition-colors duration-200 outline-none",
          compact ? "px-4 py-5" : "px-6 py-8",
          "hover:border-primary/60 hover:bg-primary/[0.03] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-progress",
          dragging && "border-solid border-primary bg-primary/[0.06]",
          invalid && !dragging && "border-destructive/70",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "mb-1 flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors",
            (dragging || busy) && "bg-primary/10 text-primary dark:text-primary-extralight",
          )}
        >
          {busy ? <Spinner className="size-5" aria-hidden="true" /> : icon}
        </span>
        <span className="text-sm font-medium text-foreground">
          {busy ? "Checking files…" : dragging ? "Drop to add" : prompt}
        </span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={(e) => {
          takeFiles(e.target.files);
          // Allow picking the same file again after removing it.
          e.target.value = "";
        }}
      />
    </motion.div>
  );
}

function RemoveButton({ file, onRemove, className }: { file: File; onRemove: () => void; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${file.name}`}
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive-text md:size-8",
            className,
          )}
        >
          <X className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent>Remove {file.name} — it won&apos;t be uploaded</TooltipContent>
    </Tooltip>
  );
}

function PreviewButton({ file, onPreview }: { file: File; onPreview: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onPreview}
          aria-label={`Preview ${file.name}`}
          className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:size-8"
        >
          <Eye className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent>Preview before submitting</TooltipContent>
    </Tooltip>
  );
}

const listItemMotion = (reduce: boolean | null) => ({
  initial: reduce ? { opacity: 0 } : { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, transition: { duration: 0.12 } },
  transition: { duration: 0.18, ease: "easeOut" as const },
});

function limitHint(maxSizeMB: number, multiple: boolean, maxFiles?: number, maxTotalSize?: number) {
  const parts = [`up to ${Math.min(maxSizeMB, MAX_UPLOAD_MB)} MB each`];
  if (multiple && maxFiles !== undefined) parts.push(`${maxFiles} files max`);
  if (maxTotalSize !== undefined) parts.push(`${maxTotalSize} MB total`);
  return parts.join(" · ");
}

function combineErrors(fieldError: string | undefined, rejections: string[]) {
  if (rejections.length === 0) return fieldError;
  const shown = rejections.slice(0, 3).join(". ");
  const more = rejections.length > 3 ? `. ${rejections.length - 3} more files were not added` : "";
  return `${shown}${more}`;
}

// ---------------------------------------------------------------------------
// File upload
// ---------------------------------------------------------------------------

export interface FileUploadProps extends UploadFieldProps {
  /** HTML accept string, e.g. ".pdf,.docx,image/*". */
  accept?: string;
  /** Restrict to these kinds instead of (or on top of) `accept`. */
  kinds?: readonly FileKind[];
}

export function FileUpload({
  title,
  description,
  className,
  isRequired = false,
  errorMessage,
  accept = "*/*",
  kinds,
  multiple = false,
  maxSize = 10,
  maxFiles,
  maxTotalSize,
  compressImages = true,
  value = [],
  onChange,
  onBlur,
  disabled,
  name,
  id,
  schema,
  ref,
}: FileUploadProps) {
  const ids = useFieldIds(id, name);
  const forwardRef = useForwardedRef<HTMLButtonElement>(ref);
  const reduceMotion = useReducedMotion();
  const [previewing, setPreviewing] = React.useState<File | null>(null);
  const urls = useObjectUrls(value);
  const effectiveAccept = kinds ? acceptForKinds(kinds) : accept;

  const { error, handleBlur, revalidate } = useFieldValidation({ value, schema, externalError: errorMessage, onBlur });
  const intake = useFileIntake({
    value,
    onChange: (files) => {
      onChange?.(files);
      revalidate(files);
    },
    accept,
    kinds,
    multiple,
    maxSizeMB: maxSize,
    maxFiles,
    maxTotalMB: maxTotalSize,
    compress: compressImages,
  });

  const shownError = combineErrors(error, intake.rejections);
  const aria = controlAria(ids, { hasDescription: Boolean(description), error: shownError, required: isRequired });
  const totalBytes = value.reduce((sum, f) => sum + f.size, 0);

  return (
    <FieldShell
      ids={ids}
      title={title}
      description={description}
      isRequired={isRequired}
      error={shownError}
      className={className}
      disabled={disabled}
      labelAside={
        value.length > 1 ? (
          <span className="text-xs tabular-nums text-muted-foreground">
            {value.length} files · {formatBytes(totalBytes)}
          </span>
        ) : undefined
      }
    >
      <Dropzone
        ids={ids}
        accept={effectiveAccept}
        multiple={multiple}
        disabled={disabled}
        busy={intake.busy}
        invalid={Boolean(shownError)}
        aria={aria}
        icon={<Upload className="size-5" />}
        prompt={value.length > 0 && !multiple ? "Replace file" : "Choose a file or drag it here"}
        hint={`${describeAccept(effectiveAccept)} · ${limitHint(maxSize, multiple, maxFiles, maxTotalSize)}`}
        onFiles={(files) => void intake.add(files)}
        onBlur={handleBlur}
        forwardRef={forwardRef}
        compact={value.length > 0}
      />

      {value.length > 0 ? (
        <ul aria-label={`${title || "Selected"} files`} className="space-y-1.5">
          <AnimatePresence initial={false}>
            {value.map((file) => {
              const url = urls.get(file);
              return (
                <motion.li
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  layout={!reduceMotion}
                  {...listItemMotion(reduceMotion)}
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 py-1.5 pl-2 pr-1"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background">
                    {previewKind(file) === "image" && url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- local object URL
                      <img src={url} alt="" className="size-full object-cover" />
                    ) : (
                      <FileKindIcon file={file} className="size-5 text-muted-foreground" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground" title={file.name}>
                      {file.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {fileKindLabel(file)} · {formatBytes(file.size)}
                    </span>
                  </span>
                  <PreviewButton file={file} onPreview={() => setPreviewing(file)} />
                  {!disabled ? <RemoveButton file={file} onRemove={() => intake.remove(file)} /> : null}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      ) : null}

      <FilePreviewDialog
        file={previewing}
        url={previewing ? urls.get(previewing) : undefined}
        onOpenChange={(open) => {
          if (!open) setPreviewing(null);
        }}
      />
    </FieldShell>
  );
}

// ---------------------------------------------------------------------------
// Image upload
// ---------------------------------------------------------------------------

export type ImageUploadProps = UploadFieldProps;

export function ImageUpload({
  title,
  description,
  className,
  isRequired = false,
  errorMessage,
  multiple = false,
  maxSize = 10,
  maxFiles,
  maxTotalSize,
  compressImages = true,
  value = [],
  onChange,
  onBlur,
  disabled,
  name,
  id,
  schema,
  ref,
}: ImageUploadProps) {
  const ids = useFieldIds(id, name);
  const forwardRef = useForwardedRef<HTMLButtonElement>(ref);
  const reduceMotion = useReducedMotion();
  const [previewing, setPreviewing] = React.useState<File | null>(null);
  const urls = useObjectUrls(value);
  const accept = acceptForKinds(["image"]);

  const { error, handleBlur, revalidate } = useFieldValidation({ value, schema, externalError: errorMessage, onBlur });
  const intake = useFileIntake({
    value,
    onChange: (files) => {
      onChange?.(files);
      revalidate(files);
    },
    kinds: ["image"],
    multiple,
    maxSizeMB: maxSize,
    maxFiles,
    maxTotalMB: maxTotalSize,
    compress: compressImages,
  });

  const shownError = combineErrors(error, intake.rejections);
  const aria = controlAria(ids, { hasDescription: Boolean(description), error: shownError, required: isRequired });

  return (
    <FieldShell
      ids={ids}
      title={title}
      description={description}
      isRequired={isRequired}
      error={shownError}
      className={className}
      disabled={disabled}
    >
      <Dropzone
        ids={ids}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        busy={intake.busy}
        invalid={Boolean(shownError)}
        aria={aria}
        icon={<ImagePlus className="size-5" />}
        prompt={value.length > 0 && !multiple ? "Replace image" : multiple ? "Choose images or drag them here" : "Choose an image or drag it here"}
        hint={`JPG, PNG, WebP or GIF · ${limitHint(maxSize, multiple, maxFiles, maxTotalSize)} · optimised automatically`}
        onFiles={(files) => void intake.add(files)}
        onBlur={handleBlur}
        forwardRef={forwardRef}
        compact={value.length > 0}
      />

      {value.length > 0 ? (
        <ul aria-label={`${title || "Selected"} images`} className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          <AnimatePresence initial={false}>
            {value.map((file) => {
              const url = urls.get(file);
              return (
                <motion.li
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  layout={!reduceMotion}
                  {...listItemMotion(reduceMotion)}
                  className="group/thumb relative overflow-hidden rounded-lg border border-border bg-muted"
                >
                  <button
                    type="button"
                    onClick={() => setPreviewing(file)}
                    aria-label={`Preview ${file.name}, ${formatBytes(file.size)}`}
                    className="block aspect-[4/3] w-full cursor-zoom-in outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- local object URL
                      <img src={url} alt="" className="size-full object-cover" />
                    ) : null}
                  </button>
                  <span className="pointer-events-none absolute bottom-1.5 left-1.5 rounded bg-background/90 px-1.5 py-0.5 text-[11px] font-medium text-foreground tabular-nums shadow-sm backdrop-blur-sm">
                    {formatBytes(file.size)}
                  </span>
                  {!disabled ? (
                    <RemoveButton
                      file={file}
                      onRemove={() => intake.remove(file)}
                      className="absolute right-1 top-1 bg-background/90 text-foreground shadow-sm backdrop-blur-sm md:size-8"
                    />
                  ) : null}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      ) : null}

      <FilePreviewDialog
        file={previewing}
        url={previewing ? urls.get(previewing) : undefined}
        onOpenChange={(open) => {
          if (!open) setPreviewing(null);
        }}
      />
    </FieldShell>
  );
}
