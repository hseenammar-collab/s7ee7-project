'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  BookOpen,
  Copy,
  Check,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Clock,
  Shield,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { paymentMethods, getPaymentMethod } from '@/lib/payment-methods'
import type { Course, Profile } from '@/types/database'

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const supabase = createClient()

  // States
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Checkout flow states
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push(`/login?redirect=/courses/${slug}/checkout`)
        return
      }
      setUser(user)

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      // Fetch course
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

      if (!courseData) {
        router.push('/courses')
        return
      }

      // Check if already enrolled
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseData.id)
        .single()

      if (enrollment) {
        toast.info('أنت مسجل بالفعل في هذا الكورس')
        router.push(`/my-courses/${courseData.id}`)
        return
      }

      setCourse(courseData)
      setIsLoading(false)
    }

    fetchData()
  }, [slug, router, supabase])

  const selectedPaymentMethod = selectedMethod ? getPaymentMethod(selectedMethod) : null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-IQ').format(price)
  }

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('تم النسخ!')
    setTimeout(() => setCopiedField(null), 2000)
  }

  // File handling
  const handleFileSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت')
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار صورة فقط')
      return
    }
    setReceiptFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setReceiptPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const removeReceipt = () => {
    setReceiptFile(null)
    setReceiptPreview(null)
  }

  // Submit payment
  const handleSubmit = async () => {
    if (!user || !course || !selectedMethod || !receiptFile) {
      toast.error('يرجى إكمال جميع الخطوات')
      return
    }

    setIsSubmitting(true)

    try {
      // Upload receipt to Supabase Storage
      const fileExt = receiptFile.name.split('.').pop()
      const fileName = `${user.id}/${course.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, receiptFile)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error('فشل رفع الإيصال')
      }

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName)

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          course_id: course.id,
          amount_iqd: course.discount_price_iqd || course.price_iqd,
          original_amount_iqd: course.price_iqd,
          discount_amount_iqd: course.discount_price_iqd ? course.price_iqd - course.discount_price_iqd : 0,
          payment_method: selectedMethod,
          receipt_url: publicUrl,
          status: 'pending',
        })
        .select()
        .single()

      if (paymentError) {
        console.error('Payment error:', paymentError)
        throw new Error('فشل إنشاء طلب الدفع')
      }

      toast.success('تم إرسال طلب الدفع بنجاح!')
      router.push(`/payment/${payment.id}`)
    } catch (error: any) {
      console.error('Checkout error:', error)
      toast.error(error.message || 'حدث خطأ، حاول مرة أخرى')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!course) return null

  const finalPrice = course.discount_price_iqd || course.price_iqd

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/courses" className="hover:text-white transition-colors">الكورسات</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/courses/${slug}`} className="hover:text-white transition-colors">{course.title}</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">الدفع</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">إتمام الشراء</h1>
          <p className="text-gray-400">أكمل الخطوات التالية لتفعيل الكورس</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= s
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-500'
              }`}>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              <span className={`hidden sm:block text-sm ${step >= s ? 'text-white' : 'text-gray-500'}`}>
                {s === 1 ? 'طريقة الدفع' : s === 2 ? 'التحويل' : 'رفع الإيصال'}
              </span>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-purple-500' : 'bg-gray-800'}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Payment Method Selection */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
                >
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-purple-400" />
                    اختر طريقة الدفع
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {paymentMethods.filter(m => m.isEnabled).map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`relative p-5 rounded-xl border-2 transition-all text-right ${
                          selectedMethod === method.id
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                        }`}
                      >
                        {selectedMethod === method.id && (
                          <div className="absolute top-3 left-3">
                            <CheckCircle2 className="h-5 w-5 text-purple-400" />
                          </div>
                        )}
                        <div className="text-3xl mb-3">{method.icon}</div>
                        <div className="text-white font-semibold">{method.nameAr}</div>
                        <div className="text-gray-400 text-sm">{method.name}</div>
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    disabled={!selectedMethod}
                    className="w-full mt-6 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50"
                  >
                    التالي
                    <ChevronRight className="w-5 h-5 mr-2 rotate-180" />
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Transfer Details */}
              {step === 2 && selectedPaymentMethod && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
                >
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="text-2xl">{selectedPaymentMethod.icon}</span>
                    تفاصيل التحويل - {selectedPaymentMethod.nameAr}
                  </h2>

                  {/* Account Details */}
                  <div className="space-y-4 mb-6">
                    {/* Account Number */}
                    <div className={`${selectedPaymentMethod.bgColor} rounded-xl p-4`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">رقم المحفظة / الحساب</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(selectedPaymentMethod.accountNumber, 'account')}
                          className="text-purple-400 hover:text-purple-300 h-8"
                        >
                          {copiedField === 'account' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          <span className="mr-1 text-xs">نسخ</span>
                        </Button>
                      </div>
                      <div className="text-2xl font-mono text-white tracking-wider" dir="ltr">
                        {selectedPaymentMethod.accountNumber}
                      </div>
                    </div>

                    {/* Account Name */}
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <div className="text-gray-400 text-sm mb-1">اسم المستلم</div>
                      <div className="text-white font-semibold">{selectedPaymentMethod.accountName}</div>
                    </div>

                    {/* Amount */}
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">المبلغ المطلوب</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(finalPrice.toString(), 'amount')}
                          className="text-purple-400 hover:text-purple-300 h-8"
                        >
                          {copiedField === 'amount' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          <span className="mr-1 text-xs">نسخ</span>
                        </Button>
                      </div>
                      <div className="text-2xl font-bold text-purple-400">
                        {formatPrice(finalPrice)} د.ع
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-yellow-400 font-semibold mb-2">خطوات التحويل:</h4>
                        <ol className="text-yellow-200/80 text-sm space-y-1">
                          {selectedPaymentMethod.instructions.map((instruction, index) => (
                            <li key={index} className="flex gap-2">
                              <span className="text-yellow-400">{index + 1}.</span>
                              {instruction}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 h-12 border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      السابق
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                    >
                      قمت بالتحويل
                      <Check className="w-5 h-5 mr-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Upload Receipt */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
                >
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Upload className="w-6 h-6 text-purple-400" />
                    رفع صورة الإيصال
                  </h2>

                  {receiptPreview ? (
                    <div className="relative mb-6">
                      <div className="relative rounded-xl overflow-hidden bg-gray-800">
                        <Image
                          src={receiptPreview}
                          alt="Receipt preview"
                          width={400}
                          height={300}
                          className="mx-auto max-h-[300px] object-contain"
                        />
                      </div>
                      <button
                        onClick={removeReceipt}
                        className="absolute top-3 left-3 p-2 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                      <div className="mt-3 text-center">
                        <span className="text-green-400 text-sm flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          تم تحميل الصورة بنجاح
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer mb-6 ${
                        isDragging
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <label htmlFor="receipt-upload" className="cursor-pointer">
                        <Upload className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-white font-medium mb-2">
                          اسحب الصورة هنا أو اضغط للاختيار
                        </p>
                        <p className="text-gray-500 text-sm">
                          PNG, JPG (حد أقصى 5MB)
                        </p>
                      </label>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1 h-12 border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      السابق
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!receiptFile || isSubmitting}
                      className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin ml-2" />
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          تأكيد الدفع وإرسال الطلب
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg font-bold text-white mb-4">ملخص الطلب</h3>

              {/* Course Info */}
              <div className="flex gap-4 mb-6">
                {course.thumbnail_url ? (
                  <Image
                    src={course.thumbnail_url}
                    alt={course.title}
                    width={80}
                    height={60}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-14 bg-gray-800 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-gray-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white text-sm line-clamp-2">{course.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <Clock className="h-3 w-3" />
                    <span>{course.lessons_count} درس</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-t border-gray-800 pt-4 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">السعر الأصلي</span>
                  <span className={course.discount_price_iqd ? 'text-gray-500 line-through' : 'text-white'}>
                    {formatPrice(course.price_iqd)} د.ع
                  </span>
                </div>
                {course.discount_price_iqd && course.discount_price_iqd < course.price_iqd && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">الخصم</span>
                    <span className="text-green-400">
                      -{formatPrice(course.price_iqd - course.discount_price_iqd)} د.ع
                    </span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center text-lg font-bold border-t border-gray-800 pt-4 mb-6">
                <span className="text-white">الإجمالي</span>
                <span className="text-purple-400">{formatPrice(finalPrice)} د.ع</span>
              </div>

              {/* Features */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  وصول مدى الحياة
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  شهادة إتمام
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Shield className="h-4 w-4 text-green-500" />
                  ضمان استرداد المال
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
