import { NextResponse } from 'next/server';
import { strapiPost, strapiPut } from '@/lib/apis/strapi';
import { uploadImageToCloudinary } from '@/lib/apis/cloudinary';
import { auth } from '@/auth';
import { getUserIdByEmail, getOrganisationIdByUserId } from '@/lib/userid';

export async function POST(request: Request) {
    try {
        // Get current user session
        const session = await auth();
        const email = session?.user?.email;

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'User not authenticated' },
                { status: 401 }
            );
        }

        // Get Strapi user ID from email
        const userId = await getUserIdByEmail(email);

        if (!userId) {
            console.error('No Strapi user found for email:', email);
            return NextResponse.json(
                { success: false, error: 'User not found in system' },
                { status: 404 }
            );
        }
        console.log("User ID: ", userId)

        // Get organisation ID from user ID
        const organisationId = await getOrganisationIdByUserId(userId);

        if (!organisationId) {
            console.error('No organisation found for user:', userId);
            return NextResponse.json(
                { success: false, error: 'You must be part of an organisation to create ads' },
                { status: 403 }
            );
        }
        console.log("Organisation ID: ", organisationId)

        const formData = await request.formData();

        const id = formData.get('id') as string | null;
        const title = formData.get('title') as string;
        const subtitle = formData.get('subtitle') as string;
        const description = formData.get('description') as string;
        const gradient = formData.get('gradient') as string;
        const buttons = formData.get('buttons') as string;
        const order = formData.get('order') as string;
        const imageFile = formData.get('image') as File | null;


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
                console.error('Failed to parse buttons:', e);
            }
        }

        const adData = {
            data: {
                title: title || '',
                subtitle: subtitle || '',
                description: description || '',
                gradient: gradient || '',
                buttons: parsedButtons,
                order: parseInt(order) || 0,
                banner_url: bannerUrl,
                organisation: organisationId, // Link to organisation
                publishedAt: null, // Keep as draft (unpublished)
            }
        };

        // Determine if ID is a real Strapi ID or a temporary frontend ID
        // Real Strapi IDs are typically small integers (1, 2, 3, ...)
        // Frontend temporary IDs are Date.now() timestamps (1769668801472...)
        const numericId = id ? parseInt(id) : NaN;
        const isRealStrapiId = id &&
            id !== 'undefined' &&
            !isNaN(numericId) &&
            numericId > 0 &&
            numericId < 10000; // Threshold to detect temp IDs

        console.log('[SAVE AD] ID validation:', {
            rawId: id,
            numericId,
            isRealStrapiId,
            operation: isRealStrapiId ? 'UPDATE' : 'CREATE'
        });

        let response;
        if (isRealStrapiId) {
            // Update existing ad (keep as draft)
            console.log(`[SAVE AD] Updating existing ad with ID: ${id}`);
            response = await strapiPut(`/advertisements/${id}`, adData);
        } else {
            // Create new ad (as draft)
            console.log('[SAVE AD] Creating new ad');
            response = await strapiPost('/advertisements', adData);
        }

        console.log('[SAVE AD] Success:', response.data);

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
