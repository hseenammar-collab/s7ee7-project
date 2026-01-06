'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  PlayCircle,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Course, Section, Lesson, LessonProgress } from '@/types/database'

interface SectionWithLessons extends Section {
  lessons: (Lesson & { progress?: LessonProgress })[]
}

interface CourseWithSections extends Course {
  sections: SectionWithLessons[]
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const lessonId = params.lessonId as string

  const [course, setCourse] = useState<CourseWithSections | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [isCompleting, setIsCompleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Verify enrollment
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

      if (!enrollment) {
        router.push('/my-courses')
        return
      }

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

      // Find current lesson
      let foundLesson: Lesson | null = null
      let foundSectionId: string | null = null
      for (const section of sectionsWithProgress) {
        const lesson = section.lessons.find((l: Lesson) => l.id === lessonId)
        if (lesson) {
          foundLesson = lesson
          foundSectionId = section.id
          break
        }
      }

      if (!foundLesson) {
        router.push(`/my-courses/${courseId}`)
        return
      }

      setCurrentLesson(foundLesson)
      if (foundSectionId) {
        setExpandedSections([foundSectionId])
      }

      // Update last watched
      await supabase
        .from('enrollments')
        .update({
          last_lesson_id: lessonId,
          last_watched_at: new Date().toISOString(),
        })
        .eq('id', enrollment.id)

      setIsLoading(false)
    }

    fetchData()
  }, [courseId, lessonId, router, supabase])

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

  const getAllLessons = () => {
    if (!course) return []
    return course.sections.flatMap((s) => s.lessons)
  }

  const getCurrentLessonIndex = () => {
    const allLessons = getAllLessons()
    return allLessons.findIndex((l) => l.id === lessonId)
  }

  const getPrevLesson = () => {
    const allLessons = getAllLessons()
    const currentIndex = getCurrentLessonIndex()
    return currentIndex > 0 ? allLessons[currentIndex - 1] : null
  }

  const getNextLesson = () => {
    const allLessons = getAllLessons()
    const currentIndex = getCurrentLessonIndex()
    return currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
  }

  const markAsComplete = async () => {
    if (!currentLesson) return
    setIsCompleting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Upsert lesson progress
      await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          is_completed: true,
          completed_at: new Date().toISOString(),
          watched_seconds: currentLesson.duration_seconds,
          total_seconds: currentLesson.duration_seconds,
        }, {
          onConflict: 'user_id,lesson_id',
        })

      // Update enrollment progress
      const allLessons = getAllLessons()
      const completedCount = allLessons.filter(
        (l: any) => l.progress?.is_completed || l.id === lessonId
      ).length
      const progressPercentage = Math.round((completedCount / allLessons.length) * 100)

      await supabase
        .from('enrollments')
        .update({ progress_percentage: progressPercentage })
        .eq('user_id', user.id)
        .eq('course_id', courseId)

      toast.success('تم تحديد الدرس كمكتمل!')

      // Move to next lesson or show completion
      const nextLesson = getNextLesson()
      if (nextLesson) {
        router.push(`/my-courses/${courseId}/${nextLesson.id}`)
      } else {
        toast.success('تهانينا! أكملت جميع الدروس')
        router.push(`/my-courses/${courseId}`)
      }
    } catch (error) {
      toast.error('حدث خطأ، حاول مرة أخرى')
    } finally {
      setIsCompleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">جاري تحميل الدرس...</p>
        </div>
      </div>
    )
  }

  if (!course || !currentLesson) return null

  const prevLesson = getPrevLesson()
  const nextLesson = getNextLesson()
  const isLessonCompleted = (currentLesson as any).progress?.is_completed

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href={`/my-courses/${courseId}`}
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowRight className="ml-1 h-4 w-4" />
        العودة للكورس
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player Placeholder */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <PlayCircle className="h-20 w-20 mx-auto mb-4 opacity-50" />
                <p className="text-lg opacity-70">مشغل الفيديو</p>
                <p className="text-sm opacity-50">سيتم ربطه مع Bunny Stream</p>
              </div>
            </div>
          </Card>

          {/* Lesson Info */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-xl font-bold mb-2">{currentLesson.title}</h1>
                  <p className="text-sm text-gray-500">
                    {formatDuration(currentLesson.duration_seconds)}
                  </p>
                </div>
                {isLessonCompleted ? (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">مكتمل</span>
                  </div>
                ) : (
                  <Button onClick={markAsComplete} disabled={isCompleting}>
                    {isCompleting ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="ml-2 h-4 w-4" />
                        تم الإكمال
                      </>
                    )}
                  </Button>
                )}
              </div>

              {currentLesson.description && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="font-medium mb-2">وصف الدرس</h3>
                    <p className="text-gray-600 whitespace-pre-line">
                      {currentLesson.description}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {prevLesson ? (
              <Link href={`/my-courses/${courseId}/${prevLesson.id}`}>
                <Button variant="outline">
                  <ChevronRight className="ml-2 h-4 w-4" />
                  الدرس السابق
                </Button>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link href={`/my-courses/${courseId}/${nextLesson.id}`}>
                <Button>
                  الدرس التالي
                  <ChevronLeft className="mr-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href={`/my-courses/${courseId}`}>
                <Button className="bg-green-600 hover:bg-green-700">
                  إنهاء الكورس
                  <CheckCircle className="mr-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Sidebar - Course Content */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-sm sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{course.title}</CardTitle>
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
                        <h4 className="font-medium text-sm">{section.title}</h4>
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
                        {section.lessons.map((lesson) => {
                          const isCurrentLesson = lesson.id === lessonId
                          const isCompleted = (lesson as any).progress?.is_completed

                          return (
                            <Link
                              key={lesson.id}
                              href={`/my-courses/${courseId}/${lesson.id}`}
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-lg transition-colors',
                                isCurrentLesson
                                  ? 'bg-primary/10 text-primary'
                                  : 'hover:bg-white',
                                isCompleted && !isCurrentLesson && 'opacity-70'
                              )}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                              ) : isCurrentLesson ? (
                                <PlayCircle className="h-5 w-5 text-primary flex-shrink-0" />
                              ) : (
                                <PlayCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p
                                  className={cn(
                                    'text-sm truncate',
                                    isCurrentLesson && 'font-medium'
                                  )}
                                >
                                  {lesson.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDuration(lesson.duration_seconds)}
                                </p>
                              </div>
                            </Link>
                          )
                        })}
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
