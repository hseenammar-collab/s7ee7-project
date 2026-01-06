// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

// Use flexible typing to avoid strict type checking issues with Supabase
// This allows operations that may not be fully defined in Database types
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// للاستخدام المباشر في Client Components
export const supabase = createClient()
