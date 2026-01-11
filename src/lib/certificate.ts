// src/lib/certificate.ts
// نظام إدارة الشهادات

import { createClient } from '@/lib/supabase/client'
import type { Certificate, Course } from '@/types/database'

interface CertificateWithCourse extends Certificate {
  course: Pick<Course, 'id' | 'title' | 'slug' | 'thumbnail_url'>
}

/**
 * إنشاء رقم شهادة فريد
 */
export function generateCertificateNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `S7EE7-${year}${month}-${random}`
}

/**
 * إنشاء شهادة جديدة
 */
export async function generateCertificate(
  userId: string,
  courseId: string
): Promise<{ certificate: Certificate | null; error: string | null }> {
  const supabase = createClient()

  // التحقق من إكمال الكورس
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('progress_percentage, completed_at')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  if (!enrollment) {
    return { certificate: null, error: 'أنت غير مسجل في هذا الكورس' }
  }

  if (enrollment.progress_percentage < 100) {
    return {
      certificate: null,
      error: `يجب إكمال الكورس أولاً (التقدم الحالي: ${enrollment.progress_percentage}%)`,
    }
  }

  // التحقق من وجود شهادة مسبقة
  const { data: existingCert } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  if (existingCert) {
    return { certificate: existingCert as Certificate, error: null }
  }

  // إنشاء شهادة جديدة
  const certificateNumber = generateCertificateNumber()

  const { data: newCert, error } = await supabase
    .from('certificates')
    .insert({
      user_id: userId,
      course_id: courseId,
      certificate_number: certificateNumber,
      issued_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Certificate generation error:', error)
    return { certificate: null, error: 'فشل إنشاء الشهادة' }
  }

  return { certificate: newCert as Certificate, error: null }
}

/**
 * الحصول على شهادة معينة
 */
export async function getCertificate(
  userId: string,
  courseId: string
): Promise<{ certificate: CertificateWithCourse | null; error: string | null }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('certificates')
    .select(
      `
      *,
      course:courses(id, title, slug, thumbnail_url)
    `
    )
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  if (error && error.code !== 'PGRST116') {
    return { certificate: null, error: error.message }
  }

  return { certificate: data as CertificateWithCourse, error: null }
}

/**
 * الحصول على جميع شهادات المستخدم
 */
export async function getUserCertificates(
  userId: string
): Promise<{ certificates: CertificateWithCourse[]; error: string | null }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('certificates')
    .select(
      `
      *,
      course:courses(id, title, slug, thumbnail_url)
    `
    )
    .eq('user_id', userId)
    .order('issued_at', { ascending: false })

  if (error) {
    return { certificates: [], error: error.message }
  }

  return { certificates: (data || []) as CertificateWithCourse[], error: null }
}

/**
 * التحقق من صحة شهادة برقمها
 */
export async function verifyCertificate(certificateNumber: string): Promise<{
  valid: boolean
  certificate: (CertificateWithCourse & { user: { full_name: string } }) | null
  error: string | null
}> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('certificates')
    .select(
      `
      *,
      course:courses(id, title, slug, thumbnail_url),
      user:profiles(full_name)
    `
    )
    .eq('certificate_number', certificateNumber)
    .single()

  if (error || !data) {
    return {
      valid: false,
      certificate: null,
      error: 'الشهادة غير موجودة أو رقم غير صحيح',
    }
  }

  return {
    valid: true,
    certificate: data as any,
    error: null,
  }
}

/**
 * حذف شهادة (للأدمن فقط)
 */
export async function deleteCertificate(
  certificateId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient()

  const { error } = await supabase
    .from('certificates')
    .delete()
    .eq('id', certificateId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

/**
 * تحديث رابط PDF للشهادة
 */
export async function updateCertificatePdf(
  certificateId: string,
  pdfUrl: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient()

  const { error } = await supabase
    .from('certificates')
    .update({ pdf_url: pdfUrl })
    .eq('id', certificateId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

/**
 * إصدار شهادة (اسم بديل لـ generateCertificate)
 */
export const issueCertificate = generateCertificate

/**
 * الحصول على رابط التحقق من الشهادة
 */
export function getCertificateVerifyUrl(certificateNumber: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://s7ee7.com'
  return `${baseUrl}/verify/${certificateNumber}`
}

/**
 * الحصول على رابط عرض الشهادة
 */
export function getCertificateViewUrl(certificateId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://s7ee7.com'
  return `${baseUrl}/certificates/${certificateId}`
}
