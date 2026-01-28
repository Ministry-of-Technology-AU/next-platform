import { NextResponse } from 'next/server';
import { strapiPost, strapiPut } from '@/lib/apis/strapi';
import { uploadImageAndGetEmbedLink } from '@/lib/apis/drive';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        // Extract form fields
        const id = formData.get('id') as string | null;
        const title = formData.get('title') as string;
        const subtitle = formData.get('subtitle') as string;
        const description = formData.get('description') as string;
        const gradient = formData.get('gradient') as string;
        const buttons = formData.get('buttons') as string;
        const order = formData.get('order') as string;
        const imageFile = formData.get('image') as File | null;



        // If image is provided, upload to Drive
        let bannerUrl = formData.get('banner_url') as string | null;
        if (imageFile && imageFile.size > 0) {
            try {
                bannerUrl = await uploadImageAndGetEmbedLink(
                    imageFile,
                    `ad-banner-${Date.now()}-${imageFile.name}`
                );
            } catch (error) {
                console.error('Error uploading image to Drive:', error);
                return NextResponse.json(
                    { success: false, error: 'Failed to upload image to Drive' },
                    { status: 500 }
                );
            }
        }

        // Validate banner URL exists
        if (!bannerUrl) {
            return NextResponse.json(
                { success: false, error: 'Banner image is required' },
                { status: 400 }
            );
        }

        // Parse buttons JSON
        let parsedButtons;
        try {
            parsedButtons = JSON.parse(buttons);
        } catch {
            parsedButtons = [];
        }

        // Prepare data for Strapi
        const adData = {
            data: {
                title,
                subtitle,
                description,
                gradient: gradient || '',
                buttons: parsedButtons,
                order: parseInt(order) || 0,
                banner_url: bannerUrl,
            }
        };

        let response;
        if (id && id !== 'null' && id !== 'undefined') {
            // Update existing ad
            response = await strapiPut(`/advertisements/${id}`, adData);
        } else {
            // Create new ad
            response = await strapiPost('/advertisements', adData);
        }

        return NextResponse.json({
            success: true,
            data: response.data,
            message: 'Ad saved successfully as draft'
        });

    } catch (error) {
        console.error('Error saving ad:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message || 'Failed to save ad' },
            { status: 500 }
        );
    }
}
