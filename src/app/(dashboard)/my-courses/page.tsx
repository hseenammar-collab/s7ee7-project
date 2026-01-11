'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Clock, PlayCircle, CheckCircle, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Course, Enrollment } from '@/types/database'

interface EnrollmentWithCourse extends Enrollment {
  course: Course
}

type FilterType = 'all' | 'in_progress' | 'completed'

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEnrollments = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false })

      setEnrollments((data || []) as EnrollmentWithCourse[])
      setIsLoading(false)
    }

    fetchEnrollments()
  }, [])

  const filteredEnrollments = enrollments.filter((enrollment) => {
    if (filter === 'all') return true
    if (filter === 'in_progress') return enrollment.progress_percentage < 100
    if (filter === 'completed') return enrollment.progress_percentage >= 100
    return true
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-6">
        <div className="space-y-6">
          <div className="h-8 w-32 bg-white/10 rounded animate-pulse" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">كورساتي</h1>
            <p className="text-gray-400">
              {enrollments.length} كورس مسجل
            </p>
          </div>

          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="all" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                الكل
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                قيد التقدم
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                مكتمل
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Courses Grid */}
        {filteredEnrollments.length === 0 ? (
          <Card className="border-0 bg-white/5">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                {filter === 'all'
                  ? 'لم تسجل في أي كورس بعد'
                  : filter === 'in_progress'
                  ? 'لا توجد كورسات قيد التقدم'
                  : 'لم تكمل أي كورس بعد'}
              </h3>
              <p className="text-gray-400 mb-6">
                ابدأ رحلة التعلم الآن واكتسب مهارات جديدة
              </p>
              <Link href="/courses">
                <Button className="bg-cyan-500 hover:bg-cyan-600">تصفح الكورسات</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEnrollments.map((enrollment) => (
              <Card
                key={enrollment.id}
                className="border-0 bg-white/5 overflow-hidden hover:bg-white/10 transition-all group"
              >
                {/* Image */}
                <div className="relative h-40">
                  {enrollment.course.thumbnail_url ? (
                    <Image
                      src={enrollment.course.thumbnail_url}
                      alt={enrollment.course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-gray-600" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div
                    className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${
                      enrollment.progress_percentage >= 100
                        ? 'bg-green-500 text-white'
                        : 'bg-black/70 text-white'
                    }`}
                  >
                    {enrollment.progress_percentage >= 100 ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        مكتمل
                      </span>
                    ) : (
                      `${enrollment.progress_percentage}%`
                    )}
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-white line-clamp-2 mb-2 group-hover:text-cyan-400 transition-colors">
                    {enrollment.course.title}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {enrollment.course.lessons_count} درس
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {Math.round(enrollment.course.duration_minutes / 60)} ساعة
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="space-y-3">
                    <Progress
                      value={enrollment.progress_percentage}
                      className="h-2 bg-white/10"
                    />
                    <p className="text-xs text-gray-500">
                      تاريخ التسجيل: {formatDate(enrollment.enrolled_at)}
                    </p>
                  </div>

                  {/* Action Button - Opens Teachable */}
                  {enrollment.course.teachable_url ? (
                    <a
                      href={enrollment.course.teachable_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-4"
                    >
                      <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
                        <PlayCircle className="ml-2 h-4 w-4" />
                        ابدأ التعلم
                        <ExternalLink className="mr-2 h-3 w-3" />
                      </Button>
                    </a>
                  ) : (
                    <Link href={`/my-courses/${enrollment.course_id}`} className="block mt-4">
                      <Button className="w-full bg-cyan-500 hover:bg-cyan-600">
                        <PlayCircle className="ml-2 h-4 w-4" />
                        متابعة التعلم
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
