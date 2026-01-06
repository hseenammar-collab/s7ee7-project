import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronLeft,
  Clock,
  BookOpen,
  Users,
  Star,
  Signal,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Globe,
  Award,
  Infinity,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import CourseCard from '@/components/course/CourseCard'
import CourseSidebarDark from './CourseSidebarDark'
import CourseContentDark from './CourseContentDark'
import InstructorCard from './InstructorCard'
import {
  categoryLabels,
  levelLabels,
  levelColors,
  formatDuration,
} from '@/lib/constants'
import type { Course, Section, Lesson, Review, Profile } from '@/types/database'

// ISR - Revalidate every hour
export const revalidate = 3600

interface SectionWithLessons extends Section {
  lessons: Lesson[]
}

interface CourseWithSections extends Course {
  sections: SectionWithLessons[]
  instructor: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'bio'> | null
}

interface ReviewWithUser extends Review {
  user: Pick<Profile, 'full_name' | 'avatar_url'>
}

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getCourse(slug: string): Promise<CourseWithSections | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles!instructor_id(id, full_name, avatar_url, bio),
      sections(
        *,
        lessons(id, title, description, duration_seconds, is_free, is_published, sort_order)
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !data) return null

  // Type assertion for data
  const courseData = data as any

  // Sort sections and lessons
  const sortedData = {
    ...courseData,
    sections: (courseData.sections || [])
      .sort((a: Section, b: Section) => a.sort_order - b.sort_order)
      .map((section: SectionWithLessons) => ({
        ...section,
        lessons: (section.lessons || [])
          .filter((l: Lesson) => l.is_published)
          .sort((a: Lesson, b: Lesson) => a.sort_order - b.sort_order),
      })),
  }

  return sortedData as CourseWithSections
}

async function getReviews(courseId: string): Promise<ReviewWithUser[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('reviews')
    .select(`
      *,
      user:profiles(full_name, avatar_url)
    `)
    .eq('course_id', courseId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(10)

  return (data || []) as ReviewWithUser[]
}

async function getRelatedCourses(course: Course): Promise<Course[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('courses')
    .select('*')
    .eq('category', course.category)
    .eq('is_published', true)
    .neq('id', course.id)
    .limit(3)

  return data || []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourse(slug)

  if (!course) {
    return { title: 'كورس غير موجود' }
  }

  return {
    title: `${course.title} | S7ee7 Academy`,
    description: course.short_description || course.description || '',
    openGraph: {
      title: course.title,
      description: course.short_description || '',
      images: course.thumbnail_url ? [course.thumbnail_url] : [],
    },
  }
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params
  const course = await getCourse(slug)

  if (!course) {
    notFound()
  }

  const [reviews, relatedCourses] = await Promise.all([
    getReviews(course.id),
    getRelatedCourses(course),
  ])

  const totalLessons = course.sections.reduce(
    (acc, section) => acc + section.lessons.length,
    0
  )

  const totalDurationSeconds = course.sections.reduce(
    (acc, section) =>
      acc + section.lessons.reduce((sum, lesson) => sum + lesson.duration_seconds, 0),
    0
  )

  const hasDiscount = course.discount_price_iqd && course.discount_price_iqd < course.price_iqd
  const isFree = course.price_iqd === 0

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Breadcrumb */}
      <div className="bg-[#0f0f0f] border-b border-white/10">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-cyan-400 transition-colors">
              الرئيسية
            </Link>
            <ChevronLeft className="h-4 w-4" />
            <Link href="/courses" className="hover:text-cyan-400 transition-colors">
              الكورسات
            </Link>
            <ChevronLeft className="h-4 w-4" />
            <span className="text-white font-medium truncate max-w-[200px]">
              {course.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Course Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {course.category && (
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30">
                    {categoryLabels[course.category] || course.category}
                  </Badge>
                )}
                {course.is_featured && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    <Star className="h-3 w-3 ml-1 fill-current" />
                    مميز
                  </Badge>
                )}
                {isFree && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    مجاني
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {course.title}
              </h1>

              {/* Short Description */}
              {course.short_description && (
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                  {course.short_description}
                </p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {/* Rating */}
                {course.average_rating > 0 && (
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(course.average_rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-amber-400 font-medium">
                      {course.average_rating.toFixed(1)}
                    </span>
                    <span className="text-gray-400">({reviews.length} تقييم)</span>
                  </div>
                )}

                {/* Students */}
                {course.students_count > 0 && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="h-4 w-4" />
                    <span>{course.students_count} طالب</span>
                  </div>
                )}

                {/* Level */}
                <div className="flex items-center gap-2 text-gray-400">
                  <Signal className="h-4 w-4" />
                  <span>{levelLabels[course.level]}</span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(course.duration_minutes)}</span>
                </div>

                {/* Lessons */}
                <div className="flex items-center gap-2 text-gray-400">
                  <BookOpen className="h-4 w-4" />
                  <span>{totalLessons} درس</span>
                </div>
              </div>

              {/* Instructor Preview */}
              {course.instructor && (
                <div className="flex items-center gap-3 pt-2">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-cyan-500 to-purple-500">
                    {course.instructor.avatar_url ? (
                      <Image
                        src={course.instructor.avatar_url}
                        alt={course.instructor.full_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {course.instructor.full_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">المدرب</p>
                    <p className="text-white font-medium">{course.instructor.full_name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:sticky lg:top-24">
              <CourseSidebarDark course={course} />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* What You'll Learn */}
              {course.what_you_learn && course.what_you_learn.length > 0 && (
                <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-cyan-400" />
                    ماذا ستتعلم
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {course.what_you_learn.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 bg-white/5 rounded-xl p-4"
                      >
                        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Description */}
              {course.description && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">عن الكورس</h2>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                    <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                      {course.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Course Content / Curriculum */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-cyan-400" />
                  محتوى الكورس
                </h2>
                <CourseContentDark
                  sections={course.sections}
                  totalLessons={totalLessons}
                  totalDuration={course.duration_minutes}
                />
              </div>

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <AlertCircle className="h-6 w-6 text-amber-400" />
                    المتطلبات
                  </h2>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                    <ul className="space-y-3">
                      {course.requirements.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-sm flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Instructor Section */}
              {course.instructor && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">المدرب</h2>
                  <InstructorCard instructor={course.instructor} />
                </div>
              )}

              {/* Reviews Section */}
              {reviews.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Star className="h-6 w-6 text-amber-400" />
                    التقييمات
                    <span className="text-lg text-gray-400 font-normal">
                      ({reviews.length})
                    </span>
                  </h2>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-white/5 border border-white/10 rounded-xl p-6"
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-cyan-500 to-purple-500 flex-shrink-0">
                            {review.user.avatar_url ? (
                              <Image
                                src={review.user.avatar_url}
                                alt={review.user.full_name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                {review.user.full_name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-white">
                                {review.user.full_name}
                              </h4>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-gray-600'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-gray-400">{review.comment}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Sidebar */}
            <div className="lg:hidden">
              <CourseSidebarDark course={course} />
            </div>
          </div>
        </div>
      </section>

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
        <section className="py-12 border-t border-white/10">
          <div className="container-custom">
            <h2 className="text-2xl font-bold text-white mb-8">كورسات مشابهة</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCourses.map((relatedCourse, index) => (
                <CourseCard key={relatedCourse.id} course={relatedCourse} index={index} variant="dark" />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
