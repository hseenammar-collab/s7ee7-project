import { createClient } from '@/lib/supabase/server'
import HomeClient from './HomeClient'

export const metadata = {
  title: 'S7ee7 Academy - أكاديمية التسويق الرقمي الأولى في العراق',
  description: 'تعلم التسويق الرقمي من خبير بـ $425,000+ Ad Spend. كورسات عملية في Meta Ads، Google Ads، والتجارة الإلكترونية. ابدأ رحلتك نحو الحرية المالية!',
}

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch featured courses
  const { data: featuredCourses } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .limit(4)

  // Fetch latest courses
  const { data: latestCourses } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(6)

  // Fetch all published courses for filtering
  const { data: allCourses } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  // Get total courses count
  const { count: coursesCount } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  // Get total students count
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
