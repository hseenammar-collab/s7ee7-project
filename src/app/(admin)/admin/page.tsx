// src/app/(admin)/admin/login/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Shield, Lock, Mail, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة').min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      // Use API route for proper cookie handling
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email.trim().toLowerCase(),
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'حدث خطأ في تسجيل الدخول')
        setIsLoading(false)
        return
      }

      toast.success('مرحباً بك في لوحة التحكم!')
      
      // Redirect to admin dashboard
      setTimeout(() => {
        window.location.href = '/admin'
      }, 300)

    } catch (error) {
      toast.error('حدث خطأ غير متوقع')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4" dir="rtl">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black text-white">S7EE7</span>
          </Link>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full mb-6">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">لوحة التحكم</span>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">تسجيل دخول المدير</h1>
          <p className="text-gray-400">أدخل بياناتك للوصول للوحة التحكم</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                autoComplete="email"
                placeholder="admin@s7ee7.com"
                disabled={isLoading}
                className={`
                  w-full h-12 px-4 pr-11
                  bg-white/5 border rounded-xl
                  text-white placeholder-gray-500
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500
                  disabled:opacity-50
                  ${errors.email ? 'border-red-500' : 'border-white/10 hover:border-white/20'}
                `}
                dir="ltr"
                {...register('email')}
              />
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            </div>
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={isLoading}
                className={`
                  w-full h-12 px-4 pr-11 pl-11
                  bg-white/5 border rounded-xl
                  text-white placeholder-gray-500
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500
                  disabled:opacity-50
                  ${errors.password ? 'border-red-500' : 'border-white/10 hover:border-white/20'}
                `}
                dir="ltr"
                {...register('password')}
              />
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="
              w-full h-12 
              bg-gradient-to-l from-purple-500 to-purple-600 
              hover:from-purple-400 hover:to-purple-500
              text-white font-bold text-base
              rounded-xl
              transition-all duration-200
              disabled:opacity-50
              flex items-center justify-center gap-2
              shadow-lg shadow-purple-500/20
            "
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>جاري التحقق...</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>دخول لوحة التحكم</span>
              </>
            )}
          </button>
        </form>

        {/* Back to site */}
        <p className="text-center text-gray-500 mt-8">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            العودة للموقع الرئيسي
          </Link>
        </p>
      </div>
    </div>
  )
}
