import { z } from 'zod';
import { auth } from '@/auth';
import { jsonError, jsonOk, rateLimit } from '@/lib/forms/api-helpers';
import { uploadImageToCloudinary, uploadRawToCloudinary } from '@/lib/apis/cloudinary';
import {
  MAX_UPLOAD_MB,
  MB,
  UPLOAD_TARGETS,
  canonicalMime,
  cleanFilename,
  detectFileKind,
  verifyFileSignature,
  type UploadedFile,
} from '@/lib/forms/fields';
import { platform } from '@/lib/platform-logger';

export const dynamic = 'force-dynamic';

const targetSchema = z.enum(UPLOAD_TARGETS);

/**
 * POST /api/uploads
 *
 * Generic upload endpoint behind the `@/components/form` upload fields. Called
 * once per file at form submit time via `uploadFiles()` in
 * `@/lib/forms/fields/uploads`. The client already validated and compressed the
 * file; everything is checked again here because the client is untrusted.
 *
 * Body (multipart): `file` (File), `target` (one of UPLOAD_TARGETS).
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) return jsonError('Sign in to upload files', 401);

    if (!rateLimit(`uploads:${email}`, 30, 60_000)) {
      return jsonError('Too many uploads in a short time — wait a minute and try again', 429);
    }

    const formData = await request.formData().catch(() => null);
    if (!formData) return jsonError('Expected a multipart form upload', 400);

    const file = formData.get('file');
    if (!(file instanceof File)) return jsonError('No file provided', 400);

    const target = targetSchema.safeParse(formData.get('target'));
    if (!target.success) return jsonError('Unknown upload target', 400);

    if (file.size === 0) return jsonError('File is empty', 400);
    if (file.size > MAX_UPLOAD_MB * MB) return jsonError(`File exceeds ${MAX_UPLOAD_MB} MB`, 413);

    const filename = cleanFilename(file.name);
    const kind = detectFileKind({ name: filename, type: file.type });
    if (!kind) return jsonError('File type not allowed', 415);
    if (!(await verifyFileSignature(file))) {
      return jsonError("File contents don't match its type", 415);
    }

    const mime = canonicalMime({ name: filename, type: file.type });
    const folder = `uploads/${target.data}`;
    const isImage = kind === 'image';

    const stored = isImage
      ? await uploadImageToCloudinary(file, filename, folder, mime)
      : await uploadRawToCloudinary(file, filename, folder, mime);

    const result: UploadedFile = {
      url: stored.url,
      publicId: stored.publicId,
      filename,
      bytes: file.size,
      mime,
      resourceType: isImage ? 'image' : 'raw',
    };
    return jsonOk(result);
  } catch (err) {
    platform.error('POST /api/uploads failed:', err);
    return jsonError('Upload failed — try again', 500);
  }
}
