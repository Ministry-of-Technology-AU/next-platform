"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import * as React from "react";

export default function SignOutButton({ children }: { children?: React.ReactNode }) {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="px-4 py-2 bg-primary text-white rounded"
    >
      {children || 'Sign out'}
    </Button>
  );
}
