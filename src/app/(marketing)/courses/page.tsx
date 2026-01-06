import { Suspense } from 'react'
import { getCourses, getCategories, getCourseStats } from '@/lib/queries/courses'
import CoursesClient from './CoursesClient'

// ISR - Revalidate every hour
export const revalidate = 3600

export const metadata = {
  title: 'الكورسات | S7ee7 Academy',
  description: 'استكشف مجموعة واسعة من الكورسات الاحترافية في الأمن السيبراني، التسويق الرقمي، البرمجة والمزيد.',
}

// Loading skeleton
function CoursesLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="h-12 w-64 bg-white/5 rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-96 bg-white/5 rounded-lg mx-auto animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-2xl h-[380px] animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function CoursesPage() {
  // Parallel data fetching
  const [courses, categories, stats] = await Promise.all([
    getCourses(),
    getCategories(),
    getCourseStats(),
  ])

  return (
    <Suspense fallback={<CoursesLoading />}>
      <CoursesClient
        initialCourses={courses}
        categories={categories}
        stats={stats}
      />
    </Suspense>
  )
}
