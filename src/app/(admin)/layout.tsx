// src/app/(admin)/layout.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ShoppingCart,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronLeft,
  Sparkles,
  CreditCard,
  Star,
  ChevronDown,
  Search,
  Moon,
  Sun,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// SIDEBAR MENU ITEMS
// ═══════════════════════════════════════════════════════════════
const menuItems = [
  {
    title: 'الرئيسية',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'الطلبات',
    href: '/admin/orders',
    icon: ShoppingCart,
    badge: 'new',
  },
  {
    title: 'الكورسات',
    href: '/admin/courses',
    icon: BookOpen,
  },
  {
    title: 'المستخدمين',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'المدفوعات',
    href: '/admin/payments',
    icon: CreditCard,
  },
  {
    title: 'الكوبونات',
    href: '/admin/coupons',
    icon: Ticket,
  },
  {
    title: 'التقييمات',
    href: '/admin/reviews',
    icon: Star,
  },
  {
    title: 'التقارير',
    href: '/admin/reports',
    icon: BarChart3,
  },
  {
    title: 'الإعدادات',
    href: '/admin/settings',
    icon: Settings,
  },
]

// ═══════════════════════════════════════════════════════════════
// BREADCRUMB MAPPING
// ═══════════════════════════════════════════════════════════════
const breadcrumbMap: { [key: string]: string } = {
  '/admin': 'لوحة التحكم',
  '/admin/orders': 'الطلبات',
  '/admin/courses': 'الكورسات',
  '/admin/courses/new': 'إضافة كورس',
  '/admin/users': 'المستخدمين',
  '/admin/payments': 'المدفوعات',
  '/admin/coupons': 'الكوبونات',
  '/admin/reviews': 'التقييمات',
  '/admin/reports': 'التقارير',
  '/admin/settings': 'الإعدادات',
}

// ═══════════════════════════════════════════════════════════════
// ADMIN LAYOUT COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [admin, setAdmin] = useState<any>(null)
  const [notifications, setNotifications] = useState(3)

  // ─────────────────────────────────────────────────────────────
  // CHECK ADMIN AUTH
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        window.location.href = '/admin/login'
        return
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        window.location.href = '/'
        return
      }

      setAdmin(profile)
      setIsLoading(false)
    }

    // Skip check for login page
    if (pathname === '/admin/login') {
      setIsLoading(false)
      return
    }

    checkAdmin()
  }, [pathname])

  // ─────────────────────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  // ─────────────────────────────────────────────────────────────
  // GET BREADCRUMBS
  // ─────────────────────────────────────────────────────────────
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs: { label: string; href: string }[] = []
    
    let currentPath = ''
    paths.forEach((path, index) => {
      currentPath += `/${path}`
      const label = breadcrumbMap[currentPath] || path
      breadcrumbs.push({ label, href: currentPath })
    })
    
    return breadcrumbs
  }

  // Skip layout for login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex" dir="rtl">
      
      {/* ─────────────────────────────────────────────────────────────
          SIDEBAR - DESKTOP
      ───────────────────────────────────────────────────────────── */}
      <aside 
        className={`
          hidden lg:flex flex-col
          ${isCollapsed ? 'w-20' : 'w-64'}
          bg-[#111118] border-l border-white/10
          transition-all duration-300 ease-in-out
          fixed right-0 top-0 h-screen z-40
        `}
      >
        {/* Logo */}
        <div className={`
          h-16 flex items-center border-b border-white/10
          ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}
        `}>
          {!isCollapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">S7EE7 Admin</span>
            </Link>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href))
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-cyan-500/20 text-cyan-400' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : ''}`} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                            جديد
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="p-3 border-t border-white/10">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                {admin?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{admin?.full_name || 'Admin'}</p>
                <p className="text-xs text-gray-400 truncate">{admin?.email}</p>
              </div>
            </div>
          ) : null}
          
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
              text-red-400 hover:bg-red-500/10 transition-colors
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'تسجيل الخروج' : undefined}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          SIDEBAR - MOBILE
      ───────────────────────────────────────────────────────────── */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      <aside 
        className={`
          fixed right-0 top-0 h-screen w-64 z-50
          bg-[#111118] border-l border-white/10
          transform transition-transform duration-300 lg:hidden
          ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Mobile Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">S7EE7 Admin</span>
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Menu */}
        <nav className="py-4 overflow-y-auto h-[calc(100vh-4rem)]">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-cyan-500/20 text-cyan-400' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                        جديد
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
          
          {/* Mobile Logout */}
          <div className="px-3 mt-4 pt-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT
      ───────────────────────────────────────────────────────────── */}
      <main className={`
        flex-1 min-h-screen
        ${isCollapsed ? 'lg:mr-20' : 'lg:mr-64'}
        transition-all duration-300
      `}>
        {/* Header */}
        <header className="h-16 bg-[#111118]/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
          <div className="h-full flex items-center justify-between px-4 lg:px-6">
            {/* Mobile Menu Button & Breadcrumbs */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="p-2 hover:bg-white/10 rounded-lg lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Breadcrumbs */}
              <nav className="hidden sm:flex items-center gap-2 text-sm">
                {getBreadcrumbs().map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center gap-2">
                    {index > 0 && <ChevronLeft className="w-4 h-4 text-gray-500" />}
                    <Link
                      href={crumb.href}
                      className={`
                        ${index === getBreadcrumbs().length - 1 
                          ? 'text-white font-medium' 
                          : 'text-gray-400 hover:text-white'
                        }
                      `}
                    >
                      {crumb.label}
                    </Link>
                  </div>
                ))}
              </nav>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </button>
              
              {/* Notifications */}
              <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors relative">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Go to Site */}
              <Link
                href="/"
                target="_blank"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
              >
                <span>عرض الموقع</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
