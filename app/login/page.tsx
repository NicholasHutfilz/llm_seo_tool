'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const redirected = useRef(false)

  useEffect(() => {
    console.log('Login page mounted')
    
    const checkSession = async () => {
      // If we've already redirected, don't check again
      if (redirected.current) return
      
      console.log('Checking session...')
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setError('Error checking session')
          setLoading(false)
          return
        }

        if (session) {
          console.log('Session found, redirecting to dashboard')
          redirected.current = true
          router.push('/dashboard')
          return
        }

        console.log('No session found, showing login page')
        setLoading(false)
      } catch (error) {
        console.error('Error checking session:', error)
        setError('An unexpected error occurred')
        setLoading(false)
      }
    }

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', {
        event,
        user: session?.user?.email,
        timestamp: new Date().toISOString()
      })
      
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session && !redirected.current) {
        console.log('User signed in, redirecting to dashboard...')
        redirected.current = true
        router.push('/dashboard')
      }
    })

    checkSession()

    // Cleanup subscription
    return () => {
      console.log('Login page unmounting, cleaning up...')
      subscription.unsubscribe()
    }
  }, [router])

  const handleGoogleLogin = async () => {
    console.log('Google login initiated...')
    try {
      setError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) throw error
      console.log('Google login successful, redirecting...')
    } catch (error) {
      console.error('Error signing in with Google:', error)
      setError('Failed to sign in with Google')
    }
  }

  if (loading) {
    console.log('Login page in loading state')
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <LoadingSpinner className="h-6 w-6" />
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    )
  }

  console.log('Rendering login page content')
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome to SEO Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <Button
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 