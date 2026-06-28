'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Flame, Clock, Check, X, UserMinus, Trophy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import InviteFriendDialog from './InviteFriendDialog';

interface FriendScore {
    email: string;
    username: string;
    played: boolean;
    won: boolean;
    guesses: number;
    time: number;
    currentStreak: number;
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

interface FriendsPanelProps {
    mode?: 'all' | 'invites' | 'scores';
}

export default function FriendsPanel({ mode = 'all' }: FriendsPanelProps) {
    const [friends, setFriends] = useState<string[]>([]);
    const [scores, setScores] = useState<FriendScore[]>([]);
    const [pendingSent, setPendingSent] = useState<string[]>([]);
    const [pendingReceived, setPendingReceived] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [friendsRes, scoresRes] = await Promise.all([
                fetch('/api/platform/games/wordle/friends'),
                fetch('/api/platform/games/wordle/friends/scores')
            ]);

            const friendsData = await friendsRes.json();
            const scoresData = await scoresRes.json();

            if (friendsData.success) {
                setFriends(friendsData.friends || []);
                setPendingSent(friendsData.pendingInvitesSent || []);
                setPendingReceived(friendsData.pendingInvitesReceived || []);
            }

            if (scoresData.success) {
                setScores(scoresData.scores || []);
            }
        } catch (error) {
            console.error('Error fetching friends data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAcceptInvite = async (email: string) => {
        setActionLoading(email);
        try {
            const res = await fetch('/api/platform/games/wordle/friends/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Friend request accepted! 🎉');
                fetchData();
            } else {
                toast.error(data.error || 'Failed to accept');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectInvite = async (email: string) => {
        setActionLoading(email);
        try {
            const res = await fetch('/api/platform/games/wordle/friends/accept', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Invite dismissed');
                fetchData();
            } else {
                toast.error(data.error || 'Failed to reject');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemoveFriend = async (email: string) => {
        setActionLoading(email);
        try {
            const res = await fetch('/api/platform/games/wordle/friends', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Friend removed');
                fetchData();
            } else {
                toast.error(data.error || 'Failed to remove');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-md mx-auto mt-6 p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading friends...
                </div>
            </div>
        );
    }

    const hasFriends = friends.length > 0;
    const hasPending = pendingReceived.length > 0 || pendingSent.length > 0;

    if (!hasFriends && !hasPending) {
        if (mode === 'invites' || mode === 'scores') return null;
        return (
            <div className="w-full max-w-md mx-auto mt-6 p-6 rounded-lg border bg-card text-center">
                <Users className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                    Invite friends to compare Wordle scores daily!
                </p>
                <InviteFriendDialog onInviteSent={fetchData} />
            </div>
        );
    }

    const showInvites = (mode === 'all' || mode === 'invites') && pendingReceived.length > 0;
    const showScores = (mode === 'all' || mode === 'scores');
    const showSentPending = mode === 'all' || mode === 'scores';

    if (!showInvites && mode === 'invites') return null;

    return (
        <div className={`w-full max-w-md mx-auto ${mode === 'all' ? 'mt-6' : ''} space-y-4`}>
            {/* Header - only in 'all' or 'scores' mode */}
            {(mode === 'all' || mode === 'scores') && (
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Friends
                    </h3>
                    <InviteFriendDialog onInviteSent={fetchData} />
                </div>
            )}

            {/* Pending Invites Received */}
            {showInvites && (
                <div className="rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20 p-3 space-y-2">
                    <p className="text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wider">
                        Pending Invites
                    </p>
                    {pendingReceived.map((email) => (
                        <div key={email} className="flex items-center justify-between gap-2 py-1">
                            <span className="text-sm truncate flex-1">{email.split('@')[0]}</span>
                            <div className="flex gap-1">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-green hover:text-green hover:bg-green/10"
                                    onClick={() => handleAcceptInvite(email)}
                                    disabled={actionLoading === email}
                                >
                                    {actionLoading === email ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleRejectInvite(email)}
                                    disabled={actionLoading === email}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Friends Scores */}
            {showScores && scores.length > 0 && (
                <div className="rounded-lg border bg-card overflow-hidden">
                    <div className="divide-y">
                        {scores.map((friend) => (
                            <div key={friend.email} className="flex items-center gap-3 p-3 group">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{friend.username}</p>
                                    {friend.played ? (
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                            {friend.won ? (
                                                <>
                                                    <span className="text-green font-medium flex items-center gap-1">
                                                        <Trophy className="h-3 w-3" />
                                                        {friend.guesses}/6
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatTime(friend.time)}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-destructive font-medium">Didn&apos;t get it today</span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Flame className="h-3 w-3 text-orange-500" />
                                                {friend.currentStreak}
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Hasn&apos;t played yet today
                                        </p>
                                    )}
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                    onClick={() => handleRemoveFriend(friend.email)}
                                    disabled={actionLoading === friend.email}
                                    title="Remove friend"
                                >
                                    {actionLoading === friend.email ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserMinus className="h-3.5 w-3.5" />}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pending Sent */}
            {showSentPending && pendingSent.length > 0 && (
                <div className="text-xs text-muted-foreground space-y-1">
                    <p className="uppercase tracking-wider font-medium">Invites Sent</p>
                    {pendingSent.map((email) => (
                        <p key={email} className="pl-2">{email.split('@')[0]} — <span className="italic">pending</span></p>
                    ))}
                </div>
            )}
        </div>
    );
}

