// src/app/(auth)/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Mail, ArrowRight, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('البريد الإلكتروني غير صحيح'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.resetPasswordForEmail(
        data.email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      )

      if (error) {
        toast.error('حدث خطأ، حاول مرة أخرى')
        setIsLoading(false)
        return
      }

      setIsSuccess(true)
      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور')
    } catch (error) {
      toast.error('حدث خطأ غير متوقع')
      setIsLoading(false)
    }
  }

  // Success State
  if (isSuccess) {
    return (
      <div className="animate-fade-in text-center">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">
          تم إرسال الرابط! ✉️
        </h2>
        
        <p className="text-gray-400 mb-8">
          راجع بريدك الإلكتروني واضغط على الرابط لإعادة تعيين كلمة المرور.
        </p>

        <Link 
          href="/login"
          className="
            inline-flex items-center gap-2
            text-cyan-400 hover:text-cyan-300 
            font-medium transition-colors
          "
        >
          <ArrowRight className="w-5 h-5" />
          <span>العودة لتسجيل الدخول</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-3">
          نسيت كلمة المرور؟
        </h2>
        <p className="text-gray-400 text-lg">
          لا تقلق، أدخل إيميلك ونرسلك رابط إعادة التعيين.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
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
            <p className="text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isLoading}
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
          "
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>جاري الإرسال...</span>
            </>
          ) : (
            <span>أرسل رابط إعادة التعيين</span>
          )}
        </button>

        {/* Back to Login */}
        <Link 
          href="/login"
          className="
            flex items-center justify-center gap-2
            text-gray-400 hover:text-white 
            font-medium transition-colors mt-6
          "
        >
          <ArrowRight className="w-5 h-5" />
          <span>العودة لتسجيل الدخول</span>
        </Link>
      </form>
    </div>
  )
}
