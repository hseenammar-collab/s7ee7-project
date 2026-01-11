import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Update lesson progress
export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient()
  try {
    const { userId, lessonId, courseId, watchedSeconds, totalSeconds, isCompleted } = await request.json()

    if (!userId || !lessonId || !courseId) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة' },
        { status: 400 }
      )
    }

    // Upsert lesson progress
    const { data: progress, error: progressError } = await supabase
      .from('lesson_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        course_id: courseId,
        watched_seconds: watchedSeconds || 0,
        total_seconds: totalSeconds || 0,
        is_completed: isCompleted || false,
        completed_at: isCompleted ? new Date().toISOString() : null,
        last_watched_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,lesson_id',
      })
      .select()
      .single()

    if (progressError) {
      console.error('Progress upsert error:', progressError)
      return NextResponse.json(
        { error: 'فشل تحديث التقدم' },
        { status: 500 }
      )
    }

    // Calculate overall course progress
    const { data: allLessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId)
      .eq('is_published', true)

    const { data: completedLessons } = await supabase
      .from('lesson_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('is_completed', true)

    const totalLessons = allLessons?.length || 1
    const completedCount = completedLessons?.length || 0
    const progressPercentage = Math.round((completedCount / totalLessons) * 100)

    // Update enrollment progress
    const { error: enrollmentError } = await supabase
      .from('enrollments')
      .update({
        progress_percentage: progressPercentage,
        last_lesson_id: lessonId,
        last_watched_at: new Date().toISOString(),
        completed_at: progressPercentage === 100 ? new Date().toISOString() : null,
      })
      .eq('user_id', userId)
      .eq('course_id', courseId)

    if (enrollmentError) {
      console.error('Enrollment update error:', enrollmentError)
    }

    return NextResponse.json({
      success: true,
      progress: {
        lessonProgress: progress,
        courseProgress: progressPercentage,
        completedLessons: completedCount,
        totalLessons,
      },
    })
  } catch (error) {
    console.error('Progress update error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ، حاول مرة أخرى' },
      { status: 500 }
    )
  }
}

// Get course progress for a user
export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient()
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const courseId = searchParams.get('courseId')

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة' },
        { status: 400 }
      )
    }

    // Get all lesson progress for the course
    const { data: progressData, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)

    if (error) {
      return NextResponse.json(
        { error: 'فشل جلب التقدم' },
        { status: 500 }
      )
    }

    // Get enrollment data
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    return NextResponse.json({
      lessons: progressData || [],
      enrollment,
    })
  } catch (error) {
    console.error('Get progress error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
