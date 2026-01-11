'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  CheckCircle,
  XCircle,
  Award,
  Calendar,
  User,
  BookOpen,
  Loader2,
  Shield,
  ArrowRight,
} from 'lucide-react'

interface VerificationData {
  id: string
  certificate_number: string
  issued_at: string
  user: {
    full_name: string
  }
  course: {
    title: string
    slug: string
  }
}

export default function VerifyCertificatePage() {
  const params = useParams()
  const [certificate, setCertificate] = useState<VerificationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select(
            `
            id,
            certificate_number,
            issued_at,
            user:profiles(full_name),
            course:courses(title, slug)
          `
          )
          .eq('certificate_number', params.certificateNumber)
          .single()

        if (error) throw error

        const certData = data as unknown as VerificationData
        setCertificate(certData)
        setVerified(true)
      } catch {
        setVerified(false)
      } finally {
        setLoading(false)
      }
    }

    verifyCertificate()
  }, [params.certificateNumber, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-400">جاري التحقق من الشهادة...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#C5A572] to-[#8B7355] rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            التحقق من الشهادة
          </h1>
          <p className="text-gray-400">S7EE7 Academy</p>
        </div>

        {/* Verification Result */}
        <div
          className={`rounded-2xl border-2 p-8 ${
            verified
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          {verified && certificate ? (
            <>
              {/* Success Header */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
                <span className="text-2xl font-bold text-green-500">
                  شهادة موثقة
                </span>
              </div>

              {/* Certificate Details */}
              <div className="bg-gray-900/50 rounded-xl p-6 space-y-4">
                {/* Student Name */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#C5A572]/20 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-[#C5A572]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">اسم الطالب</p>
                    <p className="text-lg font-semibold text-white">
                      {certificate.user.full_name}
                    </p>
                  </div>
                </div>

                {/* Course Name */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#C5A572]/20 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#C5A572]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">الكورس</p>
                    <p className="text-lg font-semibold text-white">
                      {certificate.course.title}
                    </p>
                  </div>
                </div>

                {/* Certificate Number */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#C5A572]/20 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-[#C5A572]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">رقم الشهادة</p>
                    <p className="text-lg font-mono font-semibold text-white">
                      {certificate.certificate_number}
                    </p>
                  </div>
                </div>

                {/* Issue Date */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#C5A572]/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#C5A572]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">تاريخ الإصدار</p>
                    <p className="text-lg font-semibold text-white">
                      {new Date(certificate.issued_at).toLocaleDateString(
                        'ar-IQ',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* View Course Link */}
              <div className="mt-6 text-center">
                <Link
                  href={`/courses/${certificate.course.slug}`}
                  className="inline-flex items-center gap-2 text-[#C5A572] hover:text-[#D4B88A] transition"
                >
                  <span>عرض تفاصيل الكورس</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Failed Header */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
                <span className="text-2xl font-bold text-red-500">
                  شهادة غير موجودة
                </span>
              </div>

              <div className="text-center space-y-4">
                <p className="text-gray-400">
                  لم نتمكن من العثور على شهادة بهذا الرقم
                </p>
                <p className="text-sm text-gray-500">
                  رقم الشهادة: {params.certificateNumber}
                </p>
                <p className="text-gray-400 text-sm">
                  تأكد من صحة رقم الشهادة أو رابط التحقق
                </p>
              </div>
            </>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            هذه الصفحة تؤكد أصالة الشهادات الصادرة من S7EE7 Academy
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mt-4 transition"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}
