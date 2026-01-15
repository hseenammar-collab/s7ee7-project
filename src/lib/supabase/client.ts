// src/lib/supabase/client.ts
'use client'

import { createBrowserClient } from '@supabase/ssr'

// Singleton instance
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check for missing env vars in browser
  if (typeof window !== 'undefined' && (!url || !key)) {
    throw new Error('Missing Supabase environment variables')
  }

  // During SSR/build without env vars, use placeholders
  if (!url || !key) {
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    )
  }

  // Create client - let @supabase/ssr handle cookies automatically
  supabaseInstance = createBrowserClient(url, key)

  return supabaseInstance
}

// Alias for backward compatibility
export const getSupabase = createClient