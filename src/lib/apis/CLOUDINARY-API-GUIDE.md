# Cloudinary Integration Guide

This guide explains how to use Cloudinary for image storage in the platform.

---

## Overview

Cloudinary is used as our blob storage solution for advertisement banners and other images. All uploads are handled **securely on the server-side** to protect API credentials.

---

## Environment Variables

Add these to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **Security Note:** These credentials are NEVER exposed to the client. All uploads happen through Next.js API routes.

---

## Usage

### 1. Upload an Image

```typescript
import { uploadImageToCloudinary } from '@/lib/apis/cloudinary';

// In your API route
const file = formData.get('image') as File;
const { url, publicId } = await uploadImageToCloudinary(
    file,
    'my-image.jpg',
    'advertisements' // Cloudinary folder
);

// Save the URL to your database
// url: https://res.cloudinary.com/your-cloud/image/upload/v123/advertisements/timestamp-filename.jpg
```

**Parameters:**
- `file`: File object or Buffer
- `filename`: Original filename (used for naming)
- `folder`: Cloudinary folder path (optional, default: 'platform-ads')

**Returns:**
- `url`: Secure HTTPS URL to the uploaded image
- `publicId`: Cloudinary public ID (needed for deletion)

---

### 2. Delete an Image

```typescript
import { deleteImageFromCloudinary } from '@/lib/apis/cloudinary';

// Delete by public ID
await deleteImageFromCloudinary('advertisements/1234567890-banner');
```

---

### 3. Get Optimized Image URL

```typescript
import { getOptimizedImageUrl } from '@/lib/apis/cloudinary';

const originalUrl = 'https://res.cloudinary.com/...';

// Get a 800x400 optimized version
const optimizedUrl = getOptimizedImageUrl(originalUrl, {
    width: 800,
    height: 400,
    quality: 'auto:good',
    format: 'auto',
    crop: 'fill'
});
```

**Options:**
- `width`: Target width in pixels
- `height`: Target height in pixels
- `quality`: 'auto', 'auto:low', 'auto:good', 'auto:best', or number (1-100)
- `format`: 'auto', 'webp', 'jpg', 'png'
- `crop`: 'fill', 'fit', 'scale', 'limit'

---

### 4. Generate Placeholder for Progressive Loading

```typescript
import { getPlaceholderUrl } from '@/lib/apis/cloudinary';

const placeholderUrl = getPlaceholderUrl(originalUrl);
// Returns a tiny, low-quality version for blur-up effect
```

---

## Built-in Optimizations

The `uploadImageToCloudinary` function automatically applies:

1. **Quality Optimization**: `quality: 'auto:good'`
2. **Format Optimization**: `fetch_format: 'auto'` (serves WebP to supported browsers)
3. **Responsive Breakpoints**: Generates 5 sizes (300px - 1600px) for responsive images

---

## Security Best Practices

### ✅ DO

- **Always upload through API routes** (`/api/organisations/ads/save`, etc.)
- Keep credentials in `.env` files (never commit)
- Use server-side functions only

### ❌ DON'T

- Never expose API credentials to the client
- Don't use unsigned uploads (exposes your cloud name)
- Don't hardcode credentials in code

---

## Example: Complete Upload Flow

### 1. Frontend Form

```tsx
const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', 'My Ad');
    
    const response = await fetch('/api/organisations/ads/save', {
        method: 'POST',
        body: formData
    });
    
    const result = await response.json();
    // result.data.attributes.banner_url contains Cloudinary URL
};
```

### 2. Backend API Route

```typescript
import { uploadImageToCloudinary } from '@/lib/apis/cloudinary';

export async function POST(request: Request) {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    // Upload to Cloudinary (server-side, secure)
    const { url } = await uploadImageToCloudinary(
        imageFile,
        imageFile.name,
        'advertisements'
    );
    
    // Save URL to Strapi
    await strapiPost('/advertisements', {
        data: {
            title: formData.get('title'),
            banner_url: url
        }
    });
    
    return NextResponse.json({ success: true });
}
```

### 3. Display Image with Optimization

```tsx
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/apis/cloudinary';

const BannerImage = ({ url }: { url: string }) => {
    const optimizedUrl = getOptimizedImageUrl(url, {
        width: 1200,
        height: 500,
        quality: 'auto:good'
    });
    
    return (
        <Image
            src={optimizedUrl}
            alt="Banner"
            width={1200}
            height={500}
            priority
        />
    );
};
```

---

## Cloudinary Dashboard

Access your images at: `https://cloudinary.com/console`

- View all uploads
- Manually delete images
- Check usage/quota
- See transformation analytics

---

## Folder Structure

```
your-cloud-name/
└── platform-ads/
    ├── 1706567890-banner1.jpg
    ├── 1706567891-banner2.jpg
    └── ...
```

All ad banners are stored in the `platform-ads` folder for organization.

---

## Performance & CDN

Cloudinary provides:
- **Global CDN**: Fast delivery worldwide
- **Auto WebP**: Serves WebP to supported browsers
- **Lazy Loading**: Only loads images when needed
- **Responsive Images**: Automatically serves right size

---

## Free Tier Limits

Cloudinary free tier includes:
- **25 GB storage**
- **25 GB monthly bandwidth**
- **25,000 transformations/month**

This is usually sufficient for small-to-medium platforms. Monitor usage in the dashboard.

---

## Troubleshooting

### "Invalid API credentials"
- Check your `.env` file has correct values
- Restart your dev server after adding env vars

### "Upload failed"
- Check file size (Cloudinary has limits)
- Verify file is a valid image format
- Check console for detailed error messages

### Images not loading
- Verify URL is using HTTPS
- Check CORS settings in Cloudinary dashboard
- Ensure public read access is enabled

---

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Image Optimization Guide](https://cloudinary.com/documentation/image_optimization)
- [Next.js Integration](https://cloudinary.com/documentation/nextjs_integration)