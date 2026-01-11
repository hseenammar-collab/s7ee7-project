'use client'

import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { createClient } from '@/lib/supabase/client'

interface DeviceInfo {
  visitorId: string
  userAgent: string
  platform: string
  screenResolution: string
  timezone: string
  language: string
}

// Generate device fingerprint
export async function getDeviceFingerprint(): Promise<DeviceInfo> {
  if (typeof window === 'undefined') {
    return {
      visitorId: 'server',
      userAgent: '',
      platform: '',
      screenResolution: '',
      timezone: '',
      language: '',
    }
  }

  try {
    const fp = await FingerprintJS.load()
    const result = await fp.get()

    return {
      visitorId: result.visitorId,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    }
  } catch {
    // Fallback fingerprint
    const fallbackId = btoa(
      navigator.userAgent + screen.width + screen.height + navigator.language
    ).substring(0, 32)

    return {
      visitorId: fallbackId,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    }
  }
}

// Check if device is allowed
export async function checkDeviceLimit(
  userId: string,
  maxDevices: number = 2
): Promise<{
  allowed: boolean
  currentDevices: number
  message?: string
}> {
  const supabase = createClient()
  const deviceInfo = await getDeviceFingerprint()

  // Get user's registered devices
  const { data: devices, error } = await supabase
    .from('user_devices')
    .select('*')
    .eq('user_id', userId)
    .order('last_used', { ascending: false })

  if (error) {
    console.error('Error checking devices:', error)
    return { allowed: true, currentDevices: 0 }
  }

  // Check if current device is already registered
  const existingDevice = devices?.find(
    (d) => d.fingerprint === deviceInfo.visitorId
  )

  if (existingDevice) {
    // Update last used
    await supabase
      .from('user_devices')
      .update({ last_used: new Date().toISOString() })
      .eq('id', existingDevice.id)

    return { allowed: true, currentDevices: devices.length }
  }

  // Check if user has reached device limit
  if (devices && devices.length >= maxDevices) {
    return {
      allowed: false,
      currentDevices: devices.length,
      message: `لقد وصلت للحد الأقصى من الأجهزة (${maxDevices}). يرجى إزالة جهاز قديم أولاً.`,
    }
  }

  // Register new device
  await supabase.from('user_devices').insert({
    user_id: userId,
    fingerprint: deviceInfo.visitorId,
    device_name: getDeviceName(deviceInfo.userAgent),
    user_agent: deviceInfo.userAgent,
    last_used: new Date().toISOString(),
  })

  return { allowed: true, currentDevices: (devices?.length || 0) + 1 }
}

// Get friendly device name
function getDeviceName(userAgent: string): string {
  if (/iPhone/.test(userAgent)) return 'iPhone'
  if (/iPad/.test(userAgent)) return 'iPad'
  if (/Android/.test(userAgent)) {
    if (/Mobile/.test(userAgent)) return 'Android Phone'
    return 'Android Tablet'
  }
  if (/Windows/.test(userAgent)) return 'Windows PC'
  if (/Mac/.test(userAgent)) return 'Mac'
  if (/Linux/.test(userAgent)) return 'Linux'
  return 'Unknown Device'
}

// Remove device
export async function removeDevice(userId: string, deviceId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('user_devices')
    .delete()
    .eq('id', deviceId)
    .eq('user_id', userId)

  return { success: !error, error: error?.message }
}

// Get user devices
export async function getUserDevices(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_devices')
    .select('*')
    .eq('user_id', userId)
    .order('last_used', { ascending: false })

  return { devices: data || [], error: error?.message }
}
