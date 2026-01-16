// src/app/(admin)/admin/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  Users, 
  BookOpen, 
  CreditCard, 
  TrendingUp,
  Settings,
  LogOut,
  Loader2,
  LayoutDashboard,
  Ticket,
  FileText,
  Star
} from 'lucide-react'

interface Stats {
  totalUsers: number
  totalCourses: number
  totalOrders: number
  totalRevenue: number
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCourses: 0,
    totalOrders: 0,
    totalRevenue: 0
  })

  useEffect(() => {
    const checkAdminAndLoadStats = async () => {
      const supabase = createClient()
      
      // Check auth
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        window.location.href = '/admin/login'
        return
      }

      // Check admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        window.location.href = '/'
        return
      }

      setIsAdmin(true)

      // Load stats
      try {
        const [usersRes, coursesRes, ordersRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('courses').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('id, total_amount', { count: 'exact' })
        ])

        const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

        setStats({
          totalUsers: usersRes.count || 0,
          totalCourses: coursesRes.count || 0,
          totalOrders: ordersRes.count || 0,
          totalRevenue
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      }

      setIsLoading(false)
    }

    checkAdminAndLoadStats()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const menuItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'الرئيسية', active: true },
    { href: '/admin/users', icon: Users, label: 'المستخدمين' },
    { href: '/admin/courses', icon: BookOpen, label: 'الكورسات' },
    { href: '/admin/orders', icon: CreditCard, label: 'الطلبات' },
    { href: '/admin/payments', icon: CreditCard, label: 'المدفوعات' },
    { href: '/admin/coupons', icon: Ticket, label: 'الكوبونات' },
    { href: '/admin/reviews', icon: Star, label: 'التقييمات' },
    { href: '/admin/reports', icon: FileText, label: 'التقارير' },
  ]

  const statCards = [
    { label: 'المستخدمين', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'الكورسات', value: stats.totalCourses, icon: BookOpen, color: 'from-green-500 to-green-600' },
    { label: 'الطلبات', value: stats.totalOrders, icon: CreditCard, color: 'from-purple-500 to-purple-600' },
    { label: 'الإيرادات', value: `${stats.totalRevenue.toLocaleString()} د.ع`, icon: TrendingUp, color: 'from-orange-500 to-orange-600' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f]" dir="rtl">
      {/* Sidebar */}
      <aside className="fixed right-0 top-0 h-full w-64 bg-[#111] border-l border-white/10 p-4">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white">S7EE7</h1>
            <p className="text-xs text-gray-500">لوحة التحكم</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                item.active 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 right-4 left-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="mr-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">مرحباً بك في لوحة التحكم</h1>
          <p className="text-gray-400">إدارة منصة S7EE7 التعليمية</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">إجراءات سريعة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/courses"
              className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <BookOpen className="w-8 h-8 text-green-400" />
              <span className="text-sm text-gray-300">إضافة كورس</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-sm text-gray-300">إدارة المستخدمين</span>
            </Link>
            <Link
              href="/admin/orders"
              className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <CreditCard className="w-8 h-8 text-purple-400" />
              <span className="text-sm text-gray-300">الطلبات الجديدة</span>
            </Link>
            <Link
              href="/admin/coupons"
              className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Ticket className="w-8 h-8 text-orange-400" />
              <span className="text-sm text-gray-300">إضافة كوبون</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}