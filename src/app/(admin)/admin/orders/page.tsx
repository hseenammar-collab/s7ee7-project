// src/app/(admin)/admin/orders/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
  Download,
  Send,
  Ticket,
  ChevronDown,
  X,
  ExternalLink,
  Copy,
  AlertCircle,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
interface Order {
  id: string
  user_id: string
  course_id: string
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  payment_method: string
  payment_proof_url?: string
  teachable_coupon?: string
  notes?: string
  created_at: string
  updated_at: string
  profiles?: {
    full_name: string
    email: string
    phone: string
  }
  courses?: {
    title: string
    slug: string
    thumbnail_url: string
    teachable_url: string
  }
}

const statusOptions = [
  { value: 'all', label: 'جميع الحالات' },
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'approved', label: 'مقبول' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'rejected', label: 'مرفوض' },
]

// ═══════════════════════════════════════════════════════════════
// ORDERS PAGE
// ═══════════════════════════════════════════════════════════════
export default function OrdersPage() {
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get('status') || 'all'

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [couponInput, setCouponInput] = useState('')

  // ─────────────────────────────────────────────────────────────
  // FETCH ORDERS
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createClient()

      let query = supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id (full_name, email, phone),
          courses:course_id (title, slug, thumbnail_url, teachable_url)
        `)
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching orders:', error)
        toast.error('خطأ في جلب الطلبات')
      } else {
        setOrders(data || [])
      }

      setIsLoading(false)
    }

    fetchOrders()
  }, [statusFilter])

  // ─────────────────────────────────────────────────────────────
  // FILTER ORDERS
  // ─────────────────────────────────────────────────────────────
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    return (
      order.profiles?.full_name?.toLowerCase().includes(searchLower) ||
      order.profiles?.email?.toLowerCase().includes(searchLower) ||
      order.courses?.title?.toLowerCase().includes(searchLower) ||
      order.id.toLowerCase().includes(searchLower)
    )
  })

  // ─────────────────────────────────────────────────────────────
  // APPROVE ORDER
  // ─────────────────────────────────────────────────────────────
  const handleApprove = async (orderId: string, coupon: string) => {
    if (!coupon.trim()) {
      toast.error('يرجى إدخال كوبون Teachable')
      return
    }

    setActionLoading(true)
    const supabase = createClient()

    try {
      // Update order
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'approved',
          teachable_coupon: coupon.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (orderError) throw orderError

      // Create enrollment
      const order = orders.find(o => o.id === orderId)
      if (order) {
        await supabase.from('enrollments').upsert({
          user_id: order.user_id,
          course_id: order.course_id,
          enrolled_at: new Date().toISOString(),
          status: 'active',
        }, {
          onConflict: 'user_id,course_id'
        })
      }

      toast.success('تم قبول الطلب بنجاح!')
      
      // Update local state
      setOrders(prev => prev.map(o => 
        o.id === orderId 
          ? { ...o, status: 'approved', teachable_coupon: coupon.trim() }
          : o
      ))
      
      setIsModalOpen(false)
      setCouponInput('')
      
    } catch (error) {
      console.error('Error approving order:', error)
      toast.error('خطأ في قبول الطلب')
    } finally {
      setActionLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // REJECT ORDER
  // ─────────────────────────────────────────────────────────────
  const handleReject = async (orderId: string, reason?: string) => {
    setActionLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'rejected',
          notes: reason || 'تم الرفض من قبل الإدارة',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (error) throw error

      toast.success('تم رفض الطلب')
      
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: 'rejected' } : o
      ))
      
      setIsModalOpen(false)
      
    } catch (error) {
      console.error('Error rejecting order:', error)
      toast.error('خطأ في رفض الطلب')
    } finally {
      setActionLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-IQ').format(amount) + ' د.ع'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: { bg: string; text: string; icon: any; label: string } } = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Clock, label: 'قيد الانتظار' },
      approved: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle, label: 'مقبول' },
      completed: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: CheckCircle, label: 'مكتمل' },
      rejected: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle, label: 'مرفوض' },
    }
    return styles[status] || styles.pending
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('تم النسخ!')
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
          <h1 className="text-2xl font-bold">إدارة الطلبات</h1>
          <p className="text-gray-400 mt-1">
            {filteredOrders.length} طلب
            {statusFilter !== 'all' && ` - ${statusOptions.find(s => s.value === statusFilter)?.label}`}
          </p>
        </div>
        
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
          <Download className="w-4 h-4" />
          <span>تصدير Excel</span>
        </button>
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
            placeholder="بحث بالاسم، الإيميل، أو الكورس..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pr-11 pl-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-4 pr-10 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#111118]">
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ORDERS TABLE
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#111118] border border-white/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>لا توجد طلبات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">العميل</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">الكورس</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">المبلغ</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">الحالة</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">التاريخ</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredOrders.map((order) => {
                  const status = getStatusBadge(order.status)
                  return (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      {/* Customer */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                            {order.profiles?.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium">{order.profiles?.full_name}</p>
                            <p className="text-sm text-gray-400">{order.profiles?.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="px-4 py-4">
                        <p className="font-medium truncate max-w-[200px]">{order.courses?.title}</p>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-4">
                        <p className="font-bold text-cyan-400">{formatCurrency(order.amount)}</p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${status.bg} ${status.text}`}>
                          <status.icon className="w-4 h-4" />
                          {status.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-sm text-gray-400">
                        {formatDate(order.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setIsModalOpen(true)
                            }}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                          
                          {order.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setIsModalOpen(true)
                                }}
                                className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                                title="قبول"
                              >
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              </button>
                              <button
                                onClick={() => handleReject(order.id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                title="رفض"
                              >
                                <XCircle className="w-4 h-4 text-red-400" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ORDER DETAILS MODAL
      ───────────────────────────────────────────────────────────── */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-[#111118] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold">تفاصيل الطلب</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-1">رقم الطلب</p>
                  <p className="font-mono text-sm">{selectedOrder.id.slice(0, 8)}...</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-1">الحالة</p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${getStatusBadge(selectedOrder.status).bg} ${getStatusBadge(selectedOrder.status).text}`}>
                    {getStatusBadge(selectedOrder.status).label}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-medium mb-3">معلومات العميل</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">الاسم:</span>
                    <span>{selectedOrder.profiles?.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">الإيميل:</span>
                    <span dir="ltr">{selectedOrder.profiles?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">الهاتف:</span>
                    <span dir="ltr">{selectedOrder.profiles?.phone}</span>
                  </div>
                </div>
              </div>

              {/* Course Info */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-medium mb-3">الكورس</h3>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-14 bg-white/10 rounded-lg overflow-hidden">
                    {selectedOrder.courses?.thumbnail_url && (
                      <img 
                        src={selectedOrder.courses.thumbnail_url} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{selectedOrder.courses?.title}</p>
                    <p className="text-2xl font-bold text-cyan-400 mt-1">
                      {formatCurrency(selectedOrder.amount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Proof */}
              {selectedOrder.payment_proof_url && (
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-medium mb-3">إثبات الدفع</h3>
                  <a
                    href={selectedOrder.payment_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>عرض الصورة</span>
                  </a>
                </div>
              )}

              {/* Teachable Coupon (if approved) */}
              {selectedOrder.teachable_coupon && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <h3 className="font-medium text-green-400 mb-3 flex items-center gap-2">
                    <Ticket className="w-5 h-5" />
                    كوبون Teachable
                  </h3>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-black/30 px-3 py-2 rounded-lg font-mono text-sm">
                      {selectedOrder.teachable_coupon}
                    </code>
                    <button
                      onClick={() => copyToClipboard(selectedOrder.teachable_coupon!)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Approve Section (if pending) */}
              {selectedOrder.status === 'pending' && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <h3 className="font-medium text-yellow-400 mb-3 flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    الموافقة وإرسال الكوبون
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        كوبون Teachable (100% خصم)
                      </label>
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="أدخل كود الكوبون..."
                        className="w-full h-11 px-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        dir="ltr"
                      />
                    </div>

                    {selectedOrder.courses?.teachable_url && (
                      <a
                        href={selectedOrder.courses.teachable_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                        فتح الكورس في Teachable
                      </a>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(selectedOrder.id, couponInput)}
                        disabled={actionLoading || !couponInput.trim()}
                        className="flex-1 h-11 bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        {actionLoading ? (
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            <span>موافقة وإرسال</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleReject(selectedOrder.id)}
                        disabled={actionLoading}
                        className="px-6 h-11 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>رفض</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
