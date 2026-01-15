// src/app/(admin)/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading')

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Not logged in - redirect to admin login
        window.location.href = '/admin/login'
        return
      }

      // Check if admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        // Not admin - redirect to home
        window.location.href = '/'
        return
      }

      setStatus('authorized')
    }

    // Skip check for login page
    if (window.location.pathname === '/admin/login') {
      setStatus('authorized')
      return
    }

    checkAdmin()
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}