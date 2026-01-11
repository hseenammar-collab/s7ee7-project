'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  BookOpen,
  CheckCircle,
  Award,
  Clock,
  PlayCircle,
  ArrowLeft,
  TrendingUp,
  Calendar,
  Target,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Profile, Course, Enrollment, Certificate } from '@/types/database'

interface EnrollmentWithCourse extends Enrollment {
  course: Course
}

interface Stats {
  totalCourses: number
  completedCourses: number
  inProgressCourses: number
  certificates: number
  totalHours: number
  lessonsCompleted: number
}

interface RecentActivity {
  type: 'lesson_complete' | 'course_complete' | 'enrollment'
  title: string
  courseName: string
  date: string
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    certificates: 0,
    totalHours: 0,
    lessonsCompleted: 0,
  })
  const [lastCourse, setLastCourse] = useState<EnrollmentWithCourse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
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

      // Set last watched course (not completed)
      const inProgressCourses = enrollmentsWithCourses.filter(
        e => e.progress_percentage > 0 && e.progress_percentage < 100
      )
      if (inProgressCourses.length > 0) {
        setLastCourse(inProgressCourses[0])
      } else if (enrollmentsWithCourses.length > 0 && enrollmentsWithCourses[0].progress_percentage < 100) {
        setLastCourse(enrollmentsWithCourses[0])
      }

      // Fetch certificates
      const { data: certData, count: certCount } = await supabase
        .from('certificates')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false })
        .limit(5)

      setCertificates(certData || [])

      // Fetch completed lessons count
      const { count: lessonsCount } = await supabase
        .from('lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_completed', true)

      // Calculate stats
      const completedCount = enrollmentsWithCourses.filter(
        e => e.progress_percentage >= 100 || e.completed_at
      ).length

      const inProgressCount = enrollmentsWithCourses.filter(
        e => e.progress_percentage > 0 && e.progress_percentage < 100
      ).length

      const totalMinutes = enrollmentsWithCourses.reduce(
        (acc, e) => acc + (e.course?.duration_minutes || 0) * (e.progress_percentage / 100),
        0
      )

      setStats({
        totalCourses: enrollmentsWithCourses.length,
        completedCourses: completedCount,
        inProgressCourses: inProgressCount,
        certificates: certCount || 0,
        totalHours: Math.round(totalMinutes / 60),
        lessonsCompleted: lessonsCount || 0,
      })

      setIsLoading(false)
    }

    fetchData()
  }, [])

  const statsCards = [
    {
      title: 'كورساتي',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
    },
    {
      title: 'قيد التقدم',
      value: stats.inProgressCourses,
      icon: TrendingUp,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-400',
    },
    {
      title: 'مكتمل',
      value: stats.completedCourses,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
    },
    {
      title: 'الشهادات',
      value: stats.certificates,
      icon: Award,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
    },
  ]

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'صباح الخير'
    if (hour < 17) return 'مساء الخير'
    return 'مساء الخير'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-6">
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-white/10 rounded" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white/5 rounded-xl" />
            ))}
          </div>
          <div className="h-48 bg-white/5 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {getGreeting()}، {profile?.full_name?.split(' ')[0] || 'المتعلم'}! 👋
            </h1>
            <p className="text-gray-400 mt-1">تابع رحلتك التعليمية واكتسب مهارات جديدة</p>
          </div>
          <Link href="/courses">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
              <BookOpen className="ml-2 h-4 w-4" />
              تصفح الكورسات
            </Button>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                      <p className="text-sm text-gray-400">{stat.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Continue Learning */}
        {lastCourse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-cyan-400" />
                  متابعة التعلم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Course Image */}
                  <div className="relative w-full md:w-64 h-40 rounded-xl overflow-hidden flex-shrink-0 group">
                    {lastCourse.course.thumbnail_url ? (
                      <Image
                        src={lastCourse.course.thumbnail_url}
                        alt={lastCourse.course.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/10 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-gray-600" />
                      </div>
                    )}
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center">
                        <PlayCircle className="h-8 w-8 text-white" fill="white" />
                      </div>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{lastCourse.course.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {lastCourse.course.lessons_count} درس
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {Math.round(lastCourse.course.duration_minutes / 60)} ساعة
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {lastCourse.course.level === 'beginner' ? 'مبتدئ' : lastCourse.course.level === 'intermediate' ? 'متوسط' : 'متقدم'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">نسبة الإتمام</span>
                        <span className="font-bold text-cyan-400">{lastCourse.progress_percentage}%</span>
                      </div>
                      <Progress value={lastCourse.progress_percentage} className="h-2 bg-white/10" />
                      <Link href={`/my-courses/${lastCourse.course_id}${lastCourse.last_lesson_id ? `/${lastCourse.last_lesson_id}` : ''}`}>
                        <Button className="w-full md:w-auto bg-cyan-500 hover:bg-cyan-600 mt-2">
                          <PlayCircle className="ml-2 h-4 w-4" />
                          {lastCourse.progress_percentage === 0 ? 'ابدأ الآن' : 'متابعة التعلم'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* My Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 bg-white/5 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-white">كورساتي</CardTitle>
                {enrollments.length > 4 && (
                  <Link
                    href="/my-courses"
                    className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center"
                  >
                    عرض الكل
                    <ArrowLeft className="mr-1 h-4 w-4" />
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                {enrollments.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">لم تسجل في أي كورس بعد</p>
                    <Link href="/courses">
                      <Button className="bg-cyan-500 hover:bg-cyan-600">
                        تصفح الكورسات
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {enrollments.slice(0, 4).map((enrollment, index) => (
                      <motion.div
                        key={enrollment.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        <Link
                          href={`/my-courses/${enrollment.course_id}`}
                          className="group block"
                        >
                          <div className="bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all hover:ring-1 hover:ring-cyan-500/50">
                            {/* Image */}
                            <div className="relative h-32">
                              {enrollment.course.thumbnail_url ? (
                                <Image
                                  src={enrollment.course.thumbnail_url}
                                  alt={enrollment.course.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                                  <BookOpen className="h-10 w-10 text-gray-600" />
                                </div>
                              )}
                              {/* Progress Badge */}
                              <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                                enrollment.progress_percentage >= 100
                                  ? 'bg-green-500/90 text-white'
                                  : 'bg-black/70 text-white'
                              }`}>
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
                            {/* Info */}
                            <div className="p-4">
                              <h4 className="font-medium text-white text-sm line-clamp-2 mb-3 group-hover:text-cyan-400 transition-colors">
                                {enrollment.course.title}
                              </h4>
                              <Progress
                                value={enrollment.progress_percentage}
                                className="h-1.5 bg-white/10"
                              />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Side Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            {/* Quick Stats */}
            <Card className="border-0 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-white">إحصائيات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">الدروس المكتملة</span>
                  <span className="text-white font-bold">{stats.lessonsCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">ساعات المشاهدة</span>
                  <span className="text-white font-bold">{stats.totalHours} ساعة</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">معدل الإتمام</span>
                  <span className="text-cyan-400 font-bold">
                    {stats.totalCourses > 0
                      ? Math.round((stats.completedCourses / stats.totalCourses) * 100)
                      : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Certificates */}
            {certificates.length > 0 && (
              <Card className="border-0 bg-white/5 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-400" />
                    شهاداتي
                  </CardTitle>
                  <Link
                    href="/certificates"
                    className="text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    عرض الكل
                  </Link>
                </CardHeader>
                <CardContent className="space-y-3">
                  {certificates.slice(0, 3).map((cert) => (
                    <div
                      key={cert.id}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">شهادة إتمام</p>
                        <p className="text-xs text-gray-400">{formatDate(cert.issued_at)}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Tips Card */}
            <Card className="border-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Target className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">نصيحة اليوم</h4>
                    <p className="text-sm text-gray-400">
                      التعلم المستمر هو مفتاح النجاح. حاول إكمال درس واحد على الأقل يومياً!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
