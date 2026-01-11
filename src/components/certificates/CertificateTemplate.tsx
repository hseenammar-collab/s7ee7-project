'use client'

import React, { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Download, Share2, Award, CheckCircle } from 'lucide-react'

interface CertificateProps {
  studentName: string
  courseName: string
  courseNameEn?: string
  completionDate: string
  certificateNumber: string
  instructorName?: string
  verifyUrl: string
}

export default function CertificateTemplate({
  studentName,
  courseName,
  courseNameEn,
  completionDate,
  certificateNumber,
  instructorName = 'حسين عمار',
  verifyUrl,
}: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null)

  const downloadPDF = async () => {
    if (!certificateRef.current) return

    const canvas = await html2canvas(certificateRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`S7EE7-Certificate-${certificateNumber}.pdf`)
  }

  const shareCertificate = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `شهادة إتمام - ${courseName}`,
        text: `حصلت على شهادة إتمام كورس "${courseName}" من S7EE7 Academy`,
        url: verifyUrl,
      })
    } else {
      navigator.clipboard.writeText(verifyUrl)
      alert('تم نسخ رابط الشهادة!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Certificate Preview */}
      <div
        ref={certificateRef}
        className="relative bg-white rounded-lg shadow-2xl overflow-hidden"
        style={{
          width: '1056px',
          height: '748px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C5A572' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Border Frame */}
        <div className="absolute inset-4 border-4 border-[#C5A572] rounded-lg" />
        <div className="absolute inset-6 border-2 border-[#C5A572]/50 rounded-lg" />

        {/* Corner Decorations */}
        <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-[#C5A572]" />
        <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-[#C5A572]" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-[#C5A572]" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-[#C5A572]" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-between p-12 text-center">
          {/* Header */}
          <div className="flex items-center justify-between w-full">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-[#C5A572] to-[#8B7355] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">S7</span>
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold text-gray-800">
                  S7EE7 Academy
                </h1>
                <p className="text-sm text-gray-500">منصة التعلم الرقمي</p>
              </div>
            </div>

            {/* Certificate Badge */}
            <div className="flex items-center gap-2 bg-[#C5A572]/10 px-4 py-2 rounded-full">
              <Award className="w-5 h-5 text-[#C5A572]" />
              <span className="text-[#C5A572] font-semibold">شهادة إتمام</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="space-y-2">
              <p className="text-gray-500 text-lg">تشهد أكاديمية S7EE7 بأن</p>
              <h2 className="text-5xl font-bold text-gray-800 py-4 border-b-2 border-[#C5A572] px-8">
                {studentName}
              </h2>
            </div>

            <div className="space-y-4 max-w-2xl">
              <p className="text-gray-600 text-lg">
                قد أتم بنجاح جميع متطلبات كورس
              </p>
              <h3 className="text-3xl font-bold text-[#C5A572]">{courseName}</h3>
              {courseNameEn && (
                <p className="text-xl text-gray-500 italic">{courseNameEn}</p>
              )}
            </div>

            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full">
              <CheckCircle className="w-5 h-5" />
              <span>تم التحقق والاعتماد</span>
            </div>
          </div>

          {/* Footer */}
          <div className="w-full flex items-end justify-between">
            {/* Left: Signature */}
            <div className="text-center">
              <div className="w-32 border-b-2 border-gray-300 mb-2">
                <p className="text-2xl font-script text-gray-700 italic pb-1">
                  {instructorName}
                </p>
              </div>
              <p className="text-sm text-gray-500">المدرب المعتمد</p>
            </div>

            {/* Center: Date & Certificate Number */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-8">
                <div>
                  <p className="text-sm text-gray-400">تاريخ الإصدار</p>
                  <p className="text-lg font-semibold text-gray-700">
                    {completionDate}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">رقم الشهادة</p>
                  <p className="text-lg font-mono font-semibold text-gray-700">
                    {certificateNumber}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-400">للتحقق: {verifyUrl}</p>
            </div>

            {/* Right: QR Code */}
            <div className="text-center">
              <QRCodeSVG value={verifyUrl} size={80} level="M" includeMargin={false} />
              <p className="text-xs text-gray-400 mt-1">امسح للتحقق</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={downloadPDF}
          className="flex items-center gap-2 px-6 py-3 bg-[#C5A572] text-white rounded-xl font-semibold hover:bg-[#B39562] transition"
        >
          <Download className="w-5 h-5" />
          تحميل PDF
        </button>
        <button
          onClick={shareCertificate}
          className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition"
        >
          <Share2 className="w-5 h-5" />
          مشاركة
        </button>
      </div>
    </div>
  )
}
