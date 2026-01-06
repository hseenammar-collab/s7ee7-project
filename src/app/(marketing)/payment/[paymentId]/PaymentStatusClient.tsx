'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  Clock,
  CheckCircle2,
  XCircle,
  BookOpen,
  CreditCard,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Payment {
  id: string
  amount_iqd: number
  payment_method: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  failure_reason?: string | null
  created_at: string
  courses: {
    id: string
    title: string
    thumbnail_url: string | null
    price_iqd: number
    slug: string
  }
}

interface Props {
  payment: Payment
}

const paymentMethodNames: Record<string, string> = {
  zaincash: 'زين كاش',
  asiahawala: 'آسيا حوالة',
  fib: 'مصرف الشرق الأوسط (FIB)',
  qicard: 'كي كارد',
  card: 'بطاقة ائتمانية',
}

const statusConfig = {
  pending: {
    icon: Clock,
    title: 'طلبك قيد المراجعة',
    message: 'سيتم مراجعة طلبك وتفعيل الكورس خلال ساعات قليلة',
    bgColor: 'from-yellow-500/20 to-orange-500/20',
    iconColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/30',
    glowColor: 'shadow-yellow-500/20',
  },
  processing: {
    icon: Clock,
    title: 'جاري معالجة الدفع',
    message: 'يتم الآن معالجة عملية الدفع الخاصة بك',
    bgColor: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    glowColor: 'shadow-blue-500/20',
  },
  completed: {
    icon: CheckCircle2,
    title: 'تم تفعيل الكورس بنجاح!',
    message: 'مبروك! يمكنك الآن البدء في مشاهدة الكورس',
    bgColor: 'from-green-500/20 to-emerald-500/20',
    iconColor: 'text-green-400',
    borderColor: 'border-green-500/30',
    glowColor: 'shadow-green-500/20',
  },
  failed: {
    icon: XCircle,
    title: 'فشلت عملية الدفع',
    message: 'للأسف فشلت عملية الدفع. يمكنك المحاولة مرة أخرى',
    bgColor: 'from-red-500/20 to-pink-500/20',
    iconColor: 'text-red-400',
    borderColor: 'border-red-500/30',
    glowColor: 'shadow-red-500/20',
  },
  refunded: {
    icon: XCircle,
    title: 'تم استرداد المبلغ',
    message: 'تم استرداد المبلغ المدفوع بنجاح',
    bgColor: 'from-orange-500/20 to-amber-500/20',
    iconColor: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    glowColor: 'shadow-orange-500/20',
  },
  cancelled: {
    icon: XCircle,
    title: 'تم إلغاء الطلب',
    message: 'تم إلغاء طلب الدفع',
    bgColor: 'from-gray-500/20 to-slate-500/20',
    iconColor: 'text-gray-400',
    borderColor: 'border-gray-500/30',
    glowColor: 'shadow-gray-500/20',
  },
}

export default function PaymentStatusClient({ payment }: Props) {
  const config = statusConfig[payment.status]
  const StatusIcon = config.icon

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg"
      >
        {/* Main Card */}
        <div
          className={`relative bg-gradient-to-br ${config.bgColor} backdrop-blur-xl rounded-3xl border ${config.borderColor} p-8 shadow-2xl ${config.glowColor}`}
        >
          {/* Status Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div
              className={`w-24 h-24 rounded-full bg-gray-900/50 flex items-center justify-center ${config.iconColor}`}
            >
              <StatusIcon className="w-12 h-12" />
            </div>
          </motion.div>

          {/* Status Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white text-center mb-2"
          >
            {config.title}
          </motion.h1>

          {/* Status Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300 text-center mb-6"
          >
            {config.message}
          </motion.p>

          {/* Failure Reason */}
          {payment.status === 'failed' && payment.failure_reason && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6"
            >
              <p className="text-red-300 text-sm text-center">
                <strong>سبب الفشل:</strong> {payment.failure_reason}
              </p>
            </motion.div>
          )}

          {/* Course Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900/50 rounded-2xl p-4 mb-6"
          >
            <div className="flex gap-4">
              {/* Course Thumbnail */}
              <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={payment.courses.thumbnail_url || '/placeholder-course.jpg'}
                  alt={payment.courses.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Course Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm line-clamp-2">
                  {payment.courses.title}
                </h3>
              </div>
            </div>
          </motion.div>

          {/* Payment Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3 mb-6"
          >
            {/* Amount */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                المبلغ المدفوع
              </span>
              <span className="text-white font-semibold">
                {payment.amount_iqd.toLocaleString()} IQD
              </span>
            </div>

            {/* Payment Method */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                طريقة الدفع
              </span>
              <span className="text-white">
                {paymentMethodNames[payment.payment_method] || payment.payment_method}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">تاريخ الطلب</span>
              <span className="text-white">
                {new Date(payment.created_at).toLocaleDateString('ar-IQ', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-3"
          >
            {payment.status === 'completed' && (
              <Link href={`/courses/${payment.courses.slug}/learn`} className="block">
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-6 rounded-xl">
                  <Sparkles className="w-5 h-5 ml-2" />
                  ابدأ الكورس الآن
                </Button>
              </Link>
            )}

            {(payment.status === 'failed' || payment.status === 'cancelled') && (
              <Link href={`/courses/${payment.courses.slug}/checkout`} className="block">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-6 rounded-xl">
                  <RefreshCw className="w-5 h-5 ml-2" />
                  حاول مرة أخرى
                </Button>
              </Link>
            )}

            {(payment.status === 'pending' || payment.status === 'processing') && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-yellow-400 text-sm">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  جاري المراجعة...
                </div>
              </div>
            )}

            <Link href="/courses" className="block">
              <Button
                variant="ghost"
                className="w-full text-gray-400 hover:text-white hover:bg-gray-800/50 py-6 rounded-xl"
              >
                <ArrowRight className="w-5 h-5 ml-2" />
                العودة للكورسات
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Order ID */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-gray-500 text-xs mt-4"
        >
          رقم الطلب: {payment.id.slice(0, 8).toUpperCase()}
        </motion.p>
      </motion.div>
    </div>
  )
}
