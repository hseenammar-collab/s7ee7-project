import { createClient } from '@/lib/supabase/server'
import HomeClient from './HomeClient'

export const metadata = {
  title: 'S7ee7 Academy - أكاديمية التسويق الرقمي الأولى في العراق',
  description: 'تعلم التسويق الرقمي من خبير بـ $425,000+ Ad Spend.',
}

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredCourses } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .limit(4)

  const { data: latestCourses } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(6)

  const { data: allCourses } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const { count: coursesCount } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  const { count: studentsCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  return (
    <HomeClient
      featuredCourses={featuredCourses || []}
      latestCourses={latestCourses || []}
      allCourses={allCourses || []}
      coursesCount={coursesCount || 41}
      studentsCount={studentsCount || 500}
    />
  )
}