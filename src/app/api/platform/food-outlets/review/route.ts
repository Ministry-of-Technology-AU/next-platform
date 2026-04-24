import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { strapiGet, strapiPost, strapiPut } from '@/lib/apis/strapi';
import { getUserIdByEmail } from '@/lib/userid';

export async function POST(req: Request) {
    try {
        const user = await getAuthenticatedUser();
        if (!user || !user.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { rating, reviewText, foodOutletId } = body;

        if (!rating || !foodOutletId) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }
        const authorId = await getUserIdByEmail(user.email);
        
        if (!authorId) {
            console.warn('Could not find user in strapi:', user.email);
            return NextResponse.json({ success: false, error: 'User mapping failed' }, { status: 400 });
        }

        // Check if a review already exists for this user and outlet
        const existingReviews: any = await strapiGet('/food-outlet-reviews', {
            filters: {
                author: authorId,
                foodOutlet: foodOutletId // documentId directly from frontend
            }
        });

        const payload = {
            data: {
                rating: Number(rating),
                reviewText: reviewText || "",
                foodOutlet: foodOutletId, // DocumentId works perfectly on POST in v5
                author: authorId
            }
        };

        let result;
        const reviews = existingReviews?.data || [];
        try {
            if (reviews.length > 0) {
                // Update existing review
                const reviewId = reviews[0].documentId || reviews[0].id;
                result = await strapiPut(`/food-outlet-reviews/${reviewId}`, payload);
            } else {
                // Create new review
                result = await strapiPost('/food-outlet-reviews', payload);
            }
        } catch (strapiError: any) {
            console.error('Strapi Validation Error:', JSON.stringify(strapiError.response?.data, null, 2));
            throw strapiError;
        }

        return NextResponse.json({
            success: true,
            data: result.data || result
        });
    } catch (error: any) {
        console.error('Error posting food outlet review:', error.message);
        return NextResponse.json(
            { success: false, error: 'Failed to post review' },
            { status: 500 }
        );
    }
}
