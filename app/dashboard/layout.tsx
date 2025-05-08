'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Team, TeamMember } from '@/lib/supabase'

type TeamMemberWithTeam = {
  role: 'admin' | 'member'
  teams: Team
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [userTeams, setUserTeams] = useState<Team[]>([])
  const [userRole, setUserRole] = useState<'admin' | 'member' | null>(null)
  const [loading, setLoading] = useState(true)
  const redirected = useRef(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          if (!redirected.current) {
            redirected.current = true
            router.push('/login')
          }
          return
        }

        // Fetch user's teams and role
        const { data: teamMembers, error } = await supabase
          .from('team_members')
          .select(`
            role,
            teams (
              id,
              name,
              created_at,
              updated_at
            )
          `)
          .eq('user_id', session.user.id)
          .returns<TeamMemberWithTeam[]>()

        if (error) throw error

        if (teamMembers && teamMembers.length > 0) {
          setUserTeams(teamMembers.map(tm => tm.teams))
          setUserRole(teamMembers[0].role)
        }

        setLoading(false)
      } catch (error) {
        console.error('Error fetching user data:', error)
        if (!redirected.current) {
          redirected.current = true
          router.push('/login')
        }
      }
    }

    fetchUserData()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    if (!redirected.current) {
      redirected.current = true
      router.push('/login')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-bold">SEO Tool</h1>
              </div>
            </div>
            <div className="flex items-center">
              {userTeams.length > 0 && (
                <div className="mr-4">
                  <span className="text-sm text-gray-500">Team: {userTeams[0].name}</span>
                  <span className="ml-2 text-sm font-medium text-gray-900">({userRole})</span>
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
} 