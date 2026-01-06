'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PaymentStatusClient from './PaymentStatusClient'
import { Loader2 } from 'lucide-react'

interface PaymentWithCourse {
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

export default function PaymentStatusPage() {
  const params = useParams()
  const router = useRouter()
  const paymentId = params.paymentId as string
  const supabase = createClient()

  const [payment, setPayment] = useState<PaymentWithCourse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        // Check if user is logged in
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        console.log('=== Payment Page Auth Debug ===')
        console.log('Payment ID:', paymentId)
        console.log('User:', user?.id || 'NO USER')
        console.log('User Error:', userError)
        console.log('===============================')

        if (!user) {
          console.log('No user found, redirecting to login...')
          router.push(`/login?redirect=/payment/${paymentId}`)
          return
        }

        // Fetch payment with course details
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .select(`
            *,
            courses:course_id (
              id,
              title,
              thumbnail_url,
              price_iqd,
              slug
            )
          `)
          .eq('id', paymentId)
          .eq('user_id', user.id)
          .single()

        console.log('=== Payment Data Debug ===')
        console.log('Payment:', paymentData)
        console.log('Error:', paymentError)
        console.log('==========================')

        if (paymentError || !paymentData) {
          console.log('Payment not found or error, redirecting...')
          setError('لم يتم العثور على طلب الدفع')
          setTimeout(() => router.push('/courses'), 2000)
          return
        }

        setPayment(paymentData as PaymentWithCourse)
      } catch (err) {
        console.error('Error fetching payment:', err)
        setError('حدث خطأ في تحميل البيانات')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayment()
  }, [paymentId, router, supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل حالة الدفع...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <p className="text-gray-500 text-sm">جاري التحويل...</p>
        </div>
      </div>
    )
  }

  if (!payment) {
    return null
  }

  return <PaymentStatusClient payment={payment} />
}
