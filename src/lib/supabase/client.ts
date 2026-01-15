// src/lib/supabase/client.ts
'use client'

import { createBrowserClient } from '@supabase/ssr'

// Singleton instance
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return existing instance if available (singleton pattern)
  if (supabaseInstance) {
    return supabaseInstance
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check for missing env vars
  if (!url || !key) {
    // During build/SSR, return a dummy that won't be used
    if (typeof window === 'undefined') {
      return createBrowserClient(
        'https://placeholder.supabase.co',
        'placeholder-key'
      )
    }
    throw new Error('Missing Supabase environment variables')
  }

  // Create and cache the instance
  supabaseInstance = createBrowserClient(url, key, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  })

  return supabaseInstance
}

// Alias for backward compatibility
export const getSupabase = createClient