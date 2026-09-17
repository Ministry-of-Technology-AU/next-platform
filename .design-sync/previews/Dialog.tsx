import * as React from 'react';
import { Loader2, Mail, Share2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function Default() {
  return (
    <Dialog open>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Friend
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Invite a Friend
          </DialogTitle>
          <DialogDescription>
            Enter your friend&apos;s email to compare Wordle scores daily.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 mt-2">
          <Input type="email" placeholder="friend@ashoka.edu.in" />
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            <UserPlus className="h-4 w-4 mr-2" />
            Send Invite
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function WithFooter() {
  return (
    <Dialog open>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Your Trajectory</DialogTitle>
          <DialogDescription>
            Publish this trajectory to the shared repository so other students can find it.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => {}}>
            Cancel
          </Button>
          <Button onClick={() => {}}>
            <Share2 className="mr-2 h-4 w-4" />
            Share to Repository
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Loading() {
  return (
    <Dialog open>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Sharing…</DialogTitle>
          <DialogDescription>This will just take a moment.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sharing…
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
