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
  LogOut,
  Loader2,
  LayoutDashboard,
  Ticket,
  FileText,
  Star,
  Settings
} from 'lucide-react'

export default function AdminDashboard() {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'redirecting'>('loading')
  const [stats, setStats] = useState({ users: 0, courses: 0, orders: 0, revenue: 0 })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        
        // Get session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
          setStatus('redirecting')
          window.location.replace('/admin/login')
          return
        }

        // Check admin role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (error || profile?.role !== 'admin') {
          setStatus('redirecting')
          await supabase.auth.signOut()
          window.location.replace('/admin/login')
          return
        }

        // Load stats
        const [usersRes, coursesRes, ordersRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('courses').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('total_amount')
        ])

        const revenue = ordersRes.data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0

        setStats({
          users: usersRes.count || 0,
          courses: coursesRes.count || 0,
          orders: ordersRes.data?.length || 0,
          revenue
        })

        setStatus('authorized')
      } catch (error) {
        console.error('Auth error:', error)
        setStatus('redirecting')
        window.location.replace('/admin/login')
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.replace('/admin/login')
  }

  // Show loading while checking auth
  if (status === 'loading' || status === 'redirecting') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">
            {status === 'loading' ? 'جاري التحقق...' : 'جاري التحويل...'}
          </p>
        </div>
      </div>
    )
  }

  const menu = [
    { href: '/admin', icon: LayoutDashboard, label: 'الرئيسية', active: true },
    { href: '/admin/users', icon: Users, label: 'المستخدمين' },
    { href: '/admin/courses', icon: BookOpen, label: 'الكورسات' },
    { href: '/admin/orders', icon: CreditCard, label: 'الطلبات' },
    { href: '/admin/coupons', icon: Ticket, label: 'الكوبونات' },
    { href: '/admin/reviews', icon: Star, label: 'التقييمات' },
    { href: '/admin/reports', icon: FileText, label: 'التقارير' },
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
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                item.active ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-4 right-4 left-4 flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
      </aside>

      {/* Main */}
      <main className="mr-64 p-8">
        <h1 className="text-2xl font-bold text-white mb-2">مرحباً بك في لوحة التحكم</h1>
        <p className="text-gray-400 mb-8">إدارة منصة S7EE7 التعليمية</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <Users className="w-8 h-8 text-blue-400 mb-4" />
            <p className="text-2xl font-bold text-white">{stats.users}</p>
            <p className="text-gray-400 text-sm">المستخدمين</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <BookOpen className="w-8 h-8 text-green-400 mb-4" />
            <p className="text-2xl font-bold text-white">{stats.courses}</p>
            <p className="text-gray-400 text-sm">الكورسات</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <CreditCard className="w-8 h-8 text-purple-400 mb-4" />
            <p className="text-2xl font-bold text-white">{stats.orders}</p>
            <p className="text-gray-400 text-sm">الطلبات</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <TrendingUp className="w-8 h-8 text-orange-400 mb-4" />
            <p className="text-2xl font-bold text-white">{stats.revenue.toLocaleString()} د.ع</p>
            <p className="text-gray-400 text-sm">الإيرادات</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">إجراءات سريعة</h2>
          <div className="grid grid-cols-4 gap-4">
            <Link href="/admin/courses" className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-lg hover:bg-white/10">
              <BookOpen className="w-8 h-8 text-green-400" />
              <span className="text-sm text-gray-300">إضافة كورس</span>
            </Link>
            <Link href="/admin/users" className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-lg hover:bg-white/10">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-sm text-gray-300">إدارة المستخدمين</span>
            </Link>
            <Link href="/admin/orders" className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-lg hover:bg-white/10">
              <CreditCard className="w-8 h-8 text-purple-400" />
              <span className="text-sm text-gray-300">الطلبات الجديدة</span>
            </Link>
            <Link href="/admin/coupons" className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-lg hover:bg-white/10">
              <Ticket className="w-8 h-8 text-orange-400" />
              <span className="text-sm text-gray-300">إضافة كوبون</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}