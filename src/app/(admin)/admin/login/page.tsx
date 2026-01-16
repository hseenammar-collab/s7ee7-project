// src/app/(admin)/admin/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Lock, Mail, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkExisting = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          console.log('Existing session found, checking admin...')
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

          console.log('Profile check result:', profile)

          if (profile?.role === 'admin') {
            console.log('Already admin, redirecting...')
            router.replace('/admin')
            return
          } else {
            console.log('Not admin, signing out...')
            await supabase.auth.signOut()
          }
        }
      } catch (err) {
        console.error('Check existing error:', err)
      }
      setChecking(false)
    }

    // Timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setChecking(false)
    }, 3000)

    checkExisting().finally(() => clearTimeout(timeout))
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      console.log('1. Signing in...')
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.log('Auth error:', authError)
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('حدث خطأ في تسجيل الدخول')
        setLoading(false)
        return
      }

      console.log('2. Signed in, checking profile...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      console.log('3. Profile result:', profile, profileError)

      if (profileError || profile?.role !== 'admin') {
        console.log('4. Not admin, signing out...')
        await supabase.auth.signOut()
        setError('⛔ ليس لديك صلاحية للوصول للوحة التحكم')
        setLoading(false)
        return
      }

      console.log('4. Admin verified, redirecting...')
      toast.success('مرحباً بك في لوحة التحكم!')
      router.push('/admin')

    } catch (err) {
      console.error('Login error:', err)
      setError('حدث خطأ غير متوقع')
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-gray-400 text-sm">لوحة التحكم</span>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">S7EE7</span>
          </div>
          <h1 className="text-xl font-bold text-white">تسجيل دخول المدير</h1>
          <p className="text-gray-400 text-sm mt-2">أدخل بياناتك للوصول للوحة التحكم</p>
        </div>

        <form onSubmit={handleLogin} className="bg-[#111118] border border-white/10 rounded-2xl p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-2">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                disabled={loading}
                className="w-full h-12 pr-11 pl-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full h-12 pr-11 pl-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري التحقق...</span>
              </>
            ) : (
              <span>تسجيل الدخول</span>
            )}
          </button>

          <div className="text-center">
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              العودة للموقع الرئيسي
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}