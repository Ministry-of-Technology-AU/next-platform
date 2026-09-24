/**
 * Client-side image compression, run when an image is added to an upload
 * field — long before submit — so the preview shows exactly what will be sent.
 *
 * Re-encoding also strips EXIF metadata (GPS location, device info).
 * Browser only: every entry point returns the original file during SSR.
 */

import { getExtension } from './files';

export interface CompressOptions {
  /** Longest edge in pixels after resizing. Default 2560. */
  maxDimension?: number;
  /** Encoder quality 0–1. Default 0.85. */
  quality?: number;
  /** Output type. Default `image/webp`. */
  type?: 'image/webp' | 'image/jpeg';
}

const EXT_FOR_TYPE: Record<NonNullable<CompressOptions['type']>, string> = {
  'image/webp': '.webp',
  'image/jpeg': '.jpg',
};

// Animated or vector formats lose information when flattened to one frame.
const SKIP_EXTS = new Set(['.gif', '.svg', '.heic', '.heif']);

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file, { imageOrientation: 'from-image' });
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Resize and re-encode an image. Returns the original file when compression
 * is not possible or would not make the file smaller. The returned file's
 * extension always matches its MIME type.
 */
export async function compressImage(file: File, options: CompressOptions = {}): Promise<File> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return file;
  if (!file.type.startsWith('image/') || SKIP_EXTS.has(getExtension(file.name))) return file;

  const { maxDimension = 2560, quality = 0.85, type = 'image/webp' } = options;

  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await decode(file);
  } catch {
    return file;
  }

  const width = 'naturalWidth' in source ? source.naturalWidth : source.width;
  const height = 'naturalHeight' in source ? source.naturalHeight : source.height;
  if (!width || !height) return file;

  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  if (type === 'image/jpeg') {
    // JPEG has no alpha; paint white so transparent PNGs don't turn black.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  if ('close' in source) source.close();

  const blob = await toBlob(canvas, type, quality);
  // Some browsers silently fall back to PNG when WebP encoding is unsupported.
  if (!blob || blob.type !== type) return file;
  if (scale === 1 && blob.size >= file.size) return file;

  const base = file.name.replace(/\.[^/.]+$/, '') || 'image';
  return new File([blob], `${base}${EXT_FOR_TYPE[type]}`, {
    type,
    lastModified: file.lastModified,
  });
}
