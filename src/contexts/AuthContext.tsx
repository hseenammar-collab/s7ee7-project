'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setProfile(data as Profile)
        return data as Profile
      }
      return null
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }, [user, fetchProfile])

  const refreshSession = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { session: newSession } } = await supabase.auth.getSession()
      setSession(newSession)
      setUser(newSession?.user ?? null)
      if (newSession?.user) {
        await fetchProfile(newSession.user.id)
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
    }
  }, [fetchProfile])

  const signOut = useCallback(async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setProfile(null)

      // Clear any stored tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('session_token')
        localStorage.removeItem('sb-access-token')
        localStorage.removeItem('sb-refresh-token')

        // Force reload to clear all state
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        const supabase = createClient()

        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession()

        if (mounted) {
          if (initialSession?.user) {
            setSession(initialSession)
            setUser(initialSession.user)
            await fetchProfile(initialSession.user.id)
          }
          setLoading(false)
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (!mounted) return

            console.log('Auth event:', event)

            setSession(newSession)
            setUser(newSession?.user ?? null)

            if (newSession?.user) {
              await fetchProfile(newSession.user.id)
            } else {
              setProfile(null)
            }

            setLoading(false)
          }
        )

        return () => {
          mounted = false
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Auth init error:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initAuth()

    return () => {
      mounted = false
    }
  }, [fetchProfile])

  const isAdmin = profile?.role === 'admin'
  const isAuthenticated = !!user && !!session

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAdmin,
        isAuthenticated,
        signOut,
        refreshProfile,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
