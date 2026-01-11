// src/components/forms/RegisterForm.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, 'الاسم مطلوب')
    .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل')
    .max(50, 'الاسم طويل جداً'),
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('البريد الإلكتروني غير صحيح'),
  phone: z
    .string()
    .min(1, 'رقم الهاتف مطلوب')
    .regex(/^07[0-9]{9}$/, 'رقم الهاتف يجب أن يبدأ بـ 07 ويكون 11 رقم'),
  password: z
    .string()
    .min(1, 'كلمة المرور مطلوبة')
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z
    .string()
    .min(1, 'تأكيد كلمة المرور مطلوب'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const password = watch('password', '')

  // Password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    if (pass.length >= 6) strength++
    if (pass.length >= 8) strength++
    if (/[A-Z]/.test(pass)) strength++
    if (/[0-9]/.test(pass)) strength++
    if (/[^A-Za-z0-9]/.test(pass)) strength++

    if (strength <= 2) return { strength, label: 'ضعيفة', color: 'bg-red-500' }
    if (strength <= 3) return { strength, label: 'متوسطة', color: 'bg-yellow-500' }
    return { strength, label: 'قوية', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(password)

  // ─────────────────────────────────────────────────────────────
  // SUBMIT HANDLER - Uses API Route
  // ─────────────────────────────────────────────────────────────
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)

    try {
      // Use API route for proper cookie handling
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email.trim().toLowerCase(),
          password: data.password,
          fullName: data.fullName.trim(),
          phone: data.phone.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.error?.includes('already registered')) {
          toast.error('هذا البريد الإلكتروني مسجل مسبقاً')
        } else if (result.error?.includes('valid email')) {
          toast.error('البريد الإلكتروني غير صحيح')
        } else {
          toast.error(result.error || 'حدث خطأ في إنشاء الحساب')
        }
        setIsLoading(false)
        return
      }

      toast.success('تم إنشاء الحساب بنجاح! 🎉')
      
      // Redirect after successful registration
      setTimeout(() => {
        window.location.href = '/my-courses'
      }, 300)

    } catch (error) {
      console.error('Registration error:', error)
      toast.error('حدث خطأ غير متوقع، حاول مرة أخرى')
      setIsLoading(false)
    }
  }

  // Google signup
  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true)
    
    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?redirect=/my-courses`,
        },
      })

      if (error) {
        toast.error('حدث خطأ في التسجيل بـ Google')
        setIsGoogleLoading(false)
      }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع')
      setIsGoogleLoading(false)
    }
  }

  // Input class helper
  const inputClass = (hasError: boolean) => `
    w-full h-12 px-4 pr-11
    bg-white/5 border rounded-xl
    text-white placeholder-gray-500
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500
    disabled:opacity-50 disabled:cursor-not-allowed
    ${hasError ? 'border-red-500' : 'border-white/10 hover:border-white/20'}
  `

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      
      {/* FULL NAME */}
      <div className="space-y-2">
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
          الاسم الكامل
        </label>
        <div className="relative">
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="أحمد محمد"
            disabled={isLoading}
            className={inputClass(!!errors.fullName)}
            {...register('fullName')}
          />
          <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        </div>
        {errors.fullName && (
          <p className="text-sm text-red-400">{errors.fullName.message}</p>
        )}
      </div>

      {/* EMAIL */}
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
            className={inputClass(!!errors.email)}
            dir="ltr"
            {...register('email')}
          />
          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        </div>
        {errors.email && (
          <p className="text-sm text-red-400">{errors.email.message}</p>
        )}
      </div>

      {/* PHONE */}
      <div className="space-y-2">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
          رقم الهاتف
        </label>
        <div className="relative">
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="07xxxxxxxxx"
            disabled={isLoading}
            className={inputClass(!!errors.phone)}
            dir="ltr"
            {...register('phone')}
          />
          <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        </div>
        {errors.phone && (
          <p className="text-sm text-red-400">{errors.phone.message}</p>
        )}
      </div>

      {/* PASSWORD */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
          كلمة المرور
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            disabled={isLoading}
            className={`${inputClass(!!errors.password)} pl-11`}
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
        
        {/* Password Strength */}
        {password && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= passwordStrength.strength ? passwordStrength.color : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs ${
              passwordStrength.strength <= 2 ? 'text-red-400' : 
              passwordStrength.strength <= 3 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              قوة كلمة المرور: {passwordStrength.label}
            </p>
          </div>
        )}
        
        {errors.password && (
          <p className="text-sm text-red-400">{errors.password.message}</p>
        )}
      </div>

      {/* CONFIRM PASSWORD */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
          تأكيد كلمة المرور
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            disabled={isLoading}
            className={inputClass(!!errors.confirmPassword)}
            dir="ltr"
            {...register('confirmPassword')}
          />
          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* SUBMIT */}
      <button 
        type="submit" 
        disabled={isLoading || isGoogleLoading}
        className="
          w-full h-12 mt-6
          bg-gradient-to-l from-cyan-500 to-cyan-400 
          hover:from-cyan-400 hover:to-cyan-300
          text-black font-bold text-base
          rounded-xl
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-2
          shadow-lg shadow-cyan-500/20
        "
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>جاري إنشاء الحساب...</span>
          </>
        ) : (
          <>
            <span>ابدأ مسارك</span>
            <ArrowLeft className="w-5 h-5" />
          </>
        )}
      </button>

      {/* DIVIDER */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[#0a0a0f] text-gray-500">أو</span>
        </div>
      </div>

      {/* GOOGLE */}
      <button
        type="button"
        onClick={handleGoogleSignup}
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
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>التسجيل مع Google</span>
          </>
        )}
      </button>

      {/* TERMS */}
      <p className="text-center text-sm text-gray-500 mt-4">
        بالتسجيل، أنت توافق على{' '}
        <Link href="/terms" className="text-cyan-400 hover:text-cyan-300">الشروط والأحكام</Link>
        {' '}و{' '}
        <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300">سياسة الخصوصية</Link>
      </p>

      {/* LOGIN LINK */}
      <p className="text-center text-gray-400 mt-6">
        عندك حساب؟{' '}
        <Link href="/login" className="text-cyan-400 font-medium hover:text-cyan-300">
          كمّل من وين وقفت
        </Link>
      </p>
    </form>
  )
}
