import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/utils/supabase'

export default async function Index() {
  const cookieStore = cookies()

  const canInitSupabaseClient = () => {
    // This function is just for the interactive tutorial.
    // Feel free to remove it once you have Supabase connected.
    try {
      createServerClient(cookieStore)
      return true
    } catch (e) {
      return false
    }
  }

  const isSupabaseConnected = canInitSupabaseClient()

  // If Supabase is not connected, redirect to login page
  if (!isSupabaseConnected) {
    redirect('/login')
  }

  // Check if user is authenticated
  const supabase = createServerClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  // If user is not authenticated, redirect to login page
  if (!user) {
    redirect('/login')
  }

  // If user is authenticated, show dashboard
  return (
    <div className="flex w-full flex-1 flex-col items-center gap-10 p-8">
      <header className="flex w-full max-w-4xl items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <form action={async () => {
          'use server'
          const cookieStore = cookies()
          const supabase = createServerClient(cookieStore)
          await supabase.auth.signOut()
          return redirect('/login')
        }}>
          <button 
            type="submit" 
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Sign out
          </button>
        </form>
      </header>
      
      <main className="flex w-full max-w-4xl flex-1 flex-col gap-8">
        <section className="rounded-lg border p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Welcome, {user.email}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            You have successfully signed in to your account.
          </p>
        </section>
      </main>
    </div>
  )
}
