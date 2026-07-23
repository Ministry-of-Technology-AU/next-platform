import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image to Cloudinary
 * @param file - File object or Buffer to upload
 * @param filename - Original filename (used for public_id)
 * @param folder - Cloudinary folder to upload to (default: 'platform-ads')
 * @returns Promise with Cloudinary upload result containing secure_url
 */
export async function uploadImageToCloudinary(
    file: File | Buffer,
    filename: string,
    folder: string = 'platform-ads'
): Promise<{ url: string; publicId: string }> {
    try {
        // Convert File to Buffer if needed
        let buffer: Buffer;
        if (file instanceof File) {
            const arrayBuffer = await file.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        } else {
            buffer = file;
        }

        // Convert buffer to base64 data URI
        const base64Data = `data:image/jpeg;base64,${buffer.toString('base64')}`;

        // Upload to Cloudinary with optimizations
        const uploadResponse = await cloudinary.uploader.upload(base64Data, {
            folder: folder,
            public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, '')}`, // Remove extension
            resource_type: 'image',
            // Optimization settings
            quality: 'auto:good',
            format: 'webp',
            fetch_format: 'auto',
            // Generate responsive breakpoints for better performance
            responsive_breakpoints: {
                create_derived: true,
                bytes_step: 20000,
                min_width: 300,
                max_width: 1600,
                max_images: 5
            }
        });

        return {
            url: uploadResponse.secure_url,
            publicId: uploadResponse.public_id
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error(`Failed to upload image to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Upload a non-image file (PDF / Word doc) to Cloudinary as a `raw` resource.
 * Used by the form builder's file-upload blocks for document uploads (spec §11).
 * @param file - File object or Buffer to upload
 * @param filename - Original filename (used for public_id, extension preserved)
 * @param folder - Cloudinary folder to upload to
 * @param mime - MIME type for the data URI (default: application/octet-stream)
 * @returns Promise with { url, publicId }
 */
export async function uploadRawToCloudinary(
    file: File | Buffer,
    filename: string,
    folder: string = 'form-uploads',
    mime: string = 'application/octet-stream'
): Promise<{ url: string; publicId: string }> {
    try {
        let buffer: Buffer;
        if (file instanceof File) {
            const arrayBuffer = await file.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        } else {
            buffer = file;
        }

        const base64Data = `data:${mime};base64,${buffer.toString('base64')}`;
        const ext = filename.match(/\.[^/.]+$/)?.[0] ?? '';
        const baseName = filename.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9_-]+/gi, '-');

        const uploadResponse = await cloudinary.uploader.upload(base64Data, {
            folder,
            public_id: `${Date.now()}-${baseName}${ext}`,
            resource_type: 'raw',
        });

        return {
            url: uploadResponse.secure_url,
            publicId: uploadResponse.public_id,
        };
    } catch (error) {
        console.error('Cloudinary raw upload error:', error);
        throw new Error(`Failed to upload file to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Delete an asset from Cloudinary
 * @param publicId - The public ID of the asset to delete
 * @param resourceType - 'image' (default) or 'raw' for documents
 * @returns Promise with deletion result
 */
export async function deleteImageFromCloudinary(publicId: string, resourceType: 'image' | 'raw' = 'image'): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error(`Failed to delete image from Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}


// Re-export client-safe URL utilities from separate module
// This prevents bundling the server-only Cloudinary SDK in client components
export { getOptimizedImageUrl, getPlaceholderUrl } from './cloudinary-url';

export default cloudinary;
