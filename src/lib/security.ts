import { NextRequest } from 'next/server'
import { LRUCache } from 'lru-cache'

// Rate Limiter Cache
const rateLimitCache = new LRUCache<string, number[]>({
  max: 10000,
  ttl: 60 * 1000, // 1 minute
})

/**
 * Rate limit requests by IP
 */
export function rateLimit(
  ip: string,
  limit: number = 60
): { success: boolean; remaining: number } {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute window

  const requests = rateLimitCache.get(ip) || []
  const recentRequests = requests.filter((time) => now - time < windowMs)

  if (recentRequests.length >= limit) {
    return { success: false, remaining: 0 }
  }

  recentRequests.push(now)
  rateLimitCache.set(ip, recentRequests)

  return { success: true, remaining: limit - recentRequests.length }
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0] || realIP || 'unknown'
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Validate Iraqi phone number
 */
export function isValidIraqiPhone(phone: string): boolean {
  // Iraqi phone formats: 07XXXXXXXXX or +9647XXXXXXXXX
  const iraqiPhoneRegex = /^(07[3-9]|\+9647[3-9])[0-9]{8}$/
  return iraqiPhoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف كبير')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف صغير')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('يجب أن تحتوي على رقم')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const randomValues = new Uint32Array(length)
  crypto.getRandomValues(randomValues)
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length]
  }
  return result
}

/**
 * Check for SQL injection patterns
 */
export function hasSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|FETCH|DECLARE|TRUNCATE)\b)/i,
    /(--|;|\/\*|\*\/|@@|@)/,
    /(\b(OR|AND)\b\s*\d+\s*=\s*\d+)/i,
  ]
  return sqlPatterns.some((pattern) => pattern.test(input))
}

/**
 * Check for XSS patterns
 */
export function hasXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ]
  return xssPatterns.some((pattern) => pattern.test(input))
}

/**
 * Validate and sanitize user input
 */
export function validateInput(input: string): {
  valid: boolean
  sanitized: string
  error?: string
} {
  if (hasSQLInjection(input)) {
    return {
      valid: false,
      sanitized: '',
      error: 'المدخل يحتوي على أنماط غير مسموح بها',
    }
  }

  if (hasXSS(input)) {
    return {
      valid: false,
      sanitized: '',
      error: 'المدخل يحتوي على محتوى غير آمن',
    }
  }

  return {
    valid: true,
    sanitized: sanitizeInput(input),
  }
}

/**
 * Create rate limit response
 */
export function rateLimitResponse() {
  return new Response(
    JSON.stringify({ error: 'طلبات كثيرة جداً. حاول لاحقاً.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60',
      },
    }
  )
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) {
    return '*'.repeat(data.length)
  }
  return data.slice(0, visibleChars) + '*'.repeat(data.length - visibleChars)
}

/**
 * Validate coupon code format
 */
export function isValidCouponCode(code: string): boolean {
  // Coupon codes: 4-20 alphanumeric characters
  const couponRegex = /^[A-Z0-9]{4,20}$/i
  return couponRegex.test(code)
}
