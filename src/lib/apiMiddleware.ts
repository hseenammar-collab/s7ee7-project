import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import rateLimit from './rateLimit'

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

type Handler = (
  request: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse>

interface MiddlewareOptions {
  requireAuth?: boolean
  requireAdmin?: boolean
  requireInstructor?: boolean
  rateLimit?: number // requests per minute
}

export function withMiddleware(
  handler: Handler,
  options: MiddlewareOptions = {}
) {
  return async (
    request: NextRequest,
    context?: { params: Record<string, string> }
  ) => {
    try {
      // Get IP for rate limiting
      const ip =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'anonymous'

      // Rate limiting
      if (options.rateLimit) {
        try {
          await limiter.check(options.rateLimit, ip)
        } catch {
          return NextResponse.json(
            { error: 'طلبات كثيرة جداً. يرجى المحاولة لاحقاً.' },
            { status: 429 }
          )
        }
      }

      // Auth check
      if (options.requireAuth || options.requireAdmin || options.requireInstructor) {
        const supabase = await createClient()
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          return NextResponse.json(
            { error: 'غير مصرح' },
            { status: 401 }
          )
        }

        // Admin check
        if (options.requireAdmin) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

          const role = (profile as { role: string } | null)?.role
          if (!role || role !== 'admin') {
            return NextResponse.json(
              { error: 'ممنوع' },
              { status: 403 }
            )
          }
        }

        // Instructor check
        if (options.requireInstructor) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

          const role = (profile as { role: string } | null)?.role
          if (!role || (role !== 'instructor' && role !== 'admin')) {
            return NextResponse.json(
              { error: 'ممنوع' },
              { status: 403 }
            )
          }
        }
      }

      // CSRF check for mutations
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        const origin = request.headers.get('origin')
        const host = request.headers.get('host')

        if (origin && host && !origin.includes(host)) {
          // Allow localhost in development
          const isDev = process.env.NODE_ENV === 'development'
          const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1')

          if (!isDev || !isLocalhost) {
            return NextResponse.json(
              { error: 'أصل غير صالح' },
              { status: 403 }
            )
          }
        }
      }

      // Call the actual handler
      return handler(request, context)
    } catch (error) {
      console.error('API Error:', error)
      return NextResponse.json(
        { error: 'خطأ في الخادم' },
        { status: 500 }
      )
    }
  }
}

// Helper to get user from request
export async function getAuthUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Helper to check if user is admin
export async function isAdmin(userId: string) {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  const role = (profile as { role: string } | null)?.role
  return role === 'admin'
}
