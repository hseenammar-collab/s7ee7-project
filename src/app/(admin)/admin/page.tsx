'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  Users,
  ShoppingCart,
  BookOpen,
  ArrowUpRight,
  Eye,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import StatsCard from '@/components/admin/StatsCard'
import { formatPrice } from '@/lib/constants'
import type { Payment, Profile, Course } from '@/types/database'

interface PaymentWithDetails extends Payment {
  user: Pick<Profile, 'full_name' | 'avatar_url'>
  course: Pick<Course, 'title'>
}

interface Stats {
  totalRevenue: number
  totalStudents: number
  totalOrders: number
  totalCourses: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalStudents: 0,
    totalOrders: 0,
    totalCourses: 0,
  })
  const [recentPayments, setRecentPayments] = useState<PaymentWithDetails[]>([])
  const [recentUsers, setRecentUsers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      // Fetch stats
      const [
        { data: payments },
        { count: studentsCount },
        { count: ordersCount },
        { count: coursesCount },
      ] = await Promise.all([
        supabase
          .from('payments')
          .select('amount_iqd')
          .eq('status', 'completed'),
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student'),
        supabase
          .from('payments')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('courses')
          .select('*', { count: 'exact', head: true }),
      ])

      const totalRevenue = payments?.reduce((sum, p) => sum + p.amount_iqd, 0) || 0

      setStats({
        totalRevenue,
        totalStudents: studentsCount || 0,
        totalOrders: ordersCount || 0,
        totalCourses: coursesCount || 0,
      })

      // Fetch recent payments
      const { data: recentPaymentsData } = await supabase
        .from('payments')
        .select(`
          *,
          user:profiles(full_name, avatar_url),
          course:courses(title)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentPayments((recentPaymentsData || []) as PaymentWithDetails[])

      // Fetch recent users
      const { data: recentUsersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentUsers(recentUsersData || [])
      setIsLoading(false)
    }

    fetchData()
  }, [supabase])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      failed: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
    }
    const labels: Record<string, string> = {
      completed: 'مكتمل',
      pending: 'معلق',
      processing: 'قيد المعالجة',
      failed: 'فشل',
      cancelled: 'ملغي',
    }
    return (
      <Badge className={styles[status] || styles.pending}>
        {labels[status] || status}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-IQ', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-gray-500">نظرة عامة على أداء المنصة</p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="إجمالي الإيرادات"
          value={`${formatPrice(stats.totalRevenue)} د.ع`}
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="الطلاب"
          value={stats.totalStudents}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="الطلبات"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="yellow"
        />
        <StatsCard
          title="الكورسات"
          value={stats.totalCourses}
          icon={BookOpen}
          color="purple"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">آخر الطلبات</CardTitle>
            <Link href="/admin/payments">
              <Button variant="ghost" size="sm">
                عرض الكل
                <ArrowUpRight className="mr-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا توجد طلبات</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>الكورس</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.user?.full_name || 'غير معروف'}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {payment.course?.title || '-'}
                      </TableCell>
                      <TableCell>{formatPrice(payment.amount_iqd)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">آخر المستخدمين</CardTitle>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm">
                عرض الكل
                <ArrowUpRight className="mr-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا يوجد مستخدمين</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead>التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.full_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.role === 'admin'
                            ? 'أدمن'
                            : user.role === 'instructor'
                            ? 'مدرب'
                            : 'طالب'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {formatDate(user.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
