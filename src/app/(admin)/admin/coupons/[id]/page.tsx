'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Coupon } from '@/types/database'

const couponSchema = z.object({
  code: z
    .string()
    .min(3, 'الكود يجب أن يكون 3 أحرف على الأقل')
    .max(20, 'الكود يجب أن لا يتجاوز 20 حرف')
    .regex(/^[A-Z0-9_-]+$/i, 'الكود يجب أن يحتوي على أحرف وأرقام فقط'),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.coerce.number().min(1, 'قيمة الخصم مطلوبة'),
  max_uses: z.coerce.number().optional().nullable(),
  expires_at: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
})

type CouponFormData = z.infer<typeof couponSchema>

export default function EditCouponPage() {
  const router = useRouter()
  const params = useParams()
  const couponId = params.id as string

  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
  })

  const discountType = watch('discount_type')

  useEffect(() => {
    const fetchCoupon = async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', couponId)
        .single()

      if (data && !error) {
        const couponData = data as Coupon
        setCoupon(couponData)
        reset({
          code: couponData.code,
          discount_type: couponData.discount_type as 'percentage' | 'fixed',
          discount_value: couponData.discount_value,
          max_uses: couponData.max_uses,
          expires_at: couponData.valid_until
            ? new Date(couponData.valid_until).toISOString().slice(0, 16)
            : null,
          is_active: couponData.is_active,
        })
      }
      setIsLoading(false)
    }

    fetchCoupon()
  }, [couponId, supabase, reset])

  const onSubmit = async (data: CouponFormData) => {
    setIsSubmitting(true)

    try {
      // Validate percentage
      if (data.discount_type === 'percentage' && data.discount_value > 100) {
        toast.error('نسبة الخصم يجب أن لا تتجاوز 100%')
        setIsSubmitting(false)
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('coupons')
        .update({
          code: data.code.toUpperCase(),
          discount_type: data.discount_type,
          discount_value: data.discount_value,
          max_uses: data.max_uses || null,
          valid_until: data.expires_at || null,
          is_active: data.is_active,
        })
        .eq('id', couponId)

      if (error) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          toast.error('هذا الكود مستخدم مسبقاً')
        } else {
          throw error
        }
        setIsSubmitting(false)
        return
      }

      toast.success('تم تحديث الكوبون بنجاح')
      router.push('/admin/coupons')
    } catch (error) {
      toast.error('حدث خطأ في تحديث الكوبون')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!coupon) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">الكوبون غير موجود</p>
        <Link href="/admin/coupons">
          <Button variant="link">العودة للقائمة</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/coupons">
          <Button variant="ghost" size="icon">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">تعديل الكوبون</h1>
          <p className="text-gray-500">
            <code className="bg-gray-100 px-2 py-1 rounded">{coupon.code}</code>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>معلومات الكوبون</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code">كود الكوبون *</Label>
              <Input
                id="code"
                placeholder="مثال: SAVE20"
                className="uppercase"
                {...register('code')}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>

            {/* Discount Type & Value */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع الخصم *</Label>
                <Select
                  value={discountType}
                  onValueChange={(value: 'percentage' | 'fixed') =>
                    setValue('discount_type', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                    <SelectItem value="fixed">مبلغ ثابت (د.ع)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  قيمة الخصم {discountType === 'percentage' ? '(%)' : '(د.ع)'} *
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  min="1"
                  max={discountType === 'percentage' ? 100 : undefined}
                  placeholder={discountType === 'percentage' ? '20' : '5000'}
                  {...register('discount_value')}
                />
                {errors.discount_value && (
                  <p className="text-sm text-red-500">
                    {errors.discount_value.message}
                  </p>
                )}
              </div>
            </div>

            {/* Usage Stats */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                تم استخدام هذا الكوبون{' '}
                <strong>{coupon.current_uses || 0}</strong> مرة
                {coupon.max_uses && ` من أصل ${coupon.max_uses}`}
              </p>
            </div>

            {/* Max Uses & Expiry */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_uses">الحد الأقصى للاستخدام</Label>
                <Input
                  id="max_uses"
                  type="number"
                  min="1"
                  placeholder="غير محدود"
                  {...register('max_uses')}
                />
                <p className="text-xs text-gray-500">
                  اتركه فارغاً للاستخدام غير المحدود
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires_at">تاريخ الانتهاء</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  {...register('expires_at')}
                />
                <p className="text-xs text-gray-500">
                  اتركه فارغاً لعدم وجود تاريخ انتهاء
                </p>
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="is_active">تفعيل الكوبون</Label>
                <p className="text-sm text-gray-500">
                  هل الكوبون متاح للاستخدام؟
                </p>
              </div>
              <Switch
                id="is_active"
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
              <Link href="/admin/coupons">
                <Button type="button" variant="outline">
                  إلغاء
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
