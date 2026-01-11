// src/lib/enrollment.ts
// نظام إدارة التسجيل في الكورسات

import { createClient } from '@/lib/supabase/client'
import type { Enrollment, LessonProgress, Course } from '@/types/database'

interface EnrollmentWithCourse extends Enrollment {
  course: Course
}

// ===================================
// التحقق من التسجيل
// ===================================

/**
 * التحقق من تسجيل المستخدم في كورس معين
 */
export async function checkEnrollment(userId: string, courseId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  return {
    enrolled: !!data,
    enrollment: data as Enrollment | null,
    error,
  }
}

/**
 * التحقق من تسجيل المستخدم الحالي
 */
export async function checkCurrentUserEnrollment(courseId: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { enrolled: false, enrollment: null, user: null }
  }

  const result = await checkEnrollment(user.id, courseId)
  return { ...result, user }
}

// ===================================
// الحصول على الكورسات
// ===================================

/**
 * الحصول على جميع كورسات المستخدم
 */
export async function getUserCourses(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('enrollments')
    .select(
      `
      *,
      course:courses(*)
    `
    )
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false })

  return {
    courses: (data || []) as EnrollmentWithCourse[],
    error,
  }
}

/**
 * الحصول على الكورسات قيد التقدم
 */
export async function getInProgressCourses(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('enrollments')
    .select(
      `
      *,
      course:courses(*)
    `
    )
    .eq('user_id', userId)
    .gt('progress_percentage', 0)
    .lt('progress_percentage', 100)
    .order('last_watched_at', { ascending: false })

  return {
    courses: (data || []) as EnrollmentWithCourse[],
    error,
  }
}

/**
 * الحصول على الكورسات المكتملة
 */
export async function getCompletedCourses(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('enrollments')
    .select(
      `
      *,
      course:courses(*)
    `
    )
    .eq('user_id', userId)
    .gte('progress_percentage', 100)
    .order('completed_at', { ascending: false })

  return {
    courses: (data || []) as EnrollmentWithCourse[],
    error,
  }
}

// ===================================
// تتبع التقدم
// ===================================

/**
 * الحصول على تقدم جميع دروس كورس معين
 */
export async function getCourseProgress(userId: string, courseId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)

  return {
    progress: (data || []) as LessonProgress[],
    error,
  }
}

/**
 * الحصول على تقدم درس معين
 */
export async function getLessonProgress(userId: string, lessonId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single()

  return {
    progress: data as LessonProgress | null,
    error,
  }
}

/**
 * تحديث تقدم درس
 */
export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  courseId: string,
  watchedSeconds: number,
  totalSeconds: number,
  isCompleted: boolean
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        course_id: courseId,
        watched_seconds: watchedSeconds,
        total_seconds: totalSeconds,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
        last_watched_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,lesson_id',
      }
    )
    .select()
    .single()

  // تحديث نسبة تقدم الكورس الكلية
  if (!error) {
    await updateCourseProgress(userId, courseId)
  }

  return { data, error }
}

/**
 * تحديث نسبة تقدم الكورس الكلية
 */
export async function updateCourseProgress(userId: string, courseId: string) {
  const supabase = createClient()

  // الحصول على عدد الدروس الكلي
  const { data: allLessons } = await supabase
    .from('lessons')
    .select('id')
    .eq('course_id', courseId)
    .eq('is_published', true)

  // الحصول على الدروس المكتملة
  const { data: completedLessons } = await supabase
    .from('lesson_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('is_completed', true)

  const totalLessons = allLessons?.length || 1
  const completedCount = completedLessons?.length || 0
  const progressPercentage = Math.round((completedCount / totalLessons) * 100)

  // تحديث نسبة التقدم
  const { error } = await supabase
    .from('enrollments')
    .update({
      progress_percentage: progressPercentage,
      completed_at: progressPercentage >= 100 ? new Date().toISOString() : null,
    })
    .eq('user_id', userId)
    .eq('course_id', courseId)

  return { progressPercentage, error }
}

// ===================================
// التسجيل في الكورسات
// ===================================

/**
 * تسجيل مستخدم في كورس (بعد الدفع)
 */
export async function enrollUser(
  userId: string,
  courseId: string,
  paymentId: string
) {
  const supabase = createClient()

  // التحقق من عدم وجود تسجيل مسبق
  const { enrolled } = await checkEnrollment(userId, courseId)
  if (enrolled) {
    return { enrollment: null, error: 'المستخدم مسجل بالفعل في هذا الكورس' }
  }

  const { data, error } = await supabase
    .from('enrollments')
    .insert({
      user_id: userId,
      course_id: courseId,
      payment_id: paymentId,
      progress_percentage: 0,
    })
    .select()
    .single()

  // زيادة عدد الطلاب في الكورس
  if (!error) {
    await supabase.rpc('increment_students_count', { course_id: courseId })
  }

  return { enrollment: data as Enrollment, error }
}

/**
 * تسجيل مجاني في كورس
 */
export async function enrollFree(userId: string, courseId: string) {
  const supabase = createClient()

  // التحقق من أن الكورس مجاني
  const { data: course } = await supabase
    .from('courses')
    .select('price_iqd')
    .eq('id', courseId)
    .single()

  if (course?.price_iqd > 0) {
    return { enrollment: null, error: 'هذا الكورس ليس مجانياً' }
  }

  // التحقق من عدم وجود تسجيل مسبق
  const { enrolled } = await checkEnrollment(userId, courseId)
  if (enrolled) {
    return { enrollment: null, error: 'أنت مسجل بالفعل في هذا الكورس' }
  }

  const { data, error } = await supabase
    .from('enrollments')
    .insert({
      user_id: userId,
      course_id: courseId,
      progress_percentage: 0,
    })
    .select()
    .single()

  return { enrollment: data as Enrollment, error }
}

// ===================================
// إحصائيات المستخدم
// ===================================

/**
 * الحصول على إحصائيات تعلم المستخدم
 */
export async function getUserLearningStats(userId: string) {
  const supabase = createClient()

  // عدد الكورسات المسجل فيها
  const { count: totalEnrollments } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // عدد الكورسات المكتملة
  const { count: completedCourses } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('progress_percentage', 100)

  // عدد الدروس المكتملة
  const { count: completedLessons } = await supabase
    .from('lesson_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_completed', true)

  // عدد الشهادات
  const { count: certificates } = await supabase
    .from('certificates')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // إجمالي وقت المشاهدة
  const { data: watchTime } = await supabase
    .from('lesson_progress')
    .select('watched_seconds')
    .eq('user_id', userId)

  const totalWatchedSeconds =
    watchTime?.reduce((sum, item) => sum + (item.watched_seconds || 0), 0) || 0
  const totalWatchedHours = Math.round(totalWatchedSeconds / 3600)

  return {
    totalEnrollments: totalEnrollments || 0,
    completedCourses: completedCourses || 0,
    inProgressCourses: (totalEnrollments || 0) - (completedCourses || 0),
    completedLessons: completedLessons || 0,
    certificates: certificates || 0,
    totalWatchedHours,
  }
}
