import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// التحقق من تسجيل المستخدم في كورس
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId مطلوب' },
        { status: 400 }
      )
    }

    // إنشاء Supabase client مع الـ cookies
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // الحصول على المستخدم الحالي
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({
        enrolled: false,
        message: 'غير مسجل دخول',
        user: null,
      })
    }

    // التحقق من التسجيل في الكورس
    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .select(
        `
        *,
        course:courses(id, title, slug, thumbnail_url, teachable_url)
      `
      )
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Enrollment check error:', error)
      return NextResponse.json(
        { error: 'حدث خطأ في التحقق' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      enrolled: !!enrollment,
      enrollment,
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Enrollment check error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// تسجيل مجاني في كورس
export async function POST(request: NextRequest) {
  try {
    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId مطلوب' },
        { status: 400 }
      )
    }

    // إنشاء Supabase client
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // الحصول على المستخدم الحالي
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      )
    }

    // التحقق من أن الكورس مجاني
    const { data: course } = await supabase
      .from('courses')
      .select('price_iqd, title')
      .eq('id', courseId)
      .single()

    if (!course) {
      return NextResponse.json(
        { error: 'الكورس غير موجود' },
        { status: 404 }
      )
    }

    if (course.price_iqd > 0) {
      return NextResponse.json(
        { error: 'هذا الكورس ليس مجانياً' },
        { status: 400 }
      )
    }

    // التحقق من عدم وجود تسجيل مسبق
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'أنت مسجل بالفعل في هذا الكورس' },
        { status: 400 }
      )
    }

    // إنشاء التسجيل
    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .insert({
        user_id: user.id,
        course_id: courseId,
        progress_percentage: 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Enrollment error:', error)
      return NextResponse.json(
        { error: 'فشل التسجيل في الكورس' },
        { status: 500 }
      )
    }

    // زيادة عدد الطلاب
    await supabase
      .from('courses')
      .update({
        students_count: (course as any).students_count + 1 || 1,
      })
      .eq('id', courseId)

    return NextResponse.json({
      success: true,
      enrollment,
      message: `تم التسجيل في "${course.title}" بنجاح!`,
    })
  } catch (error) {
    console.error('Free enrollment error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
