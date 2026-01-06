import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

// Types
export interface CourseWithDetails {
  id: string
  title: string
  slug: string
  description: string | null
  short_description: string | null
  thumbnail_url: string | null
  preview_video_url: string | null
  price_iqd: number
  discount_price_iqd: number | null
  category: string | null
  level: 'beginner' | 'intermediate' | 'advanced'
  language: string
  duration_minutes: number
  lessons_count: number
  students_count: number
  average_rating: number
  is_published: boolean
  is_featured: boolean
  requirements: string[]
  what_you_learn: string[]
  created_at: string
  updated_at: string
  instructor: {
    id: string
    full_name: string
    avatar_url: string | null
    bio: string | null
  } | null
}

export interface CourseWithSections extends CourseWithDetails {
  sections: {
    id: string
    title: string
    description: string | null
    sort_order: number
    lessons: {
      id: string
      title: string
      description: string | null
      duration_seconds: number
      sort_order: number
      is_free: boolean
      is_published: boolean
    }[]
  }[]
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  courses_count: number
}

// Cached query: Get all published courses with instructor
export const getCourses = cache(async () => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles!instructor_id(id, full_name, avatar_url, bio)
    `)
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching courses:', error)
    return []
  }

  return data as CourseWithDetails[]
})

// Cached query: Get courses by category
export const getCoursesByCategory = cache(async (category: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles!instructor_id(id, full_name, avatar_url, bio)
    `)
    .eq('is_published', true)
    .eq('category', category)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching courses by category:', error)
    return []
  }

  return data as CourseWithDetails[]
})

// Cached query: Get featured courses
export const getFeaturedCourses = cache(async (limit: number = 4) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles!instructor_id(id, full_name, avatar_url, bio)
    `)
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching featured courses:', error)
    return []
  }

  return data as CourseWithDetails[]
})

// Cached query: Get single course with sections and lessons
export const getCourseBySlug = cache(async (slug: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles!instructor_id(id, full_name, avatar_url, bio),
      sections(
        id, title, description, sort_order,
        lessons(id, title, description, duration_seconds, sort_order, is_free, is_published)
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !data) {
    console.error('Error fetching course:', error)
    return null
  }

  // Sort sections and lessons by sort_order
  const courseData = data as any
  if (courseData.sections) {
    courseData.sections.sort((a: any, b: any) => a.sort_order - b.sort_order)
    courseData.sections.forEach((section: any) => {
      if (section.lessons) {
        section.lessons.sort((a: any, b: any) => a.sort_order - b.sort_order)
      }
    })
  }

  return courseData as CourseWithSections
})

// Get categories with course counts
export const getCategories = cache(async () => {
  const supabase = await createClient()

  // Get unique categories from courses
  const { data: courses, error } = await supabase
    .from('courses')
    .select('category')
    .eq('is_published', true)
    .not('category', 'is', null)

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  // Count courses per category
  const categoryCounts: Record<string, number> = {}
  const coursesData = courses as { category: string | null }[] | null
  coursesData?.forEach((course) => {
    if (course.category) {
      categoryCounts[course.category] = (categoryCounts[course.category] || 0) + 1
    }
  })

  // Map to category objects
  const categoryLabels: Record<string, { name: string; icon: string }> = {
    cybersecurity: { name: 'الأمن السيبراني', icon: '🛡️' },
    marketing: { name: 'التسويق الرقمي', icon: '📈' },
    programming: { name: 'البرمجة', icon: '💻' },
    networking: { name: 'الشبكات و IT', icon: '🌐' },
    'app-development': { name: 'تطوير التطبيقات', icon: '📱' },
    design: { name: 'التصميم والمونتاج', icon: '🎨' },
    'web-development': { name: 'تطوير الويب', icon: '🌍' },
  }

  return Object.entries(categoryCounts).map(([slug, count]) => ({
    id: slug,
    name: categoryLabels[slug]?.name || slug,
    slug,
    icon: categoryLabels[slug]?.icon || '📚',
    courses_count: count,
  }))
})

// Get course stats
export const getCourseStats = cache(async () => {
  const supabase = await createClient()

  const [coursesResult, studentsResult, lessonsResult] = await Promise.all([
    supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true),
  ])

  return {
    coursesCount: coursesResult.count || 0,
    studentsCount: studentsResult.count || 0,
    lessonsCount: lessonsResult.count || 0,
  }
})

// Helper: Format duration from minutes
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins} دقيقة`
  if (mins === 0) return `${hours} ساعة`
  return `${hours}س ${mins}د`
}

// Helper: Format duration from seconds
export const formatDurationSeconds = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// Helper: Format price
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ar-IQ').format(price)
}

// Helper: Get level label
export const getLevelLabel = (level: string): string => {
  const labels: Record<string, string> = {
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم',
  }
  return labels[level] || level
}

// Helper: Get category label
export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    cybersecurity: 'الأمن السيبراني',
    marketing: 'التسويق الرقمي',
    programming: 'البرمجة',
    networking: 'الشبكات و IT',
    'app-development': 'تطوير التطبيقات',
    design: 'التصميم والمونتاج',
    'web-development': 'تطوير الويب',
  }
  return labels[category] || category
}
