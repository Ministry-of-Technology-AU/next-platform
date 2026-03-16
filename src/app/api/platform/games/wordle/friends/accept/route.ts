import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { strapiGet, strapiPut } from '@/lib/apis/strapi';
import { getUserIdByEmail } from '@/lib/userid';

/**
 * POST /api/platform/games/wordle/friends/accept
 * Accept a pending friend invite
 * Body: { email: string } — the sender's email
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const body = await request.json();
        const { email } = body;

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
        }

        const senderEmail = email.trim().toLowerCase();
        const recipientEmail = session.user.email.toLowerCase();

        // Get recipient (current user) data
        const recipientId = await getUserIdByEmail(recipientEmail);
        if (!recipientId) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const recipientResponse = await strapiGet(`/users/${recipientId}`, {
            fields: ['wordle_data']
        });

        const recipientData = recipientResponse?.wordle_data || {};
        const recipientIncoming: string[] = Array.isArray(recipientData.pendingInvitesReceived) ? recipientData.pendingInvitesReceived : [];
        const recipientFriends: string[] = Array.isArray(recipientData.friends) ? recipientData.friends : [];

        // Check if there's actually a pending invite from this sender
        if (!recipientIncoming.includes(senderEmail)) {
            return NextResponse.json({ success: false, error: 'No pending invite from this user' }, { status: 400 });
        }

        // Already friends
        if (recipientFriends.includes(senderEmail)) {
            // Clean up the pending invite
            recipientData.pendingInvitesReceived = recipientIncoming.filter((e: string) => e !== senderEmail);
            await strapiPut(`/users/${recipientId}`, { wordle_data: recipientData });
            return NextResponse.json({ success: true, message: 'Already friends' });
        }

        // Get sender data
        const senderId = await getUserIdByEmail(senderEmail);
        if (!senderId) {
            return NextResponse.json({ success: false, error: 'Inviter not found' }, { status: 404 });
        }

        const senderResponse = await strapiGet(`/users/${senderId}`, {
            fields: ['wordle_data']
        });

        const senderData = senderResponse?.wordle_data || {};
        const senderFriends: string[] = Array.isArray(senderData.friends) ? senderData.friends : [];
        const senderPending: string[] = Array.isArray(senderData.pendingInvitesSent) ? senderData.pendingInvitesSent : [];

        // Update recipient: add friend, remove from incoming pending
        recipientData.friends = [...recipientFriends, senderEmail];
        recipientData.pendingInvitesReceived = recipientIncoming.filter((e: string) => e !== senderEmail);
        await strapiPut(`/users/${recipientId}`, { wordle_data: recipientData });

        // Update sender: add friend, remove from sent pending
        senderData.friends = [...senderFriends, recipientEmail];
        senderData.pendingInvitesSent = senderPending.filter((e: string) => e !== recipientEmail);
        await strapiPut(`/users/${senderId}`, { wordle_data: senderData });

        return NextResponse.json({ success: true, message: 'Friend request accepted!' });

    } catch (error) {
        console.error('Error accepting friend invite:', error);
        return NextResponse.json({ success: false, error: 'Failed to accept invite' }, { status: 500 });
    }
}

/**
 * DELETE /api/platform/games/wordle/friends/accept
 * Reject/dismiss a pending friend invite
 * Body: { email: string } — the sender's email
 */
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const body = await request.json();
        const { email } = body;

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
        }

        const senderEmail = email.trim().toLowerCase();
        const recipientEmail = session.user.email.toLowerCase();

        // Update recipient: remove from incoming pending
        const recipientId = await getUserIdByEmail(recipientEmail);
        if (!recipientId) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const recipientResponse = await strapiGet(`/users/${recipientId}`, {
            fields: ['wordle_data']
        });

        const recipientData = recipientResponse?.wordle_data || {};
        const recipientIncoming: string[] = Array.isArray(recipientData.pendingInvitesReceived) ? recipientData.pendingInvitesReceived : [];
        recipientData.pendingInvitesReceived = recipientIncoming.filter((e: string) => e !== senderEmail);
        await strapiPut(`/users/${recipientId}`, { wordle_data: recipientData });

        // Update sender: remove from sent pending
        const senderId = await getUserIdByEmail(senderEmail);
        if (senderId) {
            const senderResponse = await strapiGet(`/users/${senderId}`, {
                fields: ['wordle_data']
            });

            const senderData = senderResponse?.wordle_data || {};
            const senderPending: string[] = Array.isArray(senderData.pendingInvitesSent) ? senderData.pendingInvitesSent : [];
            senderData.pendingInvitesSent = senderPending.filter((e: string) => e !== recipientEmail);
            await strapiPut(`/users/${senderId}`, { wordle_data: senderData });
        }

        return NextResponse.json({ success: true, message: 'Invite rejected' });

    } catch (error) {
        console.error('Error rejecting friend invite:', error);
        return NextResponse.json({ success: false, error: 'Failed to reject invite' }, { status: 500 });
    }
}
