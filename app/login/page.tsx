'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [redirectTo, setRedirectTo] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Auth error:', error)
          return
        }
        
        if (session) {
          console.log('User is already logged in, redirecting to dashboard')
          router.push('/dashboard')
          return
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [router])

  useEffect(() => {
    const setupAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        if (event === 'SIGNED_IN') {
          router.push('/dashboard')
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }

    const cleanup = setupAuthListener()
    return () => {
      cleanup()
    }
  }, [router])

  useEffect(() => {
    const redirectFrom = searchParams.get('redirectedFrom')
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    setRedirectTo(`${baseUrl}${redirectFrom || '/dashboard'}`)
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-4">
          <LoadingSpinner className="h-6 w-6" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">Welcome to SEO Tool</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {redirectTo && (
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                style: {
                  button: {
                    background: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    borderRadius: 'var(--radius)',
                  },
                  input: {
                    borderRadius: 'var(--radius)',
                    border: '1px solid hsl(var(--input))',
                  },
                  anchor: {
                    color: 'hsl(var(--primary))',
                  },
                },
              }}
              theme="light"
              providers={['google']}
              redirectTo={redirectTo}
              socialLayout="horizontal"
              onlyThirdPartyProviders
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
} 