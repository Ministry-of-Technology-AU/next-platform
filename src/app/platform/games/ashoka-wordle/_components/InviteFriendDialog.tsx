'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface InviteFriendDialogProps {
    onInviteSent?: () => void;
}

export default function InviteFriendDialog({ onInviteSent }: InviteFriendDialogProps) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error('Please enter an email address');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/platform/games/wordle/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() })
            });

            const data = await res.json();

            if (data.success) {
                if (data.autoAccepted) {
                    toast.success('You are now friends! 🎉');
                } else {
                    toast.success('Invite sent! 📧');
                }
                setEmail('');
                setOpen(false);
                onInviteSent?.();
            } else {
                toast.error(data.error || 'Failed to send invite');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Invite Friend
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-green" />
                        Invite a Friend
                    </DialogTitle>
                    <DialogDescription>
                        Enter your friend&apos;s email to compare Wordle scores daily.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                    <Input
                        type="email"
                        placeholder="friend@ashoka.edu.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        autoFocus
                    />
                    <Button type="submit" disabled={loading || !email.trim()} className="bg-green hover:bg-green/90">
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Send Invite
                            </>
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
