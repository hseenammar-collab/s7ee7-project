'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { checkDeviceLimit } from '@/lib/security/deviceFingerprint'
import {
  checkConcurrentAccess,
  createSingleSession,
} from '@/lib/security/sessionManager'
import { AlertTriangle, Monitor, LogOut } from 'lucide-react'
import Link from 'next/link'

interface SecurityProviderProps {
  children: React.ReactNode
}

export default function SecurityProvider({ children }: SecurityProviderProps) {
  const { user, signOut } = useAuth()
  const [securityCheck, setSecurityCheck] = useState<
    'loading' | 'passed' | 'device_limit' | 'concurrent'
  >('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!user) {
      setSecurityCheck('passed')
      return
    }

    const checkSecurity = async () => {
      try {
        // Check device limit
        const deviceCheck = await checkDeviceLimit(user.id, 2)
        if (!deviceCheck.allowed) {
          setSecurityCheck('device_limit')
          setErrorMessage(
            deviceCheck.message || 'تجاوزت الحد المسموح من الأجهزة'
          )
          return
        }

        // Check concurrent access
        const concurrentCheck = await checkConcurrentAccess(user.id)
        if (!concurrentCheck.allowed) {
          setSecurityCheck('concurrent')
          setErrorMessage(
            concurrentCheck.message || 'حسابك مفتوح على جهاز آخر'
          )
          return
        }

        // Create session
        await createSingleSession(user.id)
        setSecurityCheck('passed')
      } catch (error) {
        console.error('Security check error:', error)
        // Allow access on error to not block users
        setSecurityCheck('passed')
      }
    }

    checkSecurity()
  }, [user])

  if (securityCheck === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري التحقق من الأمان...</p>
        </div>
      </div>
    )
  }

  if (securityCheck === 'device_limit') {
    return (
      <div
        className="min-h-screen bg-gray-950 flex items-center justify-center p-4"
        dir="rtl"
      >
        <div className="max-w-md w-full bg-gray-900 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Monitor className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            تجاوزت الحد المسموح
          </h1>
          <p className="text-gray-400 mb-6">{errorMessage}</p>
          <p className="text-sm text-gray-500 mb-6">
            يمكنك إدارة أجهزتك من صفحة الإعدادات لإزالة جهاز قديم.
          </p>
          <div className="flex gap-4">
            <Link
              href="/profile/devices"
              className="flex-1 px-4 py-3 bg-primary text-black rounded-xl font-semibold hover:bg-primary/90 transition text-center"
            >
              إدارة الأجهزة
            </Link>
            <button
              onClick={() => signOut()}
              className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              خروج
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (securityCheck === 'concurrent') {
    return (
      <div
        className="min-h-screen bg-gray-950 flex items-center justify-center p-4"
        dir="rtl"
      >
        <div className="max-w-md w-full bg-gray-900 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            جلسة نشطة على جهاز آخر
          </h1>
          <p className="text-gray-400 mb-6">{errorMessage}</p>
          <div className="flex gap-4">
            <button
              onClick={async () => {
                if (user) {
                  await createSingleSession(user.id)
                  setSecurityCheck('passed')
                }
              }}
              className="flex-1 px-4 py-3 bg-primary text-black rounded-xl font-semibold hover:bg-primary/90 transition"
            >
              تسجيل الخروج من الجهاز الآخر
            </button>
            <button
              onClick={() => signOut()}
              className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
