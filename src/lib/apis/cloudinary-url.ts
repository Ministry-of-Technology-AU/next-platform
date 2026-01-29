/**
 * Client-safe Cloudinary URL transformation utilities
 * These functions can be used in both server and client components
 * as they only manipulate URL strings without requiring the Cloudinary SDK
 */

/**
 * Get an optimized image URL with transformations
 * @param url - Original Cloudinary URL
 * @param options - Transformation options
 * @returns Optimized URL with transformations
 */
export function getOptimizedImageUrl(
    url: string,
    options: {
        width?: number;
        height?: number;
        quality?: 'auto' | 'auto:low' | 'auto:good' | 'auto:best' | number;
        format?: 'auto' | 'webp' | 'jpg' | 'png';
        crop?: 'fill' | 'fit' | 'scale' | 'limit';
    } = {}
): string {
    const {
        width,
        height,
        quality = 'auto:good',
        format = 'auto',
        crop = 'fill'
    } = options;

    // Extract the upload path from URL
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return url;

    const transformations: string[] = [];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (crop) transformations.push(`c_${crop}`);
    transformations.push(`q_${quality}`);
    transformations.push(`f_${format}`);

    const transformationString = transformations.join(',');

    return url.replace('/upload/', `/upload/${transformationString}/`);
}

/**
 * Generate a placeholder blur URL for progressive loading
 * @param url - Original Cloudinary URL
 * @returns Low-quality placeholder URL
 */
export function getPlaceholderUrl(url: string): string {
    return getOptimizedImageUrl(url, {
        width: 20,
        quality: 'auto:low',
        format: 'auto'
    });
}
