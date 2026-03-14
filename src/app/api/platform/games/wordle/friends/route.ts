import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { strapiGet, strapiPut } from '@/lib/apis/strapi';
import { getUserIdByEmail } from '@/lib/userid';
import { sendMail } from '@/lib/apis/mail';

/**
 * GET /api/platform/games/wordle/friends
 * Returns the current user's friends list and pending invites
 */
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
        }

        const userId = await getUserIdByEmail(session.user.email);
        if (!userId) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const userResponse = await strapiGet(`/users/${userId}`, {
            fields: ['wordle_data']
        });

        const wordleData = userResponse?.wordle_data || {};
        const friends: string[] = Array.isArray(wordleData.friends) ? wordleData.friends : [];
        const pendingInvitesSent: string[] = Array.isArray(wordleData.pendingInvitesSent) ? wordleData.pendingInvitesSent : [];
        const pendingInvitesReceived: string[] = Array.isArray(wordleData.pendingInvitesReceived) ? wordleData.pendingInvitesReceived : [];

        return NextResponse.json({
            success: true,
            friends,
            pendingInvitesSent,
            pendingInvitesReceived
        });

    } catch (error) {
        console.error('Error fetching friends:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch friends' }, { status: 500 });
    }
}

/**
 * POST /api/platform/games/wordle/friends
 * Send a friend invite by email
 * Body: { email: string }
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

        const recipientEmail = email.trim().toLowerCase();
        const senderEmail = session.user.email.toLowerCase();

        // Can't invite yourself
        if (recipientEmail === senderEmail) {
            return NextResponse.json({ success: false, error: 'You cannot invite yourself' }, { status: 400 });
        }

        // Get sender's data
        const senderId = await getUserIdByEmail(senderEmail);
        if (!senderId) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const senderResponse = await strapiGet(`/users/${senderId}`, {
            fields: ['wordle_data', 'username']
        });

        const senderData = senderResponse?.wordle_data || {};
        const senderFriends: string[] = Array.isArray(senderData.friends) ? senderData.friends : [];
        const senderPending: string[] = Array.isArray(senderData.pendingInvitesSent) ? senderData.pendingInvitesSent : [];

        // Already friends
        if (senderFriends.includes(recipientEmail)) {
            return NextResponse.json({ success: false, error: 'Already friends with this user' }, { status: 400 });
        }

        // Already sent invite
        if (senderPending.includes(recipientEmail)) {
            return NextResponse.json({ success: false, error: 'Invite already sent to this user' }, { status: 400 });
        }

        // Check if recipient exists on the platform
        const recipientId = await getUserIdByEmail(recipientEmail);
        if (!recipientId) {
            return NextResponse.json({ success: false, error: 'User not found on the platform' }, { status: 404 });
        }

        // Get recipient's data to add incoming invite
        const recipientResponse = await strapiGet(`/users/${recipientId}`, {
            fields: ['wordle_data']
        });

        const recipientData = recipientResponse?.wordle_data || {};
        const recipientIncoming: string[] = Array.isArray(recipientData.pendingInvitesReceived) ? recipientData.pendingInvitesReceived : [];

        // Check if recipient already sent us an invite — auto-accept!
        const recipientPendingSent: string[] = Array.isArray(recipientData.pendingInvitesSent) ? recipientData.pendingInvitesSent : [];
        if (recipientPendingSent.includes(senderEmail)) {
            // Auto-accept: they invited us, we're inviting them back — just add as friends
            const recipientFriends: string[] = Array.isArray(recipientData.friends) ? recipientData.friends : [];

            // Update sender: add friend, don't add to pending
            senderData.friends = [...senderFriends, recipientEmail];
            await strapiPut(`/users/${senderId}`, { wordle_data: senderData });

            // Update recipient: add friend, remove from pendingInvitesSent
            recipientData.friends = [...recipientFriends, senderEmail];
            recipientData.pendingInvitesSent = recipientPendingSent.filter((e: string) => e !== senderEmail);
            recipientData.pendingInvitesReceived = recipientIncoming.filter((e: string) => e !== senderEmail);
            await strapiPut(`/users/${recipientId}`, { wordle_data: recipientData });

            return NextResponse.json({
                success: true,
                message: 'You are now friends! (they had already invited you)',
                autoAccepted: true
            });
        }

        // Add to sender's pending invites sent
        senderData.pendingInvitesSent = [...senderPending, recipientEmail];
        await strapiPut(`/users/${senderId}`, { wordle_data: senderData });

        // Add to recipient's pending invites received
        recipientData.pendingInvitesReceived = [...recipientIncoming, senderEmail];
        await strapiPut(`/users/${recipientId}`, { wordle_data: recipientData });

        // Send invite email
        const senderName = senderResponse?.username || senderEmail;
        const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://platform.ashoka.edu.in'}/platform/games/ashoka-wordle?accept_from=${encodeURIComponent(senderEmail)}`;

        await sendMail({
            to: recipientEmail,
            subject: `${senderName} wants to compare Wordle scores with you! 🟩`,
            alias: 'Ashoka Wordle',
            html: `
                <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
                    <h2 style="color: #2d7a4f;">🟩 Wordle Friend Invite!</h2>
                    <p><strong>${senderName}</strong> has invited you to compare daily Wordle scores on the Ashoka Platform!</p>
                    <p>Once you accept, you'll be able to see each other's daily scores, streaks, and compete head-to-head.</p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${acceptUrl}" 
                           style="background-color: #2d7a4f; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                            Accept Invite
                        </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">Or open Ashoka Wordle and accept from your pending invites.</p>
                </div>
            `
        });

        return NextResponse.json({
            success: true,
            message: 'Invite sent successfully'
        });

    } catch (error) {
        console.error('Error sending friend invite:', error);
        return NextResponse.json({ success: false, error: 'Failed to send invite' }, { status: 500 });
    }
}

/**
 * DELETE /api/platform/games/wordle/friends
 * Remove a friend
 * Body: { email: string }
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

        const targetEmail = email.trim().toLowerCase();
        const currentEmail = session.user.email.toLowerCase();

        // Get current user's data
        const currentUserId = await getUserIdByEmail(currentEmail);
        if (!currentUserId) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const currentUserResponse = await strapiGet(`/users/${currentUserId}`, {
            fields: ['wordle_data']
        });

        const currentData = currentUserResponse?.wordle_data || {};
        const currentFriends: string[] = Array.isArray(currentData.friends) ? currentData.friends : [];

        // Remove from current user's friends
        currentData.friends = currentFriends.filter((e: string) => e !== targetEmail);
        await strapiPut(`/users/${currentUserId}`, { wordle_data: currentData });

        // Remove from target user's friends (bidirectional)
        const targetUserId = await getUserIdByEmail(targetEmail);
        if (targetUserId) {
            const targetResponse = await strapiGet(`/users/${targetUserId}`, {
                fields: ['wordle_data']
            });

            const targetData = targetResponse?.wordle_data || {};
            const targetFriends: string[] = Array.isArray(targetData.friends) ? targetData.friends : [];
            targetData.friends = targetFriends.filter((e: string) => e !== currentEmail);
            await strapiPut(`/users/${targetUserId}`, { wordle_data: targetData });
        }

        return NextResponse.json({ success: true, message: 'Friend removed' });

    } catch (error) {
        console.error('Error removing friend:', error);
        return NextResponse.json({ success: false, error: 'Failed to remove friend' }, { status: 500 });
    }
}
