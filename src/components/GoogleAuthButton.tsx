'use client'

import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@/utils/supabase'

type GoogleAuthButtonProps = {
  mode: 'signin' | 'signup'
  redirectTo?: string
}

export default function GoogleAuthButton({ mode, redirectTo }: GoogleAuthButtonProps) {
  const supabase = createBrowserClient()

  const handleGoogleAuth = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/api/auth/callback`,
      },
    })
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="flex w-full items-center justify-center gap-2"
      onClick={handleGoogleAuth}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.545 6.558C15.545 6.082 15.497 5.624 15.41 5.18H8V7.58H12.209C12.029 8.298 11.594 8.918 10.969 9.358V10.938H13.416C14.857 9.618 15.545 8.224 15.545 6.558Z" fill="#4285F4"/>
        <path d="M8 16C10.16 16 11.97 15.269 13.417 13.938L10.97 12.358C10.242 12.872 9.273 13.172 8 13.172C5.943 13.172 4.229 11.742 3.582 9.85H1.046V11.483C2.494 14.185 5.067 16 8 16Z" fill="#34A853"/>
        <path d="M3.582 9.85C3.32 9.342 3.183 8.774 3.183 8.172C3.183 7.57 3.32 7.001 3.582 6.494V4.86H1.046C0.39 6.096 0 7.594 0 9.172C0 10.75 0.39 12.248 1.046 13.483L3.582 11.85V9.85Z" fill="#FBBC05"/>
        <path d="M8 3.172C9.175 3.172 10.225 3.582 11.067 4.392L13.198 2.261C11.967 1.116 10.158 0.422 8 0.422C5.067 0.422 2.494 2.236 1.046 4.938L3.582 6.571C4.229 4.678 5.943 3.249 8 3.249V3.172Z" fill="#EA4335"/>
      </svg>
      {mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
    </Button>
  )
} 