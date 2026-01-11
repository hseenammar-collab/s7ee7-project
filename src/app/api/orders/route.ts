import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Create new order/payment
export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient()
  try {
    const {
      userId,
      courseId,
      amount,
      originalAmount,
      discountAmount,
      couponId,
      couponCode,
      paymentMethod,
      receiptUrl,
    } = await request.json()

    // Validate required fields
    if (!userId || !courseId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'بيانات غير مكتملة' },
        { status: 400 }
      )
    }

    // Check if user already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'أنت مسجل بالفعل في هذا الكورس' },
        { status: 400 }
      )
    }

    // Check for pending payment
    const { data: pendingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('status', 'pending')
      .single()

    if (pendingPayment) {
      return NextResponse.json(
        { error: 'لديك طلب دفع قيد الانتظار لهذا الكورس' },
        { status: 400 }
      )
    }

    // Increment coupon usage if used
    if (couponId) {
      await supabase
        .from('coupons')
        .update({
          current_uses: supabase.rpc('increment', { x: 1 }),
        })
        .eq('id', couponId)
    }

    // Create payment record
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        course_id: courseId,
        amount_iqd: amount,
        original_amount_iqd: originalAmount || amount,
        discount_amount_iqd: discountAmount || 0,
        coupon_id: couponId || null,
        payment_method: paymentMethod,
        receipt_url: receiptUrl || null,
        status: 'pending',
        metadata: {
          coupon_code: couponCode || null,
        },
      })
      .select()
      .single()

    if (error) {
      console.error('Payment creation error:', error)
      return NextResponse.json(
        { error: 'فشل إنشاء طلب الدفع' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      payment,
      message: 'تم إنشاء طلب الدفع بنجاح',
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ، حاول مرة أخرى' },
      { status: 500 }
    )
  }
}

// Get user orders
export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient()
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة' },
        { status: 400 }
      )
    }

    const { data: orders, error } = await supabase
      .from('payments')
      .select(`
        *,
        course:courses(id, title, slug, thumbnail_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'فشل جلب الطلبات' },
        { status: 500 }
      )
    }

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
