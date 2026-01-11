// src/app/(admin)/admin/users/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Search,
  Users,
  Shield,
  ShieldOff,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  MoreVertical,
  ChevronDown,
  Download,
  UserCheck,
  UserX,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
interface User {
  id: string
  email: string
  full_name: string
  phone: string
  role: 'student' | 'admin'
  avatar_url?: string
  is_active: boolean
  created_at: string
  enrollments_count?: number
}

// ═══════════════════════════════════════════════════════════════
// USERS PAGE
// ═══════════════════════════════════════════════════════════════
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // ─────────────────────────────────────────────────────────────
  // FETCH USERS
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching users:', error)
        toast.error('خطأ في جلب المستخدمين')
      } else {
        setUsers(data || [])
      }

      setIsLoading(false)
    }

    fetchUsers()
  }, [])

  // ─────────────────────────────────────────────────────────────
  // FILTER USERS
  // ─────────────────────────────────────────────────────────────
  const filteredUsers = users.filter((user) => {
    const matchesSearch = !searchQuery || 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery)

    const matchesRole = roleFilter === 'all' || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  // ─────────────────────────────────────────────────────────────
  // TOGGLE USER ROLE
  // ─────────────────────────────────────────────────────────────
  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin'
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      toast.error('خطأ في تغيير الصلاحيات')
    } else {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole as 'student' | 'admin' } : u
      ))
      toast.success(newRole === 'admin' ? 'تم ترقية المستخدم لأدمن' : 'تم إزالة صلاحيات الأدمن')
    }
  }

  // ─────────────────────────────────────────────────────────────
  // TOGGLE USER STATUS
  // ─────────────────────────────────────────────────────────────
  const toggleStatus = async (userId: string, currentStatus: boolean) => {
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', userId)

    if (error) {
      toast.error('خطأ في تغيير الحالة')
    } else {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, is_active: !currentStatus } : u
      ))
      toast.success(currentStatus ? 'تم إيقاف الحساب' : 'تم تفعيل الحساب')
    }
  }

  // ─────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          PAGE HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
          <p className="text-gray-400 mt-1">{filteredUsers.length} مستخدم</p>
        </div>
        
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
          <Download className="w-4 h-4" />
          <span>تصدير</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          STATS
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المستخدمين', value: users.length, icon: Users, color: 'from-blue-500 to-blue-600' },
          { label: 'الطلاب', value: users.filter(u => u.role === 'student').length, icon: BookOpen, color: 'from-cyan-500 to-cyan-600' },
          { label: 'المدراء', value: users.filter(u => u.role === 'admin').length, icon: Shield, color: 'from-purple-500 to-purple-600' },
          { label: 'نشطين اليوم', value: Math.floor(users.length * 0.3), icon: UserCheck, color: 'from-green-500 to-green-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#111118] border border-white/10 rounded-xl p-4">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          FILTERS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="بحث بالاسم، الإيميل، أو الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pr-11 pl-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-11 px-4 pr-10 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="all" className="bg-[#111118]">جميع الصلاحيات</option>
            <option value="student" className="bg-[#111118]">الطلاب</option>
            <option value="admin" className="bg-[#111118]">المدراء</option>
          </select>
          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          USERS TABLE
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#111118] border border-white/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>لا يوجد مستخدمين</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">المستخدم</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">التواصل</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">الصلاحية</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">تاريخ التسجيل</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">الحالة</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    {/* User */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name || 'بدون اسم'}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="text-sm flex items-center gap-2 text-gray-400">
                          <Mail className="w-4 h-4" />
                          <span dir="ltr">{user.email}</span>
                        </p>
                        {user.phone && (
                          <p className="text-sm flex items-center gap-2 text-gray-400">
                            <Phone className="w-4 h-4" />
                            <span dir="ltr">{user.phone}</span>
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${
                        user.role === 'admin' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {user.role === 'admin' ? <Shield className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                        {user.role === 'admin' ? 'أدمن' : 'طالب'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(user.created_at)}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${
                        user.is_active !== false
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {user.is_active !== false ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        {user.is_active !== false ? 'نشط' : 'موقوف'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRole(user.id, user.role)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.role === 'admin'
                              ? 'hover:bg-yellow-500/20 text-yellow-400'
                              : 'hover:bg-purple-500/20 text-purple-400'
                          }`}
                          title={user.role === 'admin' ? 'إزالة صلاحيات الأدمن' : 'ترقية لأدمن'}
                        >
                          {user.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </button>
                        
                        <button
                          onClick={() => toggleStatus(user.id, user.is_active !== false)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.is_active !== false
                              ? 'hover:bg-red-500/20 text-red-400'
                              : 'hover:bg-green-500/20 text-green-400'
                          }`}
                          title={user.is_active !== false ? 'إيقاف الحساب' : 'تفعيل الحساب'}
                        >
                          {user.is_active !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
