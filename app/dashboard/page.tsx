'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Team } from '@/lib/supabase'

type TeamMemberWithTeam = {
  role: 'admin' | 'member'
  teams: Team
}

export default function DashboardPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

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

        if (error) throw error

        if (teamMembers) {
          setTeams((teamMembers as unknown as TeamMemberWithTeam[]).map(tm => tm.teams))
        }
      } catch (error) {
        console.error('Error fetching teams:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to SEO Tool</h2>
        {teams.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">You are not a member of any teams yet.</p>
            <button
              onClick={() => {/* TODO: Implement team creation */}}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create a Team
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Your Teams</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <h4 className="text-lg font-medium text-gray-900">{team.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Created {new Date(team.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 