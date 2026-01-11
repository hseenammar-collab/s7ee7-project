'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Copy,
  Check,
  Upload,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  X,
  Loader2,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { paymentMethods, getEnabledPaymentMethods } from '@/lib/payment-methods'
import CouponInput from '@/components/checkout/CouponInput'
import type { Course, Payment } from '@/types/database'

interface CouponData {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  description?: string
}

interface Props {
  course: Course
  userId: string
  pendingPayment: Payment | null
}

export default function CheckoutClient({
  course,
  userId,
  pendingPayment,
}: Props) {
  const router = useRouter()
  const supabase = createClient()
  const enabledMethods = getEnabledPaymentMethods()

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentSubmitted, setPaymentSubmitted] = useState(false)
  const [submittedPaymentId, setSubmittedPaymentId] = useState<string | null>(null)
  const [step, setStep] = useState<'select' | 'details' | 'upload'>(
    pendingPayment ? 'upload' : 'select'
  )

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null)
  const [finalPrice, setFinalPrice] = useState(course.discount_price_iqd || course.price_iqd)
  const originalPrice = course.discount_price_iqd || course.price_iqd

  const handleCouponApply = (coupon: CouponData | null, newPrice: number) => {
    setAppliedCoupon(coupon)
    setFinalPrice(newPrice)
  }

  const calculateDiscountAmount = () => {
    if (!appliedCoupon) return 0
    if (appliedCoupon.discount_type === 'percentage') {
      return Math.round(originalPrice * (appliedCoupon.discount_value / 100))
    }
    return Math.min(appliedCoupon.discount_value, originalPrice)
  }

  const selectedPaymentMethod = paymentMethods.find(
    (m) => m.id === selectedMethod
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-IQ').format(price)
  }

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('تم النسخ!')
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت')
        return
      }
      setReceiptFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmitPayment = async () => {
    if (!receiptFile && !pendingPayment) {
      toast.error('يرجى رفع صورة الإيصال')
      return
    }

    if (!selectedMethod && !pendingPayment) {
      toast.error('يرجى اختيار طريقة الدفع')
      return
    }

    setIsSubmitting(true)

    try {
      let receiptUrl = pendingPayment?.receipt_url || ''
      let finalPaymentId: string | null = pendingPayment?.id || null

      // Upload receipt if new file
      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop()
        const fileName = `${userId}/${course.id}/${Date.now()}.${fileExt}`

        const { error: uploadError, data } = await supabase.storage
          .from('receipts')
          .upload(fileName, receiptFile)

        if (uploadError) {
          throw new Error('فشل رفع الإيصال')
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('receipts').getPublicUrl(fileName)
        receiptUrl = publicUrl
      }

      if (pendingPayment) {
        // Update existing payment
        const { error } = await supabase
          .from('payments')
          .update({
            receipt_url: receiptUrl,
          })
          .eq('id', pendingPayment.id)

        if (error) throw error
      } else {
        // Create new payment with coupon info
        const discountAmount = calculateDiscountAmount()
        const { error, data: newPayment } = await supabase.from('payments').insert({
          user_id: userId,
          course_id: course.id,
          amount_iqd: finalPrice,
          original_amount_iqd: originalPrice,
          discount_amount_iqd: discountAmount,
          coupon_id: appliedCoupon?.id || null,
          payment_method: selectedMethod,
          receipt_url: receiptUrl,
          status: 'pending',
          metadata: {
            coupon_code: appliedCoupon?.code || null,
          },
        }).select().single()

        if (error) throw error

        finalPaymentId = newPayment?.id || null
        setSubmittedPaymentId(finalPaymentId)
      }

      toast.success('تم إرسال طلب الدفع بنجاح!')

      // Redirect to payment status page
      if (finalPaymentId) {
        router.push(`/payment/${finalPaymentId}`)
      } else {
        setPaymentSubmitted(true)
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('حدث خطأ أثناء إرسال الطلب')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show success message after payment submission
  if (paymentSubmitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">
                تم إرسال طلب الدفع بنجاح!
              </h1>
              <p className="text-gray-400">
                سيتم مراجعة طلبك وتفعيل الكورس خلال 24 ساعة
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-4">
                {course.thumbnail_url && (
                  <Image
                    src={course.thumbnail_url}
                    alt={course.title}
                    width={80}
                    height={60}
                    className="rounded-lg object-cover"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-white">{course.title}</h3>
                  <p className="text-purple-400 font-bold">
                    {formatPrice(course.price_iqd)} د.ع
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {submittedPaymentId && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">رقم العملية</span>
                  <span className="text-white font-mono">
                    {submittedPaymentId.slice(0, 8)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">طريقة الدفع</span>
                <span className="text-white">
                  {paymentMethods.find((m) => m.id === selectedMethod)?.nameAr}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">الحالة</span>
                <span className="text-yellow-400 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  قيد المراجعة
                </span>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-200/80">
                  سيتم إرسال إشعار لك عبر البريد الإلكتروني عند الموافقة على طلبك
                  وتفعيل الكورس.
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                onClick={() => router.push('/courses')}
              >
                تصفح كورسات أخرى
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 border-white/20 text-white hover:bg-white/10"
                onClick={() => router.push('/')}
              >
                العودة للرئيسية
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Show pending payment status
  if (pendingPayment && step === 'upload') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-10 w-10 text-yellow-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                طلب دفع قيد المراجعة
              </h1>
              <p className="text-gray-400">
                لديك طلب دفع سابق بانتظار الموافقة لهذا الكورس
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-4">
                {course.thumbnail_url && (
                  <Image
                    src={course.thumbnail_url}
                    alt={course.title}
                    width={80}
                    height={60}
                    className="rounded-lg object-cover"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-white">{course.title}</h3>
                  <p className="text-purple-400 font-bold">
                    {formatPrice(course.price_iqd)} د.ع
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">رقم العملية</span>
                <span className="text-white font-mono">
                  {pendingPayment.id.slice(0, 8)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">طريقة الدفع</span>
                <span className="text-white">
                  {
                    paymentMethods.find(
                      (m) => m.id === pendingPayment.payment_method
                    )?.nameAr
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">الحالة</span>
                <span className="text-yellow-400 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  قيد المراجعة
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <p className="text-sm text-gray-400 text-center">
                سيتم إشعارك عند الموافقة على الدفع
              </p>
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
                onClick={() => router.push('/dashboard')}
              >
                العودة للوحة التحكم
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-24 pb-16">
      {/* Background Glow */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-purple-600 rounded-full filter blur-[200px] opacity-10 pointer-events-none" />

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            إتمام الشراء
          </h1>
          <p className="text-gray-400">اختر طريقة الدفع المناسبة لك</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Payment Methods */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Coupon Section */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Tag className="h-6 w-6 text-cyan-400" />
                هل لديك كود خصم؟
              </h2>
              <CouponInput
                courseId={course.id}
                userId={userId}
                originalPrice={originalPrice}
                onApplyCoupon={handleCouponApply}
              />
            </div>

            {/* Step 1: Select Payment Method */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-sm">
                  1
                </span>
                اختر طريقة الدفع
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {paymentMethods.map((method) => (
                  <motion.button
                    key={method.id}
                    whileHover={{ scale: method.isEnabled ? 1.02 : 1 }}
                    whileTap={{ scale: method.isEnabled ? 0.98 : 1 }}
                    onClick={() =>
                      method.isEnabled && setSelectedMethod(method.id)
                    }
                    disabled={!method.isEnabled}
                    className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                      selectedMethod === method.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : method.isEnabled
                          ? 'border-white/10 bg-white/5 hover:border-white/20'
                          : 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {selectedMethod === method.id && (
                      <div className="absolute top-2 left-2">
                        <CheckCircle2 className="h-5 w-5 text-purple-500" />
                      </div>
                    )}
                    <div className="text-3xl mb-2">{method.icon}</div>
                    <div className="text-white font-medium text-sm">
                      {method.nameAr}
                    </div>
                    {!method.isEnabled && (
                      <div className="text-xs text-gray-500 mt-1">
                        غير متاح حالياً
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Step 2: Payment Details */}
            <AnimatePresence>
              {selectedPaymentMethod && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                >
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm">
                      2
                    </span>
                    تفاصيل الدفع
                  </h2>

                  <div className="space-y-4">
                    {/* Account Number */}
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">
                          رقم الحساب
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              selectedPaymentMethod.accountNumber,
                              'account'
                            )
                          }
                          className="text-purple-400 hover:text-purple-300"
                        >
                          {copiedField === 'account' ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          <span className="mr-1">نسخ</span>
                        </Button>
                      </div>
                      <div className="text-2xl font-mono text-white tracking-wider" dir="ltr">
                        {selectedPaymentMethod.accountNumber}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">
                          المبلغ المطلوب
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              finalPrice.toString(),
                              'amount'
                            )
                          }
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          {copiedField === 'amount' ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          <span className="mr-1">نسخ</span>
                        </Button>
                      </div>
                      <div className="text-2xl font-bold text-cyan-400">
                        {formatPrice(finalPrice)} د.ع
                      </div>
                      {appliedCoupon && (
                        <p className="text-sm text-green-400 mt-1">
                          بعد خصم الكوبون
                        </p>
                      )}
                    </div>

                    {/* Instructions */}
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                      <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-200/80">
                          {selectedPaymentMethod.instructions}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: Upload Receipt */}
            <AnimatePresence>
              {selectedPaymentMethod && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                >
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm">
                      3
                    </span>
                    رفع صورة الإيصال
                  </h2>

                  <div className="space-y-4">
                    {receiptPreview ? (
                      <div className="relative">
                        <Image
                          src={receiptPreview}
                          alt="Receipt preview"
                          width={400}
                          height={300}
                          className="rounded-xl mx-auto max-h-[300px] object-contain"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 left-2 bg-black/50 hover:bg-black/70"
                          onClick={() => {
                            setReceiptFile(null)
                            setReceiptPreview(null)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Label
                        htmlFor="receipt"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-purple-500/50 transition-colors"
                      >
                        <Upload className="h-10 w-10 text-gray-400 mb-3" />
                        <span className="text-gray-400">
                          اضغط لرفع صورة الإيصال
                        </span>
                        <span className="text-gray-500 text-sm mt-1">
                          PNG, JPG (حد أقصى 5MB)
                        </span>
                        <Input
                          id="receipt"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </Label>
                    )}

                    <Button
                      onClick={handleSubmitPayment}
                      disabled={!receiptFile || isSubmitting}
                      className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin ml-2" />
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          إرسال طلب الدفع
                          <ArrowRight className="h-5 w-5 mr-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right: Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg font-bold text-white mb-4">ملخص الطلب</h3>

              {/* Course Info */}
              <div className="flex gap-4 mb-6">
                {course.thumbnail_url ? (
                  <Image
                    src={course.thumbnail_url}
                    alt={course.title}
                    width={100}
                    height={75}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-[100px] h-[75px] bg-white/10 rounded-lg" />
                )}
                <div>
                  <h4 className="font-semibold text-white text-sm line-clamp-2">
                    {course.title}
                  </h4>
                  <p className="text-gray-400 text-sm mt-1">
                    {(course as any).instructor_name || 'المدرب'}
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">سعر الكورس</span>
                  <span className="text-white">
                    {formatPrice(course.price_iqd)} د.ع
                  </span>
                </div>
                {course.discount_price_iqd &&
                  course.discount_price_iqd < course.price_iqd && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">خصم الكورس</span>
                      <span className="text-green-400">
                        -{formatPrice(course.price_iqd - course.discount_price_iqd)} د.ع
                      </span>
                    </div>
                  )}
                {appliedCoupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      كوبون ({appliedCoupon.code})
                    </span>
                    <span className="text-green-400">
                      -{formatPrice(calculateDiscountAmount())} د.ع
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-3">
                  <span className="text-white">المجموع</span>
                  <span className="text-cyan-400">
                    {formatPrice(finalPrice)} د.ع
                  </span>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-green-400 text-center">
                    وفرت {formatPrice(originalPrice - finalPrice)} د.ع!
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  وصول مدى الحياة
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  شهادة إتمام
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  دعم فني مستمر
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
