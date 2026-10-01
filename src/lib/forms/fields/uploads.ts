/**
 * Upload contract between the form fields and `POST /api/uploads`.
 *
 * Files stay in form state as `File` objects until the form is submitted.
 * The submit handler calls `uploadFiles()`, which sends each file to the
 * route; the route re-validates and stores it via `@/lib/apis/cloudinary`.
 */

import { z } from 'zod';

/** Where an upload belongs. Each target maps to a fixed Cloudinary folder server side. */
export const UPLOAD_TARGETS = ['general', 'forms', 'ads', 'profiles', 'compose', 'rti', 'assets'] as const;
export type UploadTarget = (typeof UPLOAD_TARGETS)[number];

export const uploadedFileSchema = z.object({
  url: z.url({ protocol: /^https$/ }),
  publicId: z.string().min(1),
  filename: z.string().min(1),
  bytes: z.number().int().nonnegative(),
  mime: z.string().min(1),
  resourceType: z.enum(['image', 'raw']),
});
export type UploadedFile = z.infer<typeof uploadedFileSchema>;

const uploadResponseSchema = z.discriminatedUnion('success', [
  z.object({ success: z.literal(true), data: uploadedFileSchema }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

export interface UploadProgress {
  /** Files finished so far. */
  completed: number;
  total: number;
  /** File currently uploading, or null when done. */
  current: File | null;
}

export interface UploadFilesOptions {
  target: UploadTarget;
  signal?: AbortSignal;
  onProgress?: (progress: UploadProgress) => void;
}

export class UploadError extends Error {
  constructor(
    message: string,
    readonly file: File,
    readonly uploaded: UploadedFile[],
  ) {
    super(message);
    this.name = 'UploadError';
  }
}

/**
 * Upload files one at a time, in order. Stops at the first failure and throws
 * an `UploadError` carrying the files that did upload, so callers can report
 * exactly which file failed.
 */
export async function uploadFiles(files: readonly File[], options: UploadFilesOptions): Promise<UploadedFile[]> {
  const { target, signal, onProgress } = options;
  const uploaded: UploadedFile[] = [];

  for (const [index, file] of files.entries()) {
    onProgress?.({ completed: index, total: files.length, current: file });

    const body = new FormData();
    body.append('file', file, file.name);
    body.append('target', target);

    let json: unknown;
    try {
      const res = await fetch('/api/uploads', { method: 'POST', body, signal });
      json = await res.json().catch(() => null);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') throw err;
      throw new UploadError(`Couldn't reach the server to upload ${file.name}. Check your connection and try again.`, file, uploaded);
    }

    const parsed = uploadResponseSchema.safeParse(json);
    if (!parsed.success) {
      throw new UploadError(`Upload of ${file.name} returned an unexpected response.`, file, uploaded);
    }
    if (!parsed.data.success) {
      throw new UploadError(`${file.name}: ${parsed.data.error}`, file, uploaded);
    }
    uploaded.push(parsed.data.data);
  }

  onProgress?.({ completed: files.length, total: files.length, current: null });
  return uploaded;
}
