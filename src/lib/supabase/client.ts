// src/lib/supabase/client.ts
'use client'

import { createBrowserClient } from '@supabase/ssr'

// Placeholder values for build time when env vars aren't available
const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'placeholder-key'

// Use flexible typing to avoid strict type checking issues with Supabase
// This allows operations that may not be fully defined in Database types
export function createClient() {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined'

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // In browser, we must have real credentials
  if (isBrowser && (!url || !key)) {
    throw new Error('Missing Supabase environment variables')
  }

  // During SSR/build without env vars, use placeholders
  // The client won't actually make requests during static generation
  return createBrowserClient(url || PLACEHOLDER_URL, key || PLACEHOLDER_KEY)
}

// Lazy singleton for client components - only created when accessed
let _supabase: ReturnType<typeof createBrowserClient> | null = null

export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient()
  }
  return _supabase
}
