import Link from 'next/link'
import { headers, cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/utils/supabase'
import { Button } from '@/components/ui/button'
import GoogleAuthButton from '@/components/GoogleAuthButton'

export default function SignUp({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  const signUp = async (formData: FormData) => {
    'use server'

    const origin = headers().get('origin')
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/api/auth/callback`,
      },
    })

    if (error) {
      return redirect('/signup?message=Could not create account')
    }

    return redirect('/login?message=Check email to continue sign in process')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Create an account</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" action={signUp}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 shadow-sm focus:border-primary focus:outline-none focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full">
              Sign up
            </Button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative px-4 text-sm">
              <span className="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <GoogleAuthButton 
              mode="signup" 
              redirectTo={`${headers().get('origin')}/api/auth/callback`} 
            />
          </div>
        </form>
        
        {searchParams?.message && (
          <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/30">
            <p className="text-center text-sm text-red-800 dark:text-red-200">
              {searchParams.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 