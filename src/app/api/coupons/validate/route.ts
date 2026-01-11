import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient()
  try {
    const { code, courseId, userId } = await request.json()

    if (!code) {
      return NextResponse.json(
        { valid: false, message: 'يرجى إدخال كود الكوبون' },
        { status: 400 }
      )
    }

    // Fetch coupon
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (error || !coupon) {
      return NextResponse.json(
        { valid: false, message: 'الكوبون غير صالح' },
        { status: 200 }
      )
    }

    // Check if coupon is active
    if (!coupon.is_active) {
      return NextResponse.json(
        { valid: false, message: 'الكوبون غير مفعل' },
        { status: 200 }
      )
    }

    // Check validity dates
    const now = new Date()
    const validFrom = new Date(coupon.valid_from)
    const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null

    if (now < validFrom) {
      return NextResponse.json(
        { valid: false, message: 'الكوبون لم يبدأ بعد' },
        { status: 200 }
      )
    }

    if (validUntil && now > validUntil) {
      return NextResponse.json(
        { valid: false, message: 'الكوبون منتهي الصلاحية' },
        { status: 200 }
      )
    }

    // Check max uses
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return NextResponse.json(
        { valid: false, message: 'تم استخدام الكوبون بالكامل' },
        { status: 200 }
      )
    }

    // Check if coupon is for specific course
    if (coupon.course_id && coupon.course_id !== courseId) {
      return NextResponse.json(
        { valid: false, message: 'الكوبون غير صالح لهذا الكورس' },
        { status: 200 }
      )
    }

    // Check user usage limit
    if (userId && coupon.max_uses_per_user) {
      const { count } = await supabase
        .from('payments')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('coupon_id', coupon.id)
        .in('status', ['completed', 'pending', 'processing'])

      if (count && count >= coupon.max_uses_per_user) {
        return NextResponse.json(
          { valid: false, message: 'لقد استخدمت هذا الكوبون من قبل' },
          { status: 200 }
        )
      }
    }

    // Coupon is valid!
    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        description: coupon.description,
      },
      message: 'تم تطبيق الكوبون بنجاح!',
    })
  } catch (error) {
    console.error('Coupon validation error:', error)
    return NextResponse.json(
      { valid: false, message: 'حدث خطأ، حاول مرة أخرى' },
      { status: 500 }
    )
  }
}
