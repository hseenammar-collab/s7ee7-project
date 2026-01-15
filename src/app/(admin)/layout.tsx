// src/app/(admin)/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading')

  useEffect(() => {
    // Skip check for login page
    if (pathname === '/admin/login') {
      setStatus('authorized')
      return
    }

    const checkAdmin = async () => {
      // Wait for cookies to sync
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
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
        window.location.href = '/'
        return
      }

      setStatus('authorized')
    }

    checkAdmin()
  }, [pathname])

  // Always show login page without loading
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

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