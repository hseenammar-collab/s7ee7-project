import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CheckoutClient from './CheckoutClient'

export const metadata = {
  title: 'إتمام الشراء',
}

interface Props {
  params: Promise<{ courseId: string }>
}

export default async function CheckoutPage({ params }: Props) {
  const { courseId } = await params
  const supabase = await createClient()

  // Check if user is logged in
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  console.log('=== Server Checkout Auth Debug ===')
  console.log('User:', user)
  console.log('User Error:', userError)
  console.log('Course ID:', courseId)
  console.log('==================================')

  if (!user) {
    console.log('No user found, redirecting to login...')
    redirect(`/login?redirect=/checkout/${courseId}`)
  }

  // Fetch course details
  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .eq('is_published', true)
    .single()

  if (error || !course) {
    redirect('/courses')
  }

  // Check if user already enrolled
  const { data: existingEnrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .single()

  if (existingEnrollment) {
    redirect(`/courses/${courseId}/learn`)
  }

  // Check if there's a pending payment
  const { data: pendingPayment } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .eq('status', 'pending')
    .single()

  return (
    <CheckoutClient
      course={course}
      userId={user.id}
      pendingPayment={pendingPayment}
    />
  )
}
