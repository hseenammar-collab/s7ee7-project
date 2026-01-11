'use client'

import { useState, useEffect, useCallback } from 'react'
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
  FileText,
  Download,
  Lock,
  BookOpen,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import VideoPlayer from '@/components/learn/VideoPlayer'
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
  const [currentLesson, setCurrentLesson] = useState<(Lesson & { progress?: LessonProgress }) | null>(null)
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [isCompleting, setIsCompleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [courseProgress, setCourseProgress] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Verify enrollment
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

      if (!enrollment) {
        toast.error('يجب أن تكون مسجلاً في الكورس لمشاهدة الدروس')
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

      // Calculate course progress
      const allLessons = sectionsWithProgress.flatMap((s: SectionWithLessons) => s.lessons)
      const completedLessons = allLessons.filter((l: any) => l.progress?.is_completed).length
      setCourseProgress(Math.round((completedLessons / allLessons.length) * 100))

      // Find current lesson
      let foundLesson: (Lesson & { progress?: LessonProgress }) | null = null
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

  const getAllLessons = useCallback(() => {
    if (!course) return []
    return course.sections.flatMap((s) => s.lessons)
  }, [course])

  const getCurrentLessonIndex = useCallback(() => {
    const allLessons = getAllLessons()
    return allLessons.findIndex((l) => l.id === lessonId)
  }, [getAllLessons, lessonId])

  const getPrevLesson = useCallback(() => {
    const allLessons = getAllLessons()
    const currentIndex = getCurrentLessonIndex()
    return currentIndex > 0 ? allLessons[currentIndex - 1] : null
  }, [getAllLessons, getCurrentLessonIndex])

  const getNextLesson = useCallback(() => {
    const allLessons = getAllLessons()
    const currentIndex = getCurrentLessonIndex()
    return currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
  }, [getAllLessons, getCurrentLessonIndex])

  // Save video progress
  const handleVideoProgress = useCallback(async (seconds: number) => {
    if (!currentLesson) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('lesson_progress')
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        course_id: courseId,
        watched_seconds: seconds,
        total_seconds: currentLesson.duration_seconds,
        last_watched_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,lesson_id',
      })
  }, [supabase, currentLesson, lessonId, courseId])

  // Mark lesson as complete
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
        .update({
          progress_percentage: progressPercentage,
          completed_at: progressPercentage === 100 ? new Date().toISOString() : null,
        })
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
      console.error(error)
      toast.error('حدث خطأ، حاول مرة أخرى')
    } finally {
      setIsCompleting(false)
    }
  }

  // Auto-complete on video end
  const handleVideoComplete = useCallback(async () => {
    if (!currentLesson?.progress?.is_completed) {
      await markAsComplete()
    }
  }, [currentLesson])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل الدرس...</p>
        </div>
      </div>
    )
  }

  if (!course || !currentLesson) return null

  const prevLesson = getPrevLesson()
  const nextLesson = getNextLesson()
  const isLessonCompleted = currentLesson.progress?.is_completed
  const resources = currentLesson.resources as { name: string; url: string }[] | null

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="container mx-auto px-4 py-6">
        {/* Back Button & Course Progress */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/my-courses/${courseId}`}
            className="inline-flex items-center text-sm text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowRight className="ml-1 h-4 w-4" />
            العودة للكورس
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">تقدم الكورس</span>
            <div className="w-32">
              <Progress value={courseProgress} className="h-2 bg-white/10" />
            </div>
            <span className="text-sm font-medium text-cyan-400">{courseProgress}%</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            {currentLesson.video_url ? (
              <VideoPlayer
                src={currentLesson.video_url}
                poster={course.thumbnail_url || undefined}
                title={currentLesson.title}
                onProgress={handleVideoProgress}
                onComplete={handleVideoComplete}
                initialTime={currentLesson.progress?.watched_seconds || 0}
              />
            ) : (
              <Card className="border-0 bg-white/5 overflow-hidden">
                <div className="relative aspect-video bg-[#111] flex items-center justify-center">
                  <div className="text-center text-white">
                    <BookOpen className="h-20 w-20 mx-auto mb-4 text-gray-600" />
                    <p className="text-lg text-gray-400">هذا الدرس لا يحتوي على فيديو</p>
                    <p className="text-sm text-gray-500">راجع المحتوى النصي أدناه</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Lesson Info */}
            <Card className="border-0 bg-white/5">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-xl font-bold text-white mb-2">{currentLesson.title}</h1>
                    <p className="text-sm text-gray-400">
                      {formatDuration(currentLesson.duration_seconds)} دقيقة
                    </p>
                  </div>
                  {isLessonCompleted ? (
                    <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">مكتمل</span>
                    </div>
                  ) : (
                    <Button
                      onClick={markAsComplete}
                      disabled={isCompleting}
                      className="bg-cyan-500 hover:bg-cyan-600"
                    >
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
                    <Separator className="my-4 bg-white/10" />
                    <div>
                      <h3 className="font-medium text-white mb-2">وصف الدرس</h3>
                      <p className="text-gray-400 whitespace-pre-line leading-relaxed">
                        {currentLesson.description}
                      </p>
                    </div>
                  </>
                )}

                {/* Resources */}
                {resources && resources.length > 0 && (
                  <>
                    <Separator className="my-4 bg-white/10" />
                    <div>
                      <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-cyan-400" />
                        الملفات المرفقة
                      </h3>
                      <div className="space-y-2">
                        {resources.map((resource, index) => (
                          <a
                            key={index}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                          >
                            <span className="text-gray-300">{resource.name}</span>
                            <Download className="h-4 w-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              {prevLesson ? (
                <Link href={`/my-courses/${courseId}/${prevLesson.id}`}>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <ChevronRight className="ml-2 h-4 w-4" />
                    الدرس السابق
                  </Button>
                </Link>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <Link href={`/my-courses/${courseId}/${nextLesson.id}`}>
                  <Button className="bg-cyan-500 hover:bg-cyan-600">
                    الدرس التالي
                    <ChevronLeft className="mr-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href={`/my-courses/${courseId}`}>
                  <Button className="bg-green-500 hover:bg-green-600">
                    إنهاء الكورس
                    <CheckCircle className="mr-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar - Course Content */}
          <div className="lg:col-span-1">
            <Card className="border-0 bg-white/5 sticky top-20">
              <CardHeader className="pb-3 border-b border-white/10">
                <CardTitle className="text-lg text-white">{course.title}</CardTitle>
                <p className="text-sm text-gray-400">
                  {getCurrentLessonIndex() + 1} / {getAllLessons().length} درس
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[60vh] overflow-y-auto">
                  {course.sections.map((section, sectionIndex) => {
                    const sectionLessons = section.lessons
                    const completedInSection = sectionLessons.filter((l: any) => l.progress?.is_completed).length

                    return (
                      <div key={section.id}>
                        {/* Section Header */}
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3 text-right">
                            <span className="w-7 h-7 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-medium">
                              {sectionIndex + 1}
                            </span>
                            <div>
                              <h4 className="font-medium text-sm text-white">{section.title}</h4>
                              <p className="text-xs text-gray-500">
                                {completedInSection}/{sectionLessons.length} مكتمل
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
                          <div className="bg-white/5 px-4 pb-2">
                            {section.lessons.map((lesson) => {
                              const isCurrentLesson = lesson.id === lessonId
                              const isCompleted = lesson.progress?.is_completed

                              return (
                                <Link
                                  key={lesson.id}
                                  href={`/my-courses/${courseId}/${lesson.id}`}
                                  className={cn(
                                    'flex items-center gap-3 p-3 rounded-lg transition-colors',
                                    isCurrentLesson
                                      ? 'bg-cyan-500/20 text-cyan-400'
                                      : 'hover:bg-white/5',
                                    isCompleted && !isCurrentLesson && 'opacity-70'
                                  )}
                                >
                                  {isCompleted ? (
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                  ) : isCurrentLesson ? (
                                    <PlayCircle className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                                  ) : (
                                    <PlayCircle className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={cn(
                                        'text-sm truncate',
                                        isCurrentLesson ? 'font-medium text-cyan-400' : 'text-gray-300'
                                      )}
                                    >
                                      {lesson.title}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatDuration(lesson.duration_seconds)}
                                    </p>
                                  </div>
                                  {lesson.is_free && (
                                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                                      مجاني
                                    </span>
                                  )}
                                </Link>
                              )
                            })}
                          </div>
                        )}
                        <Separator className="bg-white/5" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
