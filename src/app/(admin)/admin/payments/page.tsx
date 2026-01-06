'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Search,
  CreditCard,
  Check,
  X,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { paymentMethods } from '@/lib/payment-methods'

interface PaymentWithDetails {
  id: string
  user_id: string
  course_id: string
  amount_iqd: number
  payment_method: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  receipt_url: string | null
  failure_reason: string | null
  created_at: string
  profiles: {
    id: string
    full_name: string
  } | null
  courses: {
    id: string
    title: string
    price_iqd: number
    thumbnail_url: string | null
  } | null
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchPayments()
  }, [statusFilter])

  const fetchPayments = async () => {
    setIsLoading(true)

    try {
      let query = supabase
        .from('payments')
        .select(`
          id,
          user_id,
          course_id,
          amount_iqd,
          payment_method,
          status,
          receipt_url,
          failure_reason,
          created_at,
          profiles:user_id (
            id,
            full_name
          ),
          courses:course_id (
            id,
            title,
            price_iqd,
            thumbnail_url
          )
        `)
        .order('created_at', { ascending: false })

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      console.log('=== Admin Payments Debug ===')
      console.log('Payments fetched:', data)
      console.log('Payments count:', data?.length)
      console.log('Error:', error)
      console.log('============================')

      if (error) {
        console.error('Error fetching payments:', error)
        toast.error('خطأ في جلب البيانات')
        return
      }

      if (data) {
        setPayments(data as unknown as PaymentWithDetails[])
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPayments = payments.filter((payment) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      payment.profiles?.full_name?.toLowerCase().includes(searchLower) ||
      payment.courses?.title?.toLowerCase().includes(searchLower) ||
      payment.id.toLowerCase().includes(searchLower)
    )
  })

  const handleApprove = async (payment: PaymentWithDetails) => {
    setProcessingId(payment.id)
    try {
      // Update payment status to completed
      const { error: paymentError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', payment.id)

      if (paymentError) {
        console.error('Payment update error:', paymentError)
        throw paymentError
      }

      // Create enrollment
      const { error: enrollError } = await supabase.from('enrollments').insert({
        user_id: payment.user_id,
        course_id: payment.course_id,
        payment_id: payment.id,
      })

      if (enrollError && !enrollError.message.includes('duplicate')) {
        console.error('Enrollment error:', enrollError)
        throw enrollError
      }

      // Update course students count
      const { error: rpcError } = await supabase.rpc('increment_students_count', {
        course_id: payment.course_id,
      })

      if (rpcError) {
        console.log('RPC error (may not exist):', rpcError)
        // Try direct update if RPC doesn't exist
        await supabase
          .from('courses')
          .update({ students_count: (payment.courses?.price_iqd || 0) + 1 })
          .eq('id', payment.course_id)
      }

      toast.success('تم قبول الدفعة وتفعيل الكورس للطالب')
      fetchPayments()
      setSelectedPayment(null)
    } catch (error: any) {
      console.error('Error approving payment:', error)
      toast.error('حدث خطأ أثناء قبول الدفعة: ' + (error.message || ''))
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (payment: PaymentWithDetails, reason?: string) => {
    setProcessingId(payment.id)
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'failed',
          failure_reason: reason || 'تم الرفض من قبل الإدارة',
        })
        .eq('id', payment.id)

      if (error) throw error

      toast.success('تم رفض الدفعة')
      fetchPayments()
      setSelectedPayment(null)
      setRejectReason('')
    } catch (error: any) {
      console.error('Error rejecting payment:', error)
      toast.error('حدث خطأ أثناء رفض الدفعة')
    } finally {
      setProcessingId(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-IQ').format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30">
            <Clock className="h-3 w-3 ml-1" />
            قيد المراجعة
          </Badge>
        )
      case 'processing':
        return (
          <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">
            <Loader2 className="h-3 w-3 ml-1 animate-spin" />
            جاري المعالجة
          </Badge>
        )
      case 'completed':
        return (
          <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
            <CheckCircle2 className="h-3 w-3 ml-1" />
            مكتمل
          </Badge>
        )
      case 'failed':
        return (
          <Badge className="bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30">
            <XCircle className="h-3 w-3 ml-1" />
            فاشل
          </Badge>
        )
      case 'refunded':
        return (
          <Badge className="bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30">
            <RefreshCw className="h-3 w-3 ml-1" />
            مسترد
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30">
            <X className="h-3 w-3 ml-1" />
            ملغي
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMethodName = (methodId: string) => {
    const method = paymentMethods.find((m) => m.id === methodId)
    return method?.nameAr || methodId
  }

  // Stats
  const stats = {
    total: payments.length,
    pending: payments.filter((p) => p.status === 'pending').length,
    completed: payments.filter((p) => p.status === 'completed').length,
    failed: payments.filter((p) => p.status === 'failed').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الدفعات</h1>
          <p className="text-gray-500">مراجعة وإدارة طلبات الدفع</p>
        </div>
        <Button onClick={fetchPayments} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
          <div className="text-sm text-gray-500">إجمالي الدفعات</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-yellow-50 dark:bg-yellow-500/10 rounded-xl p-4 border border-yellow-200 dark:border-yellow-500/20"
        >
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
          <div className="text-sm text-yellow-600/70 dark:text-yellow-400/70">قيد المراجعة</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-green-50 dark:bg-green-500/10 rounded-xl p-4 border border-green-200 dark:border-green-500/20"
        >
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
          <div className="text-sm text-green-600/70 dark:text-green-400/70">مكتملة</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-red-50 dark:bg-red-500/10 rounded-xl p-4 border border-red-200 dark:border-red-500/20"
        >
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.failed}</div>
          <div className="text-sm text-red-600/70 dark:text-red-400/70">فاشلة</div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="بحث بالاسم أو الكورس..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              <SelectItem value="pending">قيد المراجعة</SelectItem>
              <SelectItem value="completed">مكتملة</SelectItem>
              <SelectItem value="failed">فاشلة</SelectItem>
              <SelectItem value="cancelled">ملغية</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-500" />
            <p className="text-gray-500 mt-2">جاري التحميل...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">لا توجد دفعات</p>
            <p className="text-gray-400 text-sm mt-1">تحقق من الفلاتر أو أضف دفعات جديدة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900">
                  <TableHead className="text-right">المستخدم</TableHead>
                  <TableHead className="text-right">الكورس</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">الطريقة</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإيصال</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {payment.profiles?.full_name || 'غير معروف'}
                        </p>
                        <p className="text-xs text-gray-500">{payment.user_id.slice(0, 8)}...</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      <p className="truncate text-gray-700 dark:text-gray-300">
                        {payment.courses?.title || 'غير معروف'}
                      </p>
                    </TableCell>
                    <TableCell className="font-semibold text-purple-600 dark:text-purple-400">
                      {formatPrice(payment.amount_iqd)} د.ع
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="whitespace-nowrap">
                        {getMethodName(payment.payment_method)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      {payment.receipt_url ? (
                        <a
                          href={payment.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">لا يوجد</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm whitespace-nowrap">
                      {formatDate(payment.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedPayment(payment)}
                          title="عرض التفاصيل"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {payment.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-500/10"
                              onClick={() => handleApprove(payment)}
                              disabled={processingId === payment.id}
                              title="قبول"
                            >
                              {processingId === payment.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
                              onClick={() => handleReject(payment)}
                              disabled={processingId === payment.id}
                              title="رفض"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Payment Details Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل الدفعة</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              {/* Receipt Image */}
              {selectedPayment.receipt_url ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">صورة الإيصال</label>
                  <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                    <Image
                      src={selectedPayment.receipt_url}
                      alt="Receipt"
                      width={600}
                      height={400}
                      className="w-full max-h-[400px] object-contain"
                    />
                    <a
                      href={selectedPayment.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 left-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 text-center">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">لم يتم رفع إيصال</p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">المستخدم</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedPayment.profiles?.full_name || 'غير معروف'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">الكورس</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedPayment.courses?.title || 'غير معروف'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">المبلغ</p>
                  <p className="font-medium text-purple-600 dark:text-purple-400">
                    {formatPrice(selectedPayment.amount_iqd)} د.ع
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">طريقة الدفع</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getMethodName(selectedPayment.payment_method)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">الحالة</p>
                  {getStatusBadge(selectedPayment.status)}
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">تاريخ الطلب</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(selectedPayment.created_at)}
                  </p>
                </div>
                <div className="col-span-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">رقم العملية</p>
                  <p className="font-mono text-xs text-gray-700 dark:text-gray-300 break-all">
                    {selectedPayment.id}
                  </p>
                </div>
              </div>

              {/* Failure Reason */}
              {selectedPayment.status === 'failed' && selectedPayment.failure_reason && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-4">
                  <p className="text-red-700 dark:text-red-400 text-sm">
                    <strong>سبب الرفض:</strong> {selectedPayment.failure_reason}
                  </p>
                </div>
              )}

              {/* Actions */}
              {selectedPayment.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleApprove(selectedPayment)}
                    disabled={processingId === selectedPayment.id}
                  >
                    {processingId === selectedPayment.id ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    ) : (
                      <Check className="h-4 w-4 ml-2" />
                    )}
                    قبول وتفعيل الكورس
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReject(selectedPayment, rejectReason)}
                    disabled={processingId === selectedPayment.id}
                  >
                    <X className="h-4 w-4 ml-2" />
                    رفض
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
