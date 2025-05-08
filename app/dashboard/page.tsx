'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Team } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

type TeamMemberWithTeam = {
  role: 'admin' | 'member'
  teams: Team
}

export default function DashboardPage() {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [newTeamName, setNewTeamName] = useState('')
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  const redirected = useRef(false)

  useEffect(() => {
    console.log('Dashboard page mounted')
    
    const fetchUserData = async () => {
      console.log('Fetching user data...')
      try {
        // First check if we have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          if (!redirected.current) {
            redirected.current = true
            router.push('/login')
          }
          return
        }

        if (!session) {
          console.log('No session found, redirecting to login')
          if (!redirected.current) {
            redirected.current = true
            router.push('/login')
          }
          return
        }

        console.log('Session found:', {
          user: session.user.email,
          expires_at: new Date(session.expires_at! * 1000).toISOString()
        })
        setUser(session.user)

        // Then fetch the teams
        console.log('Fetching teams...')
        const { data: teamMembers, error: teamsError } = await supabase
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

        if (teamsError) {
          console.error('Teams error:', teamsError)
          throw teamsError
        }

        if (teamMembers) {
          console.log('Teams fetched:', teamMembers.length)
          setTeams((teamMembers as unknown as TeamMemberWithTeam[]).map(tm => tm.teams))
        }
      } catch (error) {
        console.error('Error in fetchUserData:', error)
        // Don't redirect on error, just show the error state
      } finally {
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
      
      if (event === 'SIGNED_OUT' && !redirected.current) {
        console.log('User signed out, redirecting to login...')
        redirected.current = true
        router.push('/login')
      }
    })

    fetchUserData()

    // Cleanup subscription
    return () => {
      console.log('Dashboard page unmounting, cleaning up...')
      subscription.unsubscribe()
    }
  }, [router])

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return

    console.log('Creating new team:', newTeamName)
    try {
      setIsCreatingTeam(true)

      // Create the team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert([{ name: newTeamName }])
        .select()
        .single()

      if (teamError) throw teamError

      // Add the user as an admin of the team
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([{
          team_id: team.id,
          user_id: user.id,
          role: 'admin'
        }])

      if (memberError) throw memberError

      console.log('Team created successfully:', team)
      // Refresh the teams list
      setTeams([...teams, team])
      setNewTeamName('')
    } catch (error) {
      console.error('Error creating team:', error)
    } finally {
      setIsCreatingTeam(false)
    }
  }

  if (loading) {
    console.log('Dashboard in loading state')
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <LoadingSpinner className="h-6 w-6" />
          <h2 className="text-xl font-semibold text-gray-700">Loading your dashboard...</h2>
        </div>
      </div>
    )
  }

  console.log('Rendering dashboard content')
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome, {user?.email}</CardTitle>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You are not a member of any teams yet.</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    Create a Team
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a New Team</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="team-name">Team Name</Label>
                      <Input
                        id="team-name"
                        value={newTeamName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTeamName(e.target.value)}
                        placeholder="Enter team name"
                      />
                    </div>
                    <Button
                      onClick={handleCreateTeam}
                      disabled={isCreatingTeam || !newTeamName.trim()}
                      className="w-full"
                    >
                      {isCreatingTeam ? (
                        <>
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                          Creating...
                        </>
                      ) : (
                        'Create Team'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Your Teams</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Create New Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a New Team</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="team-name">Team Name</Label>
                        <Input
                          id="team-name"
                          value={newTeamName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTeamName(e.target.value)}
                          placeholder="Enter team name"
                        />
                      </div>
                      <Button
                        onClick={handleCreateTeam}
                        disabled={isCreatingTeam || !newTeamName.trim()}
                        className="w-full"
                      >
                        {isCreatingTeam ? (
                          <>
                            <LoadingSpinner className="mr-2 h-4 w-4" />
                            Creating...
                          </>
                        ) : (
                          'Create Team'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
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