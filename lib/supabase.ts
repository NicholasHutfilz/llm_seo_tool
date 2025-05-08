import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: {
      getItem: (key) => {
        if (typeof window === 'undefined') return null
        try {
          const item = window.localStorage.getItem(key)
          return item ? JSON.parse(item) : null
        } catch (error) {
          return null
        }
      },
      setItem: (key, value) => {
        if (typeof window === 'undefined') return
        try {
          window.localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
          console.error('Error setting auth storage:', error)
        }
      },
      removeItem: (key) => {
        if (typeof window === 'undefined') return
        try {
          window.localStorage.removeItem(key)
        } catch (error) {
          console.error('Error removing auth storage:', error)
        }
      },
    },
  },
})

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