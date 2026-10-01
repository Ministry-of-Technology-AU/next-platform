import * as React from 'react';
import { Loader2, Search, Share2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Default() {
  return (
    <Button onClick={() => {}} size="lg" className="w-full max-w-xs">
      Return to Platform
    </Button>
  );
}

export function Outline() {
  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" onClick={() => {}}>
        Cancel
      </Button>
      <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-neutral-300 hover:bg-neutral-100">
        <Search className="h-5 w-5" />
      </Button>
    </div>
  );
}

export function Destructive() {
  return (
    <Button variant="destructive" onClick={() => {}}>
      Delete Account
    </Button>
  );
}

export function Ghost() {
  return (
    <Button variant="ghost" onClick={() => {}}>
      Skip for now
    </Button>
  );
}

export function WithIcon() {
  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={() => {}}>
      <UserPlus className="h-4 w-4" />
      Invite Friend
    </Button>
  );
}

export function Loading() {
  return (
    <Button disabled className="bg-primary hover:bg-primary/90">
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Sending...
    </Button>
  );
}

export function Disabled() {
  return (
    <Button disabled onClick={() => {}}>
      <Share2 className="mr-2 h-4 w-4" />
      Share to Repository
    </Button>
  );
}
