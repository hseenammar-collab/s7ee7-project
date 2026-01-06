'use client'

import { useState, useEffect } from 'react'
import { Search, Users, MoreVertical, Shield, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Profile } from '@/types/database'

interface UserWithStats extends Profile {
  enrollments_count?: number
}

interface AdminConfirmModal {
  isOpen: boolean
  user: UserWithStats | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [adminModal, setAdminModal] = useState<AdminConfirmModal>({
    isOpen: false,
    user: null,
  })
  const [isChangingRole, setIsChangingRole] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [roleFilter])

  const fetchUsers = async () => {
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (roleFilter && roleFilter !== 'all') {
      query = query.eq('role', roleFilter)
    }

    const { data } = await query
    setUsers(data || [])
    setIsLoading(false)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (user.phone && user.phone.includes(search))
  )

  const changeRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
      )
      toast.success('تم تحديث الدور بنجاح')
    } catch (error) {
      toast.error('حدث خطأ')
    }
  }

  const openAdminConfirmModal = (user: UserWithStats) => {
    setAdminModal({ isOpen: true, user })
  }

  const confirmMakeAdmin = async () => {
    if (!adminModal.user) return

    setIsChangingRole(true)
    try {
      await changeRole(adminModal.user.id, 'admin')
      setAdminModal({ isOpen: false, user: null })
    } finally {
      setIsChangingRole(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-red-100 text-red-700',
      instructor: 'bg-blue-100 text-blue-700',
      student: 'bg-gray-100 text-gray-700',
    }
    const labels: Record<string, string> = {
      admin: 'أدمن',
      instructor: 'مدرب',
      student: 'طالب',
    }
    return (
      <Badge className={styles[role] || styles.student}>
        {labels[role] || role}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
        <p className="text-gray-500">{users.length} مستخدم</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="بحث بالاسم أو الهاتف..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="student">طالب</SelectItem>
                <SelectItem value="instructor">مدرب</SelectItem>
                <SelectItem value="admin">أدمن</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">لا يوجد مستخدمين</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead>تاريخ التسجيل</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url || ''} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          {user.is_verified && (
                            <Badge variant="outline" className="text-xs">
                              موثق
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell dir="ltr" className="text-right">
                      {user.phone || '-'}
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-gray-500">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => changeRole(user.id, 'student')}
                            disabled={user.role === 'student'}
                          >
                            تعيين كطالب
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => changeRole(user.id, 'instructor')}
                            disabled={user.role === 'instructor'}
                          >
                            تعيين كمدرب
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openAdminConfirmModal(user)}
                            disabled={user.role === 'admin'}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Shield className="h-4 w-4 ml-2" />
                            تعيين كأدمن
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Admin Confirmation Modal */}
      <Dialog open={adminModal.isOpen} onOpenChange={(open) => !open && setAdminModal({ isOpen: false, user: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              تأكيد صلاحيات الأدمن
            </DialogTitle>
            <DialogDescription className="text-right pt-4 space-y-3">
              <p>
                هل أنت متأكد من منح صلاحيات الأدمن للمستخدم{' '}
                <span className="font-semibold text-foreground">
                  {adminModal.user?.full_name}
                </span>
                ؟
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm">
                <p className="font-medium mb-1">⚠️ تحذير:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>سيتمكن من الوصول الكامل للوحة التحكم</li>
                  <li>سيتمكن من إدارة جميع المستخدمين والكورسات</li>
                  <li>سيتمكن من تعديل صلاحيات المستخدمين الآخرين</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setAdminModal({ isOpen: false, user: null })}
              disabled={isChangingRole}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={confirmMakeAdmin}
              disabled={isChangingRole}
              className="bg-red-600 hover:bg-red-700"
            >
              {isChangingRole ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                  جاري التحديث...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 ml-2" />
                  تأكيد التعيين كأدمن
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
