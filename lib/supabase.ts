import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database schema
export type Team = {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export type TeamMember = {
  id: string
  team_id: string
  user_id: string
  role: 'admin' | 'member'
  created_at: string
  updated_at: string
}

export type UserProfile = {
  id: string
  email: string
  full_name: string
  created_at: string
  updated_at: string
} 