'use client'

import { signIn, useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const callbackUrl = searchParams.get('callbackUrl') || '/platform'

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push(callbackUrl)
    } else if (status === 'unauthenticated') {
      // Automatically redirect to Google OAuth
      signIn('google', { callbackUrl })
    }
  }, [status, session, router, callbackUrl])

  // Show loading while determining auth status or redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {status === 'authenticated' ? 'Redirecting...' : 'Signing you in...'}
        </p>
      </div>
    </div>
  )
}