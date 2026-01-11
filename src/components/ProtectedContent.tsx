'use client'

import { useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { Lock, LogIn, ShoppingCart, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface ProtectedContentProps {
  courseId: string
  children: ReactNode
  fallback?: ReactNode
  showLoginPrompt?: boolean
  showPurchasePrompt?: boolean
  courseSlug?: string
  courseTitle?: string
}

/**
 * مكون حماية المحتوى
 * يعرض المحتوى فقط للمستخدمين المسجلين في الكورس
 */
export default function ProtectedContent({
  courseId,
  children,
  fallback,
  showLoginPrompt = true,
  showPurchasePrompt = true,
  courseSlug,
  courseTitle,
}: ProtectedContentProps) {
  const [status, setStatus] = useState<'loading' | 'enrolled' | 'not-enrolled' | 'not-logged-in'>('loading')
  const supabase = createClient()

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // التحقق من تسجيل الدخول
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setStatus('not-logged-in')
          return
        }

        // التحقق من التسجيل في الكورس
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single()

        setStatus(enrollment ? 'enrolled' : 'not-enrolled')
      } catch (error) {
        console.error('Error checking access:', error)
        setStatus('not-enrolled')
      }
    }

    checkAccess()
  }, [courseId, supabase])

  // حالة التحميل
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    )
  }

  // المستخدم مسجل في الكورس - عرض المحتوى
  if (status === 'enrolled') {
    return <>{children}</>
  }

  // عرض المحتوى البديل إذا وُجد
  if (fallback) {
    return <>{fallback}</>
  }

  // المستخدم غير مسجل دخول
  if (status === 'not-logged-in' && showLoginPrompt) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn className="h-8 w-8 text-cyan-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          يجب تسجيل الدخول
        </h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          قم بتسجيل الدخول لعرض محتوى الكورس والوصول إلى الدروس
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login">
            <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white">
              <LogIn className="ml-2 h-4 w-4" />
              تسجيل الدخول
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              إنشاء حساب جديد
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // المستخدم مسجل دخول لكن غير مسجل في الكورس
  if (status === 'not-enrolled' && showPurchasePrompt) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="h-8 w-8 text-yellow-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          محتوى محمي
        </h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          {courseTitle
            ? `سجل في "${courseTitle}" للوصول إلى هذا المحتوى`
            : 'سجل في الكورس للوصول إلى هذا المحتوى'}
        </p>
        {courseSlug && (
          <Link href={`/courses/${courseSlug}/checkout`}>
            <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white">
              <ShoppingCart className="ml-2 h-4 w-4" />
              سجل الآن
            </Button>
          </Link>
        )}
      </div>
    )
  }

  // لا يوجد رسالة للعرض
  return null
}

/**
 * مكون للتحقق من حالة التسجيل فقط (بدون UI)
 */
export function useProtectedContent(courseId: string) {
  const [status, setStatus] = useState<'loading' | 'enrolled' | 'not-enrolled' | 'not-logged-in'>('loading')
  const supabase = createClient()

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setStatus('not-logged-in')
          return
        }

        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single()

        setStatus(enrollment ? 'enrolled' : 'not-enrolled')
      } catch {
        setStatus('not-enrolled')
      }
    }

    checkAccess()
  }, [courseId, supabase])

  return {
    isLoading: status === 'loading',
    isEnrolled: status === 'enrolled',
    isLoggedIn: status !== 'not-logged-in',
    status,
  }
}
