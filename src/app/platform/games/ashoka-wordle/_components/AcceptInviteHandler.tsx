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
        if (!acceptFrom || processed.current) return;

        processed.current = true;

        async function acceptInvite() {
            try {
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
            } catch {
                toast.error('Failed to accept invite');
            }

            // Clean up the URL (remove query param)
            const url = new URL(window.location.href);
            url.searchParams.delete('accept_from');
            window.history.replaceState({}, '', url.pathname);
        }

        acceptInvite();
    }, [searchParams]);

    return null;
}
