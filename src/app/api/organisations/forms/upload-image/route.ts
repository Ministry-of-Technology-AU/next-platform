import { NextResponse } from 'next/server';
import { requireOrgSession, jsonOk, jsonError } from '@/lib/forms/api-helpers';
import { uploadImageToCloudinary } from '@/lib/apis/cloudinary';

export const dynamic = 'force-dynamic';

/**
 * POST /api/organisations/forms/upload-image
 * Uploads an image file directly to Cloudinary and returns the secure URL.
 */
export async function POST(request: Request) {
  try {
    const org = await requireOrgSession();
    if (org instanceof NextResponse) return org;

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File) || file.size === 0) {
      return jsonError('No image file provided', 400);
    }

    if (!file.type.startsWith('image/')) {
      return jsonError('Uploaded file must be an image', 400);
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return jsonError('Image exceeds the 10MB limit', 400);
    }

    const folder = `form-images/org-${org.organisationId}`;
    const { url, publicId } = await uploadImageToCloudinary(file, file.name, folder);

    return jsonOk({ url, publicId });
  } catch (err: any) {
    console.error('Form image upload failed:', err);
    return jsonError(err?.message || 'Failed to upload image', 500);
  }
}
