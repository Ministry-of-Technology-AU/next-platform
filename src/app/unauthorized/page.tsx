import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import SignOutButton from "@/components/sign-out-button";

export const metadata = {
  title: 'Unauthorized',
  description: 'You do not have access to this section of the platform.'
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-xl w-full bg-white shadow rounded-lg p-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
        <h1 className="mt-4 text-2xl font-semibold">Unauthorized</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You do not have permission to access this area. If you believe this is an error, please request access or sign in with an authorized Ashoka account.
        </p>

        <div className="mt-6 flex justify-center gap-4">
          {/* Sign out button will trigger next-auth signOut, which will redirect to login or home per config */}
          <SignOutButton>Sign in Again</SignOutButton>
          <Link href="/" className="px-4 py-2 border rounded">Go to Home</Link>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">If you need access, contact <a className="underline" href="mailto:technology.ministry@ashoka.edu.in">technology.ministry@ashoka.edu.in</a></p>
      </div>
    </div>
  )
}