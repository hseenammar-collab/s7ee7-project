'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Users,
  DollarSign,
  BookOpen,
  Award,
  Target,
  BarChart3,
  PieChart,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/constants'

interface TopCourse {
  title: string
  count: number
}

interface Stats {
  totalRevenue: number
  totalUsers: number
  totalEnrollments: number
  totalCourses: number
  completionRate: number
  averageOrderValue: number
  topCourses: TopCourse[]
  recentGrowth: {
    users: number
    revenue: number
    enrollments: number
  }
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalUsers: 0,
    totalEnrollments: 0,
    totalCourses: 0,
    completionRate: 0,
    averageOrderValue: 0,
    topCourses: [],
    recentGrowth: {
      users: 0,
      revenue: 0,
      enrollments: 0,
    },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    const supabase = createClient()

    // إجمالي الإيرادات
    const { data: revenueData } = await supabase
      .from('payments')
      .select('amount_iqd')
      .eq('status', 'completed')

    const totalRevenue =
      revenueData?.reduce((sum, o) => sum + (o.amount_iqd || 0), 0) || 0
    const averageOrderValue =
      revenueData && revenueData.length > 0
        ? totalRevenue / revenueData.length
        : 0

    // إجمالي المستخدمين
    const { count: usersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // إجمالي التسجيلات
    const { count: enrollmentsCount } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })

    // الكورسات المكتملة
    const { count: completedCount } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .gte('progress_percentage', 100)

    const completionRate =
      enrollmentsCount && enrollmentsCount > 0
        ? Math.round((completedCount || 0 / enrollmentsCount) * 100)
        : 0

    // إجمالي الكورسات
    const { count: coursesCount } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })

    // أفضل الكورسات مبيعاً
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id, courses(title)')
      .limit(100)

    const courseCounts =
      enrollments?.reduce(
        (acc: Record<string, number>, item: any) => {
          const title = item.courses?.title
          if (title) {
            acc[title] = (acc[title] || 0) + 1
          }
          return acc
        },
        {} as Record<string, number>
      ) || {}

    const topCourses = Object.entries(courseCounts)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 5)
      .map(([title, count]) => ({ title, count: count as number }))

    // النمو الأخير (آخر 30 يوم)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: recentUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())

    const { data: recentRevenue } = await supabase
      .from('payments')
      .select('amount_iqd')
      .eq('status', 'completed')
      .gte('created_at', thirtyDaysAgo.toISOString())

    const recentRevenueTotal =
      recentRevenue?.reduce((sum, o) => sum + (o.amount_iqd || 0), 0) || 0

    const { count: recentEnrollments } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .gte('enrolled_at', thirtyDaysAgo.toISOString())

    setStats({
      totalRevenue,
      totalUsers: usersCount || 0,
      totalEnrollments: enrollmentsCount || 0,
      totalCourses: coursesCount || 0,
      completionRate,
      averageOrderValue,
      topCourses,
      recentGrowth: {
        users: recentUsers || 0,
        revenue: recentRevenueTotal,
        enrollments: recentEnrollments || 0,
      },
    })
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const overviewCards = [
    {
      title: 'إجمالي الإيرادات',
      value: `${formatPrice(stats.totalRevenue)} د.ع`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      change: `+${formatPrice(stats.recentGrowth.revenue)} د.ع هذا الشهر`,
    },
    {
      title: 'إجمالي المستخدمين',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: `+${stats.recentGrowth.users} هذا الشهر`,
    },
    {
      title: 'إجمالي التسجيلات',
      value: stats.totalEnrollments,
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600',
      change: `+${stats.recentGrowth.enrollments} هذا الشهر`,
    },
    {
      title: 'إجمالي الكورسات',
      value: stats.totalCourses,
      icon: Award,
      color: 'from-cyan-500 to-cyan-600',
      change: 'كورسات منشورة',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">التقارير والإحصائيات</h1>
        <p className="text-gray-400 mt-1">
          نظرة شاملة على أداء المنصة والإحصائيات
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${card.color} p-5 rounded-2xl text-white`}
          >
            <card.icon className="h-8 w-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{card.value}</div>
            <div className="text-sm opacity-80">{card.title}</div>
            <div className="text-xs opacity-60 mt-2">{card.change}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* أفضل الكورسات */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              أفضل الكورسات مبيعاً
            </h2>
          </div>

          {stats.topCourses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا توجد بيانات</p>
          ) : (
            <div className="space-y-4">
              {stats.topCourses.map((course, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : index === 1
                            ? 'bg-gray-400/20 text-gray-300'
                            : index === 2
                              ? 'bg-amber-600/20 text-amber-500'
                              : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-white font-medium">{course.title}</span>
                  </div>
                  <span className="text-cyan-400 font-bold">
                    {course.count} طالب
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* إحصائيات سريعة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <PieChart className="h-5 w-5 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-white">إحصائيات سريعة</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-gray-400">معدل الإكمال</span>
              <span className="text-green-400 font-bold">
                {stats.completionRate}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-gray-400">متوسط قيمة الطلب</span>
              <span className="text-cyan-400 font-bold">
                {formatPrice(stats.averageOrderValue)} د.ع
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-gray-400">معدل التحويل</span>
              <span className="text-yellow-400 font-bold">
                {stats.totalUsers > 0
                  ? Math.round((stats.totalEnrollments / stats.totalUsers) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-gray-400">طلاب لكل كورس</span>
              <span className="text-purple-400 font-bold">
                {stats.totalCourses > 0
                  ? Math.round(stats.totalEnrollments / stats.totalCourses)
                  : 0}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* النمو الشهري */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">النمو هذا الشهر</h2>
            <p className="text-gray-400 text-sm">آخر 30 يوم</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <Users className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              +{stats.recentGrowth.users}
            </div>
            <div className="text-sm text-gray-400">مستخدم جديد</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <BookOpen className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              +{stats.recentGrowth.enrollments}
            </div>
            <div className="text-sm text-gray-400">تسجيل جديد</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <DollarSign className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              +{formatPrice(stats.recentGrowth.revenue)}
            </div>
            <div className="text-sm text-gray-400">دينار عراقي</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
