'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

/**
 * Handles auto-accepting friend invites when the page loads with ?accept_from=<email>
 * Renders nothing visually — just processes the URL parameter.
 */
export default function AcceptInviteHandler() {
    const searchParams = useSearchParams();
    const processed = useRef(false);

    useEffect(() => {
        const acceptFrom = searchParams.get('accept_from');
        const rejectFrom = searchParams.get('reject_from');
        
        if (processed.current || (!acceptFrom && !rejectFrom)) return;

        processed.current = true;

        async function processInvite() {
            try {
                if (acceptFrom) {
                    const res = await fetch('/api/platform/games/wordle/friends/accept', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: acceptFrom })
                    });
                    const data = await res.json();
                    if (data.success) {
                        toast.success('Friend request accepted! 🎉');
                    } else {
                        toast.error(data.error || 'Could not accept invite');
                    }
                } else if (rejectFrom) {
                    const res = await fetch('/api/platform/games/wordle/friends/accept', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: rejectFrom })
                    });
                    const data = await res.json();
                    if (data.success) {
                        toast.success('Invite dismissed');
                    } else {
                        toast.error(data.error || 'Could not reject invite');
                    }
                }
            } catch {
                toast.error('Failed to process invite');
            }

            // Clean up the URL (remove query params)
            const url = new URL(window.location.href);
            url.searchParams.delete('accept_from');
            url.searchParams.delete('reject_from');
            window.history.replaceState({}, '', url.pathname);
        }

        processInvite();
    }, [searchParams]);

    return null;
}
