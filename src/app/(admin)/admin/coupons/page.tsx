'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Tag, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatPrice } from '@/lib/constants'
import type { Coupon } from '@/types/database'

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    setCoupons(data || [])
    setIsLoading(false)
  }

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(search.toLowerCase())
  )

  const toggleActive = async (couponId: string, currentStatus: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !currentStatus })
        .eq('id', couponId)

      if (error) throw error

      setCoupons((prev) =>
        prev.map((c) =>
          c.id === couponId ? { ...c, is_active: !currentStatus } : c
        )
      )
      toast.success(currentStatus ? 'تم تعطيل الكوبون' : 'تم تفعيل الكوبون')
    } catch (error) {
      toast.error('حدث خطأ')
    }
  }

  const deleteCoupon = async () => {
    if (!deleteId) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', deleteId)

      if (error) throw error

      setCoupons((prev) => prev.filter((c) => c.id !== deleteId))
      toast.success('تم حذف الكوبون')
    } catch (error) {
      toast.error('حدث خطأ في حذف الكوبون')
    } finally {
      setDeleteId(null)
    }
  }

  const getDiscountLabel = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`
    }
    return `${formatPrice(coupon.discount_value)} د.ع`
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">إدارة الكوبونات</h1>
          <p className="text-gray-400 mt-1">{coupons.length} كوبون</p>
        </div>
        <Link href="/admin/coupons/new">
          <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white">
            <Plus className="ml-2 h-4 w-4" />
            كوبون جديد
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="بحث بالكود..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
        />
      </div>

      {/* Coupons Table */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {filteredCoupons.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">لا توجد كوبونات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr className="text-gray-400 text-sm">
                  <th className="text-right p-4 font-medium">الكود</th>
                  <th className="text-right p-4 font-medium">الخصم</th>
                  <th className="text-right p-4 font-medium">الاستخدام</th>
                  <th className="text-right p-4 font-medium">تاريخ الانتهاء</th>
                  <th className="text-right p-4 font-medium">الحالة</th>
                  <th className="text-right p-4 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="border-t border-white/5 hover:bg-white/5"
                  >
                    <td className="p-4">
                      <code className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-lg text-sm font-mono font-bold">
                        {coupon.code}
                      </code>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                        {getDiscountLabel(coupon)}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">
                      {coupon.current_uses || 0}
                      {coupon.max_uses && ` / ${coupon.max_uses}`}
                      {!coupon.max_uses && ' / ∞'}
                    </td>
                    <td className="p-4 text-gray-400">
                      {formatDate(coupon.valid_until)}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleActive(coupon.id, coupon.is_active)}
                        className={`px-3 py-1 rounded-full text-xs border ${
                          !coupon.is_active
                            ? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            : isExpired(coupon.valid_until)
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : 'bg-green-500/20 text-green-400 border-green-500/30'
                        }`}
                      >
                        {!coupon.is_active
                          ? 'معطل'
                          : isExpired(coupon.valid_until)
                            ? 'منتهي'
                            : 'نشط'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/coupons/${coupon.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-white hover:bg-white/10"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(coupon.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-gray-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              هل أنت متأكد؟
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              سيتم حذف هذا الكوبون نهائياً. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/10 text-white hover:bg-white/20">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteCoupon}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
