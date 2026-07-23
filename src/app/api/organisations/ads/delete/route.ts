import { NextResponse } from 'next/server';
import { strapiDelete } from '@/lib/apis/strapi';
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
                { success: false, error: 'You must be part of an organisation to delete ads' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { id } = body;

        if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid ad ID' },
                { status: 400 }
            );
        }

        await strapiDelete(`/advertisements/${id}`);

        return NextResponse.json({
            success: true,
            message: 'Ad deleted successfully'
        });

    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete ad'
            },
            { status: 500 }
        );
    }
}
