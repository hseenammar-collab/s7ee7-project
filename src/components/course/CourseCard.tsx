'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, Users, Clock, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDuration, categoryLabels, levelLabels } from '@/lib/constants'
import type { Course } from '@/types/database'

interface CourseCardProps {
  course: Course
  index?: number
  variant?: 'default' | 'dark'
}

export default function CourseCard({ course, index = 0, variant = 'dark' }: CourseCardProps) {
  const hasDiscount = course.discount_price_iqd && course.discount_price_iqd < course.price_iqd
  const isFree = course.price_iqd === 0

  if (variant === 'dark') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
      >
        <Link href={`/courses/${course.slug}`}>
          <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10">
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600/20 via-indigo-600/20 to-pink-600/20 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-white/30" />
                </div>
              )}

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />

              {/* Badges */}
              <div className="absolute top-3 right-3 flex flex-wrap gap-2">
                {course.category && (
                  <Badge className="bg-purple-500/80 text-white border-0 backdrop-blur-sm">
                    {categoryLabels[course.category] || course.category}
                  </Badge>
                )}
                {isFree && (
                  <Badge className="bg-green-500/80 text-white border-0 backdrop-blur-sm">
                    مجاني
                  </Badge>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Title */}
              <h3 className="font-bold text-lg text-white line-clamp-2 group-hover:text-purple-300 transition-colors">
                {course.title}
              </h3>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span>{course.average_rating?.toFixed(1) || '0.0'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course.students_count || 0} طالب</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                {/* Price */}
                <div className="flex items-center gap-2">
                  {isFree ? (
                    <span className="text-lg font-bold text-green-400">مجاني</span>
                  ) : hasDiscount ? (
                    <>
                      <span className="text-lg font-bold text-purple-400">
                        {formatPrice(course.discount_price_iqd!)} د.ع
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(course.price_iqd)}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-purple-400">
                      {formatPrice(course.price_iqd)} د.ع
                    </span>
                  )}
                </div>

                {/* Level & Duration */}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Badge variant="outline" className="border-white/20 text-gray-400">
                    {levelLabels[course.level] || course.level}
                  </Badge>
                  {course.duration_minutes > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(course.duration_minutes)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  // Default light variant (original design)
  return (
    <Link href={`/courses/${course.slug}`}>
      <div className="course-card group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-indigo-500/20 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-primary/50" />
            </div>
          )}

          {/* Level Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/90 text-gray-700">
              {levelLabels[course.level] || course.level}
            </Badge>
          </div>

          {/* Featured Badge */}
          {course.is_featured && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-yellow-500 hover:bg-yellow-500">
                <Star className="h-3 w-3 ml-1 fill-current" />
                مميز
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category */}
          {course.category && (
            <span className="text-xs text-primary font-medium">
              {categoryLabels[course.category] || course.category}
            </span>
          )}

          {/* Title */}
          <h3 className="font-bold text-lg mt-1 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          {/* Description */}
          {course.short_description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
              {course.short_description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.lessons_count} درس</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(course.duration_minutes)}</span>
            </div>
            {course.students_count > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.students_count}</span>
              </div>
            )}
          </div>

          {/* Rating */}
          {course.average_rating > 0 && (
            <div className="flex items-center gap-1 mb-4">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600">
                {course.average_rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              {isFree ? (
                <span className="text-xl font-bold text-green-600">مجاني</span>
              ) : hasDiscount ? (
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(course.discount_price_iqd!)} د.ع
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(course.price_iqd)}
                  </span>
                </div>
              ) : (
                <span className="text-xl font-bold text-primary">
                  {formatPrice(course.price_iqd)} د.ع
                </span>
              )}
            </div>

            <span className="text-sm text-primary font-medium group-hover:underline">
              عرض الكورس ←
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
