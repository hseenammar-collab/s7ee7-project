'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, Loader2, Mail, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const forgotPasswordSchema = z.object({
  email: z.string().email('الإيميل غير صحيح'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const supabase = createClient()

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
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      setIsSuccess(true)
      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور')
    } catch (error) {
      toast.error('حدث خطأ، حاول مرة أخرى')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="animate-fade-in text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">تحقق من إيميلك</h2>
        <p className="text-gray-600 mb-8">
          تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.
          <br />
          قد يستغرق وصول الرسالة بضع دقائق.
        </p>
        <div className="space-y-3">
          <Link href="/login">
            <Button variant="outline" className="w-full">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة لتسجيل الدخول
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <Link
        href="/login"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowRight className="ml-1 h-4 w-4" />
        العودة لتسجيل الدخول
      </Link>

      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
        <Mail className="w-6 h-6 text-primary" />
      </div>

      <h2 className="text-3xl font-bold mb-2">نسيت كلمة المرور؟</h2>
      <p className="text-gray-600 mb-8">
        لا تقلق! أدخل إيميلك وسنرسل لك رابط لإعادة تعيين كلمة المرور.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            placeholder="example@email.com"
            className="h-12"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="ml-2 h-5 w-5 animate-spin" />
              جاري الإرسال...
            </>
          ) : (
            'إرسال رابط إعادة التعيين'
          )}
        </Button>
      </form>

      <p className="text-center text-gray-600 mt-6">
        تذكرت كلمة المرور؟{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          سجل دخول
        </Link>
      </p>
    </div>
  )
}
