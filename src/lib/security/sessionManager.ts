'use client'

import { createClient } from '@/lib/supabase/client'
import { getDeviceFingerprint } from './deviceFingerprint'

// Generate session token
function generateSessionToken(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

// Get client IP
async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch {
    return 'unknown'
  }
}

// Create single session (invalidate others)
export async function createSingleSession(userId: string): Promise<string> {
  const supabase = createClient()
  const deviceInfo = await getDeviceFingerprint()
  const sessionToken = generateSessionToken()

  // Invalidate all other sessions
  await supabase
    .from('active_sessions')
    .update({ is_active: false })
    .eq('user_id', userId)

  // Create new session
  const ipAddress = await getClientIP()

  await supabase.from('active_sessions').insert({
    user_id: userId,
    session_token: sessionToken,
    device_fingerprint: deviceInfo.visitorId,
    ip_address: ipAddress,
    is_active: true,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
  })

  // Store in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('session_token', sessionToken)
  }

  return sessionToken
}

// Validate session
export async function validateSession(userId: string): Promise<boolean> {
  const supabase = createClient()

  const sessionToken =
    typeof window !== 'undefined'
      ? localStorage.getItem('session_token')
      : null

  if (!sessionToken) return false

  const { data: session } = await supabase
    .from('active_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('session_token', sessionToken)
    .eq('is_active', true)
    .single()

  if (!session) return false

  // Check if expired
  if (new Date(session.expires_at) < new Date()) {
    await supabase
      .from('active_sessions')
      .update({ is_active: false })
      .eq('id', session.id)
    return false
  }

  return true
}

// Check concurrent access
export async function checkConcurrentAccess(userId: string): Promise<{
  allowed: boolean
  message?: string
}> {
  const supabase = createClient()
  const deviceInfo = await getDeviceFingerprint()

  const { data: activeSessions } = await supabase
    .from('active_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (!activeSessions || activeSessions.length === 0) {
    return { allowed: true }
  }

  // Check if current device has active session
  const currentSession = activeSessions.find(
    (s) => s.device_fingerprint === deviceInfo.visitorId
  )

  if (currentSession) {
    return { allowed: true }
  }

  // Another device is active
  return {
    allowed: false,
    message: 'حسابك مفتوح على جهاز آخر. هل تريد تسجيل الخروج منه؟',
  }
}

// End session
export async function endSession(userId: string) {
  const supabase = createClient()

  const sessionToken =
    typeof window !== 'undefined'
      ? localStorage.getItem('session_token')
      : null

  if (sessionToken) {
    await supabase
      .from('active_sessions')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('session_token', sessionToken)

    localStorage.removeItem('session_token')
  }
}

// Get active sessions
export async function getActiveSessions(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('active_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return { sessions: data || [], error: error?.message }
}
