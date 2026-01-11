'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Enrollment, Course } from '@/types/database'

interface EnrollmentData extends Enrollment {
  course?: Course
}

interface UseEnrollmentReturn {
  enrolled: boolean
  loading: boolean
  enrollment: EnrollmentData | null
  progress: number
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook للتحقق من تسجيل المستخدم في كورس
 */
export function useEnrollment(courseId: string): UseEnrollmentReturn {
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const checkEnrollment = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setEnrolled(false)
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('enrollments')
        .select(
          `
          *,
          course:courses(*)
        `
        )
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        setError(fetchError.message)
      }

      setEnrolled(!!data)
      setEnrollment(data as EnrollmentData)
      setProgress(data?.progress_percentage || 0)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [courseId, supabase])

  useEffect(() => {
    checkEnrollment()
  }, [checkEnrollment])

  return {
    enrolled,
    loading,
    enrollment,
    progress,
    error,
    refetch: checkEnrollment,
  }
}

/**
 * Hook للحصول على جميع كورسات المستخدم
 */
export function useUserCourses() {
  const [courses, setCourses] = useState<EnrollmentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setCourses([])
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('enrollments')
        .select(
          `
          *,
          course:courses(*)
        `
        )
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
      }

      setCourses((data || []) as EnrollmentData[])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  return { courses, loading, error, refetch: fetchCourses }
}

/**
 * Hook للحصول على تقدم الدروس في كورس
 */
export function useCourseProgress(courseId: string) {
  const [lessonsProgress, setLessonsProgress] = useState<Record<string, number>>({})
  const [completedLessons, setCompletedLessons] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)

      const progressMap: Record<string, number> = {}
      const completed: string[] = []

      data?.forEach((item) => {
        progressMap[item.lesson_id] = item.watched_seconds || 0
        if (item.is_completed) {
          completed.push(item.lesson_id)
        }
      })

      setLessonsProgress(progressMap)
      setCompletedLessons(completed)
    } finally {
      setLoading(false)
    }
  }, [courseId, supabase])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  return {
    lessonsProgress,
    completedLessons,
    loading,
    refetch: fetchProgress,
    isLessonCompleted: (lessonId: string) => completedLessons.includes(lessonId),
    getLessonProgress: (lessonId: string) => lessonsProgress[lessonId] || 0,
  }
}

/**
 * Hook لإحصائيات التعلم
 */
export function useLearningStats() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    completedLessons: 0,
    certificates: 0,
    totalHours: 0,
  })
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        // Enrollments
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('progress_percentage')
          .eq('user_id', user.id)

        const total = enrollments?.length || 0
        const completed =
          enrollments?.filter((e) => e.progress_percentage >= 100).length || 0
        const inProgress = total - completed

        // Completed lessons
        const { count: lessonsCount } = await supabase
          .from('lesson_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_completed', true)

        // Certificates
        const { count: certsCount } = await supabase
          .from('certificates')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        // Watch time
        const { data: watchData } = await supabase
          .from('lesson_progress')
          .select('watched_seconds')
          .eq('user_id', user.id)

        const totalSeconds =
          watchData?.reduce((sum, item) => sum + (item.watched_seconds || 0), 0) ||
          0
        const totalHours = Math.round(totalSeconds / 3600)

        setStats({
          totalCourses: total,
          completedCourses: completed,
          inProgressCourses: inProgress,
          completedLessons: lessonsCount || 0,
          certificates: certsCount || 0,
          totalHours,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  return { stats, loading }
}
