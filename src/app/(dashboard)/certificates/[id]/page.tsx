'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import CertificateTemplate from '@/components/certificates/CertificateTemplate'
import { Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface CertificateData {
  id: string
  certificate_number: string
  issued_at: string
  user: {
    full_name: string
  }
  course: {
    title: string
    title_en?: string
  }
}

export default function CertificatePage() {
  const params = useParams()
  const [certificate, setCertificate] = useState<CertificateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select(
            `
            id,
            certificate_number,
            issued_at,
            user:profiles(full_name),
            course:courses(title)
          `
          )
          .eq('id', params.id)
          .single()

        if (error) throw error

        // Type assertion
        const certData = data as unknown as CertificateData
        setCertificate(certData)
      } catch (err: unknown) {
        setError('الشهادة غير موجودة')
      } finally {
        setLoading(false)
      }
    }

    fetchCertificate()
  }, [params.id, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل الشهادة...</p>
        </div>
      </div>
    )
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <Link
            href="/certificates"
            className="text-primary hover:underline flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للشهادات
          </Link>
        </div>
      </div>
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://s7ee7.com'
  const verifyUrl = `${baseUrl}/verify/${certificate.certificate_number}`

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/certificates"
            className="text-gray-400 hover:text-white flex items-center gap-2 transition"
          >
            <ArrowRight className="w-5 h-5" />
            العودة للشهادات
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white text-center mb-8">
          شهادة الإتمام
        </h1>

        <div className="flex justify-center overflow-x-auto pb-4">
          <CertificateTemplate
            studentName={certificate.user.full_name}
            courseName={certificate.course.title}
            courseNameEn={certificate.course.title_en}
            completionDate={new Date(certificate.issued_at).toLocaleDateString(
              'ar-IQ'
            )}
            certificateNumber={certificate.certificate_number}
            verifyUrl={verifyUrl}
          />
        </div>
      </div>
    </div>
  )
}
