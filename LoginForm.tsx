// src/components/forms/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

// ═══════════════════════════════════════════════════════════════
// VALIDATION SCHEMA
// ═══════════════════════════════════════════════════════════════
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('البريد الإلكتروني غير صحيح'),
  password: z
    .string()
    .min(1, 'كلمة المرور مطلوبة')
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

type LoginFormData = z.infer<typeof loginSchema>

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function LoginForm() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/my-courses'
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // ─────────────────────────────────────────────────────────────
  // SUBMIT HANDLER
  // ─────────────────────────────────────────────────────────────
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      })

      if (error) {
        // Handle specific errors
        if (error.message.includes('Invalid login')) {
          toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('يرجى تأكيد بريدك الإلكتروني أولاً')
        } else {
          toast.error('حدث خطأ في تسجيل الدخول')
        }
        setIsLoading(false)
        return
      }

      if (authData.user) {
        toast.success('أهلاً بعودتك! 🎉')
        
        // Full page reload to ensure auth state is fresh
        setTimeout(() => {
          window.location.href = redirect
        }, 800)
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('حدث خطأ غير متوقع، حاول مرة أخرى')
      setIsLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // GOOGLE LOGIN
  // ─────────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    
    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?redirect=${redirect}`,
        },
      })

      if (error) {
        toast.error('حدث خطأ في تسجيل الدخول بـ Google')
        setIsGoogleLoading(false)
      }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع')
      setIsGoogleLoading(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      
      {/* ─────────────────────────────────────────────────────────────
          EMAIL FIELD
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
          البريد الإلكتروني
        </label>
        <div className="relative">
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="example@email.com"
            disabled={isLoading}
            className={`
              w-full h-12 px-4 pr-11
              bg-white/5 border rounded-xl
              text-white placeholder-gray-500
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.email ? 'border-red-500' : 'border-white/10 hover:border-white/20'}
            `}
            dir="ltr"
            {...register('email')}
          />
          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        </div>
        {errors.email && (
          <p className="text-sm text-red-400 flex items-center gap-1">
            <span className="inline-block w-1 h-1 bg-red-400 rounded-full" />
            {errors.email.message}
          </p>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PASSWORD FIELD
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            كلمة المرور
          </label>
          <Link 
            href="/forgot-password" 
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            نسيت كلمة المرور؟
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={isLoading}
            className={`
              w-full h-12 px-4 pr-11 pl-11
              bg-white/5 border rounded-xl
              text-white placeholder-gray-500
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.password ? 'border-red-500' : 'border-white/10 hover:border-white/20'}
            `}
            dir="ltr"
            {...register('password')}
          />
          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-400 flex items-center gap-1">
            <span className="inline-block w-1 h-1 bg-red-400 rounded-full" />
            {errors.password.message}
          </p>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SUBMIT BUTTON
      ───────────────────────────────────────────────────────────── */}
      <button 
        type="submit" 
        disabled={isLoading || isGoogleLoading}
        className="
          w-full h-12 
          bg-gradient-to-l from-cyan-500 to-cyan-400 
          hover:from-cyan-400 hover:to-cyan-300
          text-black font-bold text-base
          rounded-xl
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-2
          shadow-lg shadow-cyan-500/20
          hover:shadow-cyan-500/30
        "
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>جاري الدخول...</span>
          </>
        ) : (
          <>
            <span>كمّل من وين وقفت</span>
            <ArrowLeft className="w-5 h-5" />
          </>
        )}
      </button>

      {/* ─────────────────────────────────────────────────────────────
          DIVIDER
      ───────────────────────────────────────────────────────────── */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[#0a0a0f] text-gray-500">أو</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          GOOGLE LOGIN
      ───────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading || isGoogleLoading}
        className="
          w-full h-12 
          bg-white/5 border border-white/10
          hover:bg-white/10 hover:border-white/20
          text-white font-medium
          rounded-xl
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-3
        "
      >
        {isGoogleLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path 
                fill="#4285F4" 
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" 
              />
              <path 
                fill="#34A853" 
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" 
              />
              <path 
                fill="#FBBC05" 
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" 
              />
              <path 
                fill="#EA4335" 
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" 
              />
            </svg>
            <span>المتابعة مع Google</span>
          </>
        )}
      </button>

      {/* ─────────────────────────────────────────────────────────────
          REGISTER LINK
      ───────────────────────────────────────────────────────────── */}
      <p className="text-center text-gray-400 mt-8">
        ما عندك حساب؟{' '}
        <Link 
          href="/register" 
          className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors"
        >
          ابدأ مسارك
        </Link>
      </p>
    </form>
  )
}
