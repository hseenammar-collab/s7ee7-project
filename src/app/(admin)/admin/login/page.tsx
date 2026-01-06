// src/app/(admin)/admin/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Shield, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const adminLoginSchema = z.object({
  email: z.string().email('الإيميل غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

type AdminLoginFormData = z.infer<typeof adminLoginSchema>

export default function AdminLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
  })

  const onSubmit = async (data: AdminLoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // محاولة تسجيل الدخول
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        if (authError.message.includes('Invalid login')) {
          setError('الإيميل أو كلمة المرور غير صحيحة')
        } else {
          setError(authError.message)
        }
        return
      }

      if (!authData.user) {
        setError('حدث خطأ في تسجيل الدخول')
        return
      }

      // التحقق من صلاحيات الأدمن
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (profileError || !profileData) {
        // تسجيل الخروج لأن المستخدم ليس لديه ملف شخصي
        await supabase.auth.signOut()
        setError('لا يمكن الوصول إلى معلومات الحساب')
        return
      }

      if (profileData.role !== 'admin') {
        // تسجيل الخروج لأن المستخدم ليس أدمن
        await supabase.auth.signOut()
        setError('ليس لديك صلاحيات الأدمن. هذه الصفحة مخصصة للمشرفين فقط.')
        return
      }

      // نجاح - المستخدم أدمن
      toast.success('مرحباً بك في لوحة التحكم!')
      router.push('/admin')
      router.refresh()
    } catch (err) {
      setError('حدث خطأ غير متوقع، حاول مرة أخرى')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sumerian-dark via-[#0a0a0a] to-sumerian-clay flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 ishtar-pattern opacity-5" />

      <div className="relative w-full max-w-md">
        {/* Admin Badge */}
        <div className="flex justify-center mb-6">
          <div className="bg-sumerian-gold/20 border border-sumerian-gold/30 rounded-full p-4">
            <Shield className="w-12 h-12 text-sumerian-gold" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">لوحة تحكم الأدمن</h1>
            <p className="text-gray-400">سجل دخولك للوصول للوحة التحكم</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@s7ee7.com"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-sumerian-gold"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-sumerian-gold pl-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base bg-sumerian-gold hover:bg-sumerian-gold/90 text-sumerian-dark font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                <>
                  <Shield className="ml-2 h-5 w-5" />
                  دخول كأدمن
                </>
              )}
            </Button>
          </form>

          {/* Footer Note */}
          <p className="text-center text-gray-500 text-sm mt-6">
            هذه الصفحة مخصصة للمشرفين فقط
          </p>
        </div>

        {/* Brand */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">S7EE7 Academy © 2024</p>
        </div>
      </div>
    </div>
  )
}
