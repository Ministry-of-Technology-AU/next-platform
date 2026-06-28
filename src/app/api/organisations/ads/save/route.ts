import { NextResponse } from 'next/server';
import { strapiPost, strapiPut } from '@/lib/apis/strapi';
import { uploadImageToCloudinary } from '@/lib/apis/cloudinary';
import { auth } from '@/auth';
import { getUserIdByEmail, getOrganisationIdByUserId } from '@/lib/userid';

export async function POST(request: Request) {
    try {
        const session = await auth();
        const email = session?.user?.email;

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'User not authenticated' },
                { status: 401 }
            );
        }

        const userId = await getUserIdByEmail(email);

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User not found in system' },
                { status: 404 }
            );
        }

        const organisationId = await getOrganisationIdByUserId(userId);

        if (!organisationId) {
            return NextResponse.json(
                { success: false, error: 'You must be part of an organisation to create ads' },
                { status: 403 }
            );
        }

        const formData = await request.formData();

        const id = formData.get('id') as string | null;
        const title = formData.get('title') as string;
        const subtitle = formData.get('subtitle') as string;
        const description = formData.get('description') as string;
        const gradient = formData.get('gradient') as string;
        const buttons = formData.get('buttons') as string;
        const order = formData.get('order') as string;
        const imageFile = formData.get('image') as File | null;
        const startDate = formData.get('start_date') as string | null;
        const endDate = formData.get('end_date') as string | null;
        const titleStyle = formData.get('title_style') as string | null;
        const subtitleStyle = formData.get('subtitle_style') as string | null;
        const descriptionStyle = formData.get('description_style') as string | null;

        // If image is provided, upload to Cloudinary
        let bannerUrl = formData.get('banner_url') as string | null;
        if (imageFile && imageFile.size > 0) {
            try {
                const { url } = await uploadImageToCloudinary(
                    imageFile,
                    `ad-banner-${Date.now()}-${imageFile.name}`
                );
                bannerUrl = url;
            } catch (error) {
                console.error('Cloudinary upload failed:', error);
                return NextResponse.json(
                    { success: false, error: 'Image upload failed' },
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
        let parsedButtons = [];
        if (buttons) {
            try {
                parsedButtons = JSON.parse(buttons);
            } catch (e) {
                // Invalid JSON, ignore
            }
        }

        // Parse style JSONs
        let parsedTitleStyle = null;
        let parsedSubtitleStyle = null;
        let parsedDescriptionStyle = null;
        try { if (titleStyle) parsedTitleStyle = JSON.parse(titleStyle); } catch (e) { /* ignore */ }
        try { if (subtitleStyle) parsedSubtitleStyle = JSON.parse(subtitleStyle); } catch (e) { /* ignore */ }
        try { if (descriptionStyle) parsedDescriptionStyle = JSON.parse(descriptionStyle); } catch (e) { /* ignore */ }

        const adData: Record<string, any> = {
            data: {
                title: title || '',
                subtitle: subtitle || '',
                description: description || '',
                gradient: gradient || '',
                buttons: parsedButtons,
                order: parseInt(order) || 0,
                banner_url: bannerUrl,
                organisation: organisationId,
                publishedAt: null, // Keep as draft (unpublished)
                start_date: startDate || null,
                end_date: endDate || null,
                title_style: parsedTitleStyle,
                subtitle_style: parsedSubtitleStyle,
                description_style: parsedDescriptionStyle,
            }
        };

        const numericId = id ? parseInt(id) : NaN;
        const isRealStrapiId = id &&
            id !== 'undefined' &&
            !isNaN(numericId) &&
            numericId > 0 &&
            numericId < 10000;

        let response;
        if (isRealStrapiId) {
            response = await strapiPut(`/advertisements/${id}`, adData);
        } else {
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
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to save ad'
            },
            { status: 500 }
        );
    }
}
