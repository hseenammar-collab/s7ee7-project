'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Award, Download, ExternalLink, BookOpen, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Certificate, Course } from '@/types/database'

interface CertificateWithCourse extends Certificate {
  course: Course
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateWithCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchCertificates = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('certificates')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false })

      setCertificates((data || []) as CertificateWithCourse[])
      setIsLoading(false)
    }

    fetchCertificates()
  }, [supabase])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">شهاداتي</h1>
        <p className="text-gray-500">
          {certificates.length === 0
            ? 'أكمل كورساتك للحصول على شهادات'
            : `${certificates.length} شهادة محصلة`}
        </p>
      </div>

      {/* Certificates Grid */}
      {certificates.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-10 w-10 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">لم تحصل على شهادات بعد</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              أكمل أي كورس للحصول على شهادة إتمام معتمدة يمكنك تحميلها ومشاركتها
            </p>
            <Link href="/my-courses">
              <Button>
                <BookOpen className="ml-2 h-4 w-4" />
                تابع تعلمك
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => (
            <Card
              key={certificate.id}
              className="border-0 shadow-sm overflow-hidden group"
            >
              {/* Certificate Preview */}
              <div className="relative h-40 bg-gradient-to-br from-primary to-primary/80 p-6">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }} />
                </div>
                <div className="relative h-full flex flex-col items-center justify-center text-white text-center">
                  <Award className="h-12 w-12 mb-2" />
                  <p className="text-sm opacity-90">شهادة إتمام</p>
                  <p className="font-bold">S7ee7 Academy</p>
                </div>
              </div>

              {/* Certificate Info */}
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 line-clamp-2">
                  {certificate.course.title}
                </h3>

                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>تاريخ الإصدار: {formatDate(certificate.issued_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span className="font-mono text-xs">
                      #{certificate.certificate_number}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {certificate.pdf_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <a
                        href={certificate.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <Download className="ml-1 h-4 w-4" />
                        تحميل PDF
                      </a>
                    </Button>
                  )}
                  {certificate.verification_url && (
                    <Button size="sm" className="flex-1" asChild>
                      <a
                        href={certificate.verification_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="ml-1 h-4 w-4" />
                        التحقق
                      </a>
                    </Button>
                  )}
                  {!certificate.pdf_url && !certificate.verification_url && (
                    <Button size="sm" className="w-full" disabled>
                      قريباً
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
