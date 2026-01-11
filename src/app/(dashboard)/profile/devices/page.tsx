'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserDevices, removeDevice } from '@/lib/security/deviceFingerprint'
import { getDeviceFingerprint } from '@/lib/security/deviceFingerprint'
import {
  Monitor,
  Smartphone,
  Tablet,
  Trash2,
  Shield,
  Clock,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Device {
  id: string
  device_name: string
  fingerprint: string
  user_agent: string
  last_used: string
  created_at: string
}

export default function DevicesPage() {
  const { user } = useAuth()
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [currentFingerprint, setCurrentFingerprint] = useState<string>('')
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchDevices()
      getCurrentFingerprint()
    }
  }, [user])

  const fetchDevices = async () => {
    if (!user) return
    const { devices: data } = await getUserDevices(user.id)
    setDevices(data)
    setLoading(false)
  }

  const getCurrentFingerprint = async () => {
    const info = await getDeviceFingerprint()
    setCurrentFingerprint(info.visitorId)
  }

  const handleRemoveDevice = async (deviceId: string) => {
    if (!user) return

    setRemovingId(deviceId)
    const { success, error } = await removeDevice(user.id, deviceId)

    if (success) {
      toast.success('تم إزالة الجهاز بنجاح')
      fetchDevices()
    } else {
      toast.error(error || 'فشل إزالة الجهاز')
    }
    setRemovingId(null)
  }

  const getDeviceIcon = (name: string) => {
    if (name.includes('iPhone') || name.includes('Android Phone')) {
      return <Smartphone className="w-6 h-6" />
    }
    if (name.includes('iPad') || name.includes('Android Tablet')) {
      return <Tablet className="w-6 h-6" />
    }
    return <Monitor className="w-6 h-6" />
  }

  const isCurrentDevice = (fingerprint: string) => {
    return fingerprint === currentFingerprint
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/profile"
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">الأجهزة المتصلة</h1>
              <p className="text-gray-400 text-sm">
                إدارة الأجهزة التي تستخدم حسابك
              </p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <p className="text-yellow-500 text-sm">
            الحد الأقصى المسموح: <strong>جهازين فقط</strong>. إذا أردت إضافة جهاز
            جديد، قم بإزالة جهاز قديم أولاً.
          </p>
        </div>

        {/* Device Count */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-400">الأجهزة المسجلة</span>
          <span className="text-white font-semibold">
            {devices.length} / 2
          </span>
        </div>

        {/* Devices List */}
        <div className="space-y-4">
          {devices.map((device) => {
            const isCurrent = isCurrentDevice(device.fingerprint)
            return (
              <div
                key={device.id}
                className={`bg-gray-900 rounded-xl p-4 border ${
                  isCurrent ? 'border-primary/50' : 'border-white/10'
                } flex items-center gap-4`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isCurrent
                      ? 'bg-primary/20 text-primary'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {getDeviceIcon(device.device_name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-semibold">
                      {device.device_name}
                    </h3>
                    {isCurrent && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded-full">
                        الجهاز الحالي
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      آخر استخدام:{' '}
                      {new Date(device.last_used).toLocaleDateString('ar-IQ', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    onClick={() => handleRemoveDevice(device.id)}
                    disabled={removingId === device.id}
                    className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition disabled:opacity-50"
                  >
                    {removingId === device.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {devices.length === 0 && (
          <div className="text-center py-12">
            <Monitor className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد أجهزة مسجلة</p>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-4 bg-gray-900/50 rounded-xl">
          <h3 className="text-white font-semibold mb-2">معلومات الأمان</h3>
          <ul className="text-sm text-gray-400 space-y-2">
            <li>• يتم تسجيل كل جهاز تلقائياً عند تسجيل الدخول</li>
            <li>• يمكنك مشاهدة الكورسات من جهازين كحد أقصى</li>
            <li>• إزالة جهاز ستنهي جلسته فوراً</li>
            <li>• لا يمكن إزالة الجهاز الحالي</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
