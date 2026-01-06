'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpen,
  CheckCircle,
  Award,
  Clock,
  PlayCircle,
  ArrowLeft,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Profile, Course, Enrollment } from '@/types/database'

interface EnrollmentWithCourse extends Enrollment {
  course: Course
}

interface Stats {
  totalCourses: number
  completedCourses: number
  certificates: number
  totalHours: number
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([])
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    completedCourses: 0,
    certificates: 0,
    totalHours: 0,
  })
  const [lastCourse, setLastCourse] = useState<EnrollmentWithCourse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      // Fetch enrollments with courses
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', user.id)
        .order('last_watched_at', { ascending: false, nullsFirst: false })

      const enrollmentsWithCourses = (enrollmentData || []) as EnrollmentWithCourse[]
      setEnrollments(enrollmentsWithCourses)

      // Set last watched course
      if (enrollmentsWithCourses.length > 0) {
        setLastCourse(enrollmentsWithCourses[0])
      }

      // Fetch certificates count
      const { count: certCount } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Calculate stats
      const completedCount = enrollmentsWithCourses.filter(
        e => e.progress_percentage >= 100
      ).length

      const totalMinutes = enrollmentsWithCourses.reduce(
        (acc, e) => acc + (e.course?.duration_minutes || 0) * (e.progress_percentage / 100),
        0
      )

      setStats({
        totalCourses: enrollmentsWithCourses.length,
        completedCourses: completedCount,
        certificates: certCount || 0,
        totalHours: Math.round(totalMinutes / 60),
      })

      setIsLoading(false)
    }

    fetchData()
  }, [supabase])

  const statsCards = [
    {
      title: 'كورساتي',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'مكتمل',
      value: stats.completedCourses,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'الشهادات',
      value: stats.certificates,
      icon: Award,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'ساعات المشاهدة',
      value: stats.totalHours,
      icon: Clock,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          مرحباً، {profile?.full_name || 'المستخدم'}! 👋
        </h1>
        <p className="text-gray-500">تابع تعلمك من حيث توقفت</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color.split('-')[1]}-500`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Continue Learning */}
      {lastCourse && lastCourse.progress_percentage < 100 && (
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">متابعة التعلم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Course Image */}
              <div className="relative w-full sm:w-48 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {lastCourse.course.thumbnail_url ? (
                  <Image
                    src={lastCourse.course.thumbnail_url}
                    alt={lastCourse.course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <PlayCircle className="h-12 w-12 text-white" />
                </div>
              </div>

              {/* Course Info */}
              <div className="flex-1">
                <h3 className="font-semibold mb-2">{lastCourse.course.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span>{lastCourse.course.lessons_count} درس</span>
                  <span>{Math.round(lastCourse.course.duration_minutes / 60)} ساعة</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>نسبة الإتمام</span>
                    <span className="font-medium">{lastCourse.progress_percentage}%</span>
                  </div>
                  <Progress value={lastCourse.progress_percentage} className="h-2" />
                </div>
                <Link href={`/my-courses/${lastCourse.course_id}`}>
                  <Button className="mt-4">
                    <PlayCircle className="ml-2 h-4 w-4" />
                    متابعة التعلم
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Courses */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">كورساتي</CardTitle>
          {enrollments.length > 3 && (
            <Link
              href="/my-courses"
              className="text-sm text-primary hover:underline flex items-center"
            >
              عرض الكل
              <ArrowLeft className="mr-1 h-4 w-4" />
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">لم تسجل في أي كورس بعد</p>
              <Link href="/courses">
                <Button>تصفح الكورسات</Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrollments.slice(0, 3).map((enrollment) => (
                <Link
                  key={enrollment.id}
                  href={`/my-courses/${enrollment.course_id}`}
                  className="group"
                >
                  <div className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    {/* Image */}
                    <div className="relative h-32 bg-gray-100">
                      {enrollment.course.thumbnail_url ? (
                        <Image
                          src={enrollment.course.thumbnail_url}
                          alt={enrollment.course.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-10 w-10 text-gray-300" />
                        </div>
                      )}
                      {/* Progress Badge */}
                      <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded-full text-xs font-medium">
                        {enrollment.progress_percentage}%
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <h4 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {enrollment.course.title}
                      </h4>
                      <Progress
                        value={enrollment.progress_percentage}
                        className="h-1.5"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
