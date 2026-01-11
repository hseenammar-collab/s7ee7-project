'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Award,
  Download,
  ExternalLink,
  BookOpen,
  Calendar,
  Share2,
  Copy,
  CheckCircle,
  Sparkles,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import type { Certificate, Course } from '@/types/database'

interface CertificateWithCourse extends Certificate {
  course: Pick<Course, 'id' | 'title' | 'slug' | 'thumbnail_url'>
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateWithCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const fetchCertificates = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('certificates')
        .select(`
          *,
          course:courses(id, title, slug, thumbnail_url)
        `)
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false })

      setCertificates((data || []) as CertificateWithCourse[])
      setIsLoading(false)
    }

    fetchCertificates()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const shareCertificate = async (certificate: CertificateWithCourse) => {
    const shareUrl = `${window.location.origin}/verify/${certificate.certificate_number}`
    const shareData = {
      title: `شهادة إتمام - ${certificate.course.title}`,
      text: `حصلت على شهادة إتمام كورس "${certificate.course.title}" من S7ee7 Academy`,
      url: shareUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      copyToClipboard(shareUrl, certificate.id)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-white/10 rounded animate-pulse" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">شهاداتي</h1>
          <p className="text-gray-400 mt-1">
            {certificates.length === 0
              ? 'أكمل كورساتك للحصول على شهادات'
              : `${certificates.length} شهادة محصلة`}
          </p>
        </div>
        {certificates.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-xl px-4 py-2">
            <Award className="h-5 w-5 text-yellow-400" />
            <span className="text-yellow-400 font-medium">{certificates.length}</span>
          </div>
        )}
      </div>

      {/* Certificates Grid */}
      {certificates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="h-12 w-12 text-yellow-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">لم تحصل على شهادات بعد</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            أكمل أي كورس للحصول على شهادة إتمام معتمدة يمكنك تحميلها ومشاركتها على LinkedIn
          </p>
          <Link href="/my-courses">
            <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white">
              <BookOpen className="ml-2 h-4 w-4" />
              تابع تعلمك
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate, index) => (
            <motion.div
              key={certificate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden group hover:border-cyan-500/30 transition-all duration-300"
            >
              {/* Certificate Preview */}
              <div className="relative h-44 bg-gradient-to-br from-cyan-600 via-cyan-500 to-teal-500 p-6 overflow-hidden">
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                  />
                </div>

                {/* Sparkle Effect */}
                <Sparkles className="absolute top-4 right-4 h-6 w-6 text-white/40" />
                <Sparkles className="absolute bottom-8 left-4 h-4 w-4 text-white/30" />

                <div className="relative h-full flex flex-col items-center justify-center text-white text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3">
                    <Award className="h-10 w-10" />
                  </div>
                  <p className="text-sm opacity-90 font-medium">شهادة إتمام</p>
                  <p className="font-bold text-lg">S7ee7 Academy</p>
                </div>

                {/* Verified Badge */}
                <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-full p-1">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </div>

              {/* Certificate Info */}
              <div className="p-5">
                <h3 className="font-bold text-white mb-4 line-clamp-2 text-lg">
                  {certificate.course.title}
                </h3>

                <div className="space-y-3 text-sm mb-5">
                  <div className="flex items-center gap-3 text-gray-400">
                    <Calendar className="h-4 w-4 text-cyan-400" />
                    <span>تاريخ الإصدار: {formatDate(certificate.issued_at)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <Award className="h-4 w-4 text-cyan-400" />
                    <code className="text-xs bg-white/5 px-2 py-1 rounded font-mono">
                      {certificate.certificate_number}
                    </code>
                    <button
                      onClick={() => copyToClipboard(certificate.certificate_number, certificate.id)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      {copiedId === certificate.id ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-500 hover:text-white" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {certificate.pdf_url ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                      asChild
                    >
                      <a
                        href={certificate.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <Download className="ml-1 h-4 w-4" />
                        تحميل
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-white/20 text-gray-500"
                      disabled
                    >
                      <Download className="ml-1 h-4 w-4" />
                      قريباً
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
                    onClick={() => shareCertificate(certificate)}
                  >
                    <Share2 className="ml-1 h-4 w-4" />
                    مشاركة
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info Section */}
      {certificates.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/20 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Award className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-1">شهاداتك معتمدة</h4>
              <p className="text-gray-400 text-sm">
                يمكن التحقق من صحة شهاداتك عبر رقم الشهادة الفريد. شارك شهاداتك على LinkedIn
                لإظهار إنجازاتك لأصحاب العمل المحتملين.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
