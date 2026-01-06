'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpen,
  Clock,
  PlayCircle,
  CheckCircle,
  ChevronDown,
  ArrowRight,
  Award,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Course, Section, Lesson, Enrollment, LessonProgress } from '@/types/database'

interface SectionWithLessons extends Section {
  lessons: (Lesson & { progress?: LessonProgress })[]
}

interface CourseWithSections extends Course {
  sections: SectionWithLessons[]
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<CourseWithSections | null>(null)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchCourseData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch enrollment
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

      if (!enrollmentData) {
        router.push('/my-courses')
        return
      }
      setEnrollment(enrollmentData)

      // Fetch course with sections and lessons
      const { data: courseData } = await supabase
        .from('courses')
        .select(`
          *,
          sections(
            *,
            lessons(*)
          )
        `)
        .eq('id', courseId)
        .single()

      if (!courseData) {
        router.push('/my-courses')
        return
      }

      // Fetch lesson progress
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)

      // Merge progress with lessons
      const sectionsWithProgress = courseData.sections
        .sort((a: Section, b: Section) => a.sort_order - b.sort_order)
        .map((section: Section & { lessons: Lesson[] }) => ({
          ...section,
          lessons: section.lessons
            .sort((a: Lesson, b: Lesson) => a.sort_order - b.sort_order)
            .map((lesson: Lesson) => ({
              ...lesson,
              progress: progressData?.find((p) => p.lesson_id === lesson.id),
            })),
        }))

      setCourse({ ...courseData, sections: sectionsWithProgress })

      // Expand first section by default
      if (sectionsWithProgress.length > 0) {
        setExpandedSections([sectionsWithProgress[0].id])
      }

      setIsLoading(false)
    }

    fetchCourseData()
  }, [courseId, router, supabase])

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getCompletedLessonsCount = () => {
    if (!course) return 0
    return course.sections.reduce(
      (acc, section) =>
        acc + section.lessons.filter((l) => l.progress?.is_completed).length,
      0
    )
  }

  const getTotalLessonsCount = () => {
    if (!course) return 0
    return course.sections.reduce((acc, section) => acc + section.lessons.length, 0)
  }

  const getNextLesson = () => {
    if (!course) return null
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        if (!lesson.progress?.is_completed) {
          return lesson
        }
      }
    }
    return course.sections[0]?.lessons[0] || null
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!course || !enrollment) return null

  const nextLesson = getNextLesson()
  const completedCount = getCompletedLessonsCount()
  const totalCount = getTotalLessonsCount()
  const isCompleted = enrollment.progress_percentage >= 100

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/my-courses"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowRight className="ml-1 h-4 w-4" />
        العودة لكورساتي
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Header */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="relative h-48 sm:h-64 bg-gray-100">
              {course.thumbnail_url ? (
                <Image
                  src={course.thumbnail_url}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-gray-300" />
                </div>
              )}
              {isCompleted && (
                <div className="absolute inset-0 bg-green-500/90 flex flex-col items-center justify-center text-white">
                  <Award className="h-16 w-16 mb-2" />
                  <span className="text-xl font-bold">تهانينا! أكملت الكورس</span>
                </div>
              )}
            </div>
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold mb-3">{course.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {totalCount} درس
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.round(course.duration_minutes / 60)} ساعة
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {completedCount} من {totalCount} مكتمل
                </span>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>نسبة الإتمام</span>
                  <span className="font-medium">{enrollment.progress_percentage}%</span>
                </div>
                <Progress value={enrollment.progress_percentage} className="h-3" />
              </div>

              {/* Continue Button */}
              {nextLesson && !isCompleted && (
                <Link href={`/my-courses/${courseId}/${nextLesson.id}`}>
                  <Button className="mt-4 w-full sm:w-auto">
                    <PlayCircle className="ml-2 h-5 w-5" />
                    متابعة من حيث توقفت
                  </Button>
                </Link>
              )}

              {isCompleted && (
                <Link href="/certificates">
                  <Button className="mt-4 w-full sm:w-auto bg-green-600 hover:bg-green-700">
                    <Award className="ml-2 h-5 w-5" />
                    عرض الشهادة
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Course Description */}
          {course.description && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">عن الكورس</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 whitespace-pre-line">{course.description}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Course Content */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-sm sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">محتوى الكورس</CardTitle>
              <p className="text-sm text-gray-500">
                {course.sections.length} قسم • {totalCount} درس
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[60vh] overflow-y-auto">
                {course.sections.map((section, sectionIndex) => (
                  <div key={section.id}>
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 text-right">
                        <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                          {sectionIndex + 1}
                        </span>
                        <div>
                          <h4 className="font-medium text-sm">{section.title}</h4>
                          <p className="text-xs text-gray-500">
                            {section.lessons.length} درس •{' '}
                            {section.lessons.filter((l) => l.progress?.is_completed).length}{' '}
                            مكتمل
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={cn(
                          'h-5 w-5 text-gray-400 transition-transform',
                          expandedSections.includes(section.id) && 'rotate-180'
                        )}
                      />
                    </button>

                    {/* Section Lessons */}
                    {expandedSections.includes(section.id) && (
                      <div className="bg-gray-50 px-4 pb-2">
                        {section.lessons.map((lesson, lessonIndex) => (
                          <Link
                            key={lesson.id}
                            href={`/my-courses/${courseId}/${lesson.id}`}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors',
                              lesson.progress?.is_completed && 'opacity-70'
                            )}
                          >
                            {lesson.progress?.is_completed ? (
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <PlayCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{lesson.title}</p>
                              <p className="text-xs text-gray-500">
                                {formatDuration(lesson.duration_seconds)}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    <Separator />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
