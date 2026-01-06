'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  PlayCircle,
  Clock,
  BookOpen,
  Award,
  Globe,
  Infinity,
  CheckCircle,
  ShoppingCart,
  Play,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDuration } from '@/lib/constants'
import type { Course } from '@/types/database'

interface CourseSidebarDarkProps {
  course: Course
}

export default function CourseSidebarDark({ course }: CourseSidebarDarkProps) {
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const checkEnrollment = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      const { data } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', course.id)
        .single()

      setIsEnrolled(!!data)
      setIsLoading(false)
    }

    checkEnrollment()
  }, [course.id, supabase])

  const hasDiscount = course.discount_price_iqd && course.discount_price_iqd < course.price_iqd
  const discountPercentage = hasDiscount
    ? Math.round(((course.price_iqd - course.discount_price_iqd!) / course.price_iqd) * 100)
    : 0
  const isFree = course.price_iqd === 0

  const features = [
    { icon: Clock, label: `${formatDuration(course.duration_minutes)} من المحتوى` },
    { icon: BookOpen, label: `${course.lessons_count} درس` },
    { icon: Globe, label: course.language || 'العربية' },
    { icon: Infinity, label: 'وصول مدى الحياة' },
    { icon: Award, label: 'شهادة إتمام' },
  ]

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      {/* Course Preview Image/Video */}
      <div className="relative aspect-video">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-white/30" />
          </div>
        )}

        {/* Play Preview Button */}
        {course.preview_video_url && (
          <button
            onClick={() => setShowPreview(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors group"
          >
            <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/50">
              <Play className="h-8 w-8 text-white fill-white mr-[-2px]" />
            </div>
            <span className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
              معاينة الكورس
            </span>
          </button>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            خصم {discountPercentage}%
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Price */}
        <div>
          {isFree ? (
            <div className="text-3xl font-bold text-green-400">مجاني</div>
          ) : (
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-white">
                  {formatPrice(hasDiscount ? course.discount_price_iqd! : course.price_iqd)} د.ع
                </span>
                {hasDiscount && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(course.price_iqd)} د.ع
                  </span>
                )}
              </div>
              {hasDiscount && (
                <div className="mt-1 text-green-400 text-sm font-medium">
                  وفر {formatPrice(course.price_iqd - course.discount_price_iqd!)} د.ع
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        {isLoading ? (
          <div className="h-12 bg-white/10 rounded-xl animate-pulse" />
        ) : isEnrolled ? (
          <Link href={`/my-courses/${course.id}`}>
            <Button className="w-full h-12 text-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white border-0">
              <PlayCircle className="ml-2 h-5 w-5" />
              متابعة التعلم
            </Button>
          </Link>
        ) : (
          <div className="space-y-3">
            <Link href={`/courses/${course.slug}/checkout`}>
              <Button className="w-full h-12 text-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white border-0">
                <ShoppingCart className="ml-2 h-5 w-5" />
                {isFree ? 'سجل مجاناً' : 'اشتر الآن'}
              </Button>
            </Link>
          </div>
        )}

        {/* Separator */}
        <div className="h-px bg-white/10" />

        {/* Features */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white">يتضمن الكورس:</h4>
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 text-gray-400">
              <feature.icon className="h-5 w-5 text-cyan-400" />
              <span>{feature.label}</span>
            </div>
          ))}
        </div>

        {/* What You Learn Preview */}
        {course.what_you_learn && course.what_you_learn.length > 0 && (
          <>
            <div className="h-px bg-white/10" />
            <div className="space-y-3">
              <h4 className="font-semibold text-white">ستتعلم:</h4>
              {course.what_you_learn.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-gray-400">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
              {course.what_you_learn.length > 3 && (
                <p className="text-sm text-cyan-400">
                  +{course.what_you_learn.length - 3} المزيد
                </p>
              )}
            </div>
          </>
        )}

        {/* Money Back Guarantee */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <p className="text-green-400 text-sm font-medium">
            ضمان استرداد الأموال خلال 30 يوم
          </p>
        </div>
      </div>

      {/* Video Preview Modal */}
      {showPreview && course.preview_video_url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
            >
              ✕
            </button>
            <iframe
              src={course.preview_video_url}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  )
}
