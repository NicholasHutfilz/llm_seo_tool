'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Team } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
        <div className="text-center space-y-4">
          <LoadingSpinner className="h-6 w-6" />
          <h2 className="text-xl font-semibold text-gray-700">Loading your teams...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to SEO Tool</CardTitle>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You are not a member of any teams yet.</p>
              <Button
                onClick={() => {/* TODO: Implement team creation */}}
                className="bg-primary hover:bg-primary/90"
              >
                Create a Team
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Your Teams</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => (
                  <Card key={team.id}>
                    <CardContent className="pt-6">
                      <h4 className="text-lg font-medium text-gray-900">{team.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Created {new Date(team.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 