import { auth } from '@/auth';
import { jsonOk, jsonError, rateLimit } from '@/lib/forms/api-helpers';
import { getUserIdByEmail } from '@/lib/userid';
import {
  getFormByUidCached,
  isFormActive,
  getResponseRow,
  createResponseRow,
  updateResponseRow,
} from '@/lib/forms/strapi-forms';
import { uploadImageToCloudinary, uploadRawToCloudinary, deleteImageFromCloudinary } from '@/lib/apis/cloudinary';
import { FORM_LIMITS, type FileUploadBlock, type FileDescriptor, type FormSchema } from '@/lib/forms/schema';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ formId: string }> };

const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const DOC_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;
const DOC_EXT = /\.(pdf|docx?)$/i;

function findFileBlock(schema: FormSchema, blockId: string): FileUploadBlock | null {
  for (const page of schema.pages) {
    for (const block of page.blocks) {
      if (block.id === blockId && block.type === 'file-upload') return block;
    }
  }
  return null;
}

/** Enforce the block's accept policy against BOTH MIME and extension. */
function isAllowed(block: FileUploadBlock, file: File): { ok: true; isImage: boolean } | { ok: false } {
  const name = file.name;
  const type = file.type;
  const imageOk = IMAGE_MIME.has(type) && IMAGE_EXT.test(name);
  const docOk = DOC_MIME.has(type) && DOC_EXT.test(name) && !IMAGE_EXT.test(name);

  if (block.accept === 'images' && imageOk) return { ok: true, isImage: true };
  if (block.accept === 'documents' && docOk) return { ok: true, isImage: false };
  if (block.accept === 'both') {
    if (imageOk) return { ok: true, isImage: true };
    if (docOk) return { ok: true, isImage: false };
  }
  return { ok: false };
}

/** POST — upload one file for a file-upload block (spec §11). */
export async function POST(request: Request, ctx: RouteContext) {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) return jsonError('User not authenticated', 401);

    const { formId } = await ctx.params;
    if (!rateLimit(`upload:${email}:${formId}`, 20, 60_000)) {
      return jsonError('Too many uploads, please wait a moment', 429);
    }

    const form = await getFormByUidCached(formId);
    if (!form || !isFormActive(form)) return jsonError('Form not found', 404);

    const formData = await request.formData();
    const file = formData.get('file');
    const blockId = String(formData.get('blockId') ?? '');
    if (!(file instanceof File)) return jsonError('No file provided', 400);

    const block = findFileBlock(form.schema, blockId);
    if (!block) return jsonError('Invalid upload target', 400);

    const allowed = isAllowed(block, file);
    if (!allowed.ok) return jsonError('File type not allowed for this question', 400);

    const maxBytes = Math.min(block.maxSizeMB, FORM_LIMITS.fileMaxSizeMB) * 1024 * 1024;
    if (file.size > maxBytes) return jsonError(`File exceeds ${block.maxSizeMB}MB`, 400);

    // Enforce per-block file count against the caller's own row.
    let row = await getResponseRow(form.id, email);
    if (!row) {
      const userId = await getUserIdByEmail(email);
      row = await createResponseRow({ formId: form.id, userId, email });
    }
    const existingForBlock = (row?.files ?? []).filter((f) => f.blockId === blockId);
    if (existingForBlock.length >= block.maxFiles) {
      return jsonError(`At most ${block.maxFiles} file(s) allowed`, 400);
    }

    const folder = `form-uploads/${form.uid}`;
    const uploaded = allowed.isImage
      ? await uploadImageToCloudinary(file, file.name, folder)
      : await uploadRawToCloudinary(file, file.name, folder, file.type);

    const descriptor: FileDescriptor & { resourceType: 'image' | 'raw' } = {
      blockId,
      url: uploaded.url,
      publicId: uploaded.publicId,
      filename: file.name,
      bytes: file.size,
      resourceType: allowed.isImage ? 'image' : 'raw',
    };

    const nextFiles = [...(row?.files ?? []), descriptor];
    if (row) await updateResponseRow(row.id, { files: nextFiles });

    // Return the public descriptor (without the internal resourceType).
    const { resourceType: _rt, ...publicDescriptor } = descriptor;
    void _rt;
    return jsonOk(publicDescriptor);
  } catch (err) {
    console.error('POST upload failed:', err);
    return jsonError('Upload failed', 500);
  }
}

/** DELETE — remove one uploaded file the caller owns. */
export async function DELETE(request: Request, ctx: RouteContext) {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) return jsonError('User not authenticated', 401);

    const { formId } = await ctx.params;
    const body = await request.json().catch(() => ({}));
    const publicId = String((body as { publicId?: string })?.publicId ?? '');
    if (!publicId) return jsonError('Missing publicId', 400);

    const form = await getFormByUidCached(formId);
    if (!form) return jsonError('Form not found', 404);

    const row = await getResponseRow(form.id, email);
    if (!row) return jsonError('Nothing to delete', 404);

    const target = (row.files ?? []).find((f) => f.publicId === publicId) as
      | (FileDescriptor & { resourceType?: 'image' | 'raw' })
      | undefined;
    if (!target) return jsonError('File not found', 404);

    await deleteImageFromCloudinary(publicId, target.resourceType ?? 'image').catch((e) =>
      console.error('Cloudinary delete failed:', e),
    );

    const nextFiles = row.files.filter((f) => f.publicId !== publicId);
    await updateResponseRow(row.id, { files: nextFiles });

    return jsonOk({ deleted: true });
  } catch (err) {
    console.error('DELETE upload failed:', err);
    return jsonError('Delete failed', 500);
  }
}
