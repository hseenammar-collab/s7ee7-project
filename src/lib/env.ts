import { z } from 'zod'

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Analytics (optional)
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_FB_PIXEL_ID: z.string().optional(),

  // Google verification (optional)
  NEXT_PUBLIC_GOOGLE_VERIFICATION: z.string().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default('http://localhost:3000'),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  // Only validate on server side
  if (typeof window !== 'undefined') {
    return {} as Env
  }

  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:')
    console.error(parsed.error.flatten().fieldErrors)

    // In development, warn but don't throw
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Running with invalid environment variables in development mode')
      return {} as Env
    }

    throw new Error('Invalid environment variables')
  }

  return parsed.data
}

export const env = validateEnv()

// Helper to check if we're in production
export const isProduction = process.env.NODE_ENV === 'production'

// Helper to check if we're in development
export const isDevelopment = process.env.NODE_ENV === 'development'

// Get base URL
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}
