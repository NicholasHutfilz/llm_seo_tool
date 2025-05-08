'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const redirected = useRef(false)

  useEffect(() => {
    const checkSession = async () => {
      try {
        // If we've already redirected, don't check again
        if (redirected.current) return
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          redirected.current = true
          router.push('/login')
          return
        }

        if (session) {
          redirected.current = true
          router.push('/dashboard')
        } else {
          redirected.current = true
          router.push('/login')
        }
      } catch (err) {
        console.error('Unexpected error during session check:', err)
        if (!redirected.current) {
          redirected.current = true
          router.push('/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">SEO Tool</h1>
        <div className="flex items-center justify-center gap-2">
          <LoadingSpinner className="h-5 w-5" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    </div>
  )
}