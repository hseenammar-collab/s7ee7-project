'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

const couponSchema = z.object({
  code: z
    .string()
    .min(3, 'الكود يجب أن يكون 3 أحرف على الأقل')
    .max(20, 'الكود يجب أن لا يتجاوز 20 حرف')
    .regex(/^[A-Z0-9_-]+$/i, 'الكود يجب أن يحتوي على أحرف وأرقام فقط'),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.coerce
    .number()
    .min(1, 'قيمة الخصم مطلوبة'),
  max_uses: z.coerce.number().optional().nullable(),
  expires_at: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
})

type CouponFormData = z.infer<typeof couponSchema>

export default function NewCouponPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      discount_type: 'percentage',
      is_active: true,
    },
  })

  const discountType = watch('discount_type')

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
      const { error } = await (supabase as any).from('coupons').insert({
        code: data.code.toUpperCase(),
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        max_uses: data.max_uses || null,
        valid_until: data.expires_at || null,
        is_active: data.is_active,
        current_uses: 0,
      })

      if (error) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          toast.error('هذا الكود مستخدم مسبقاً')
        } else {
          throw error
        }
        setIsSubmitting(false)
        return
      }

      toast.success('تم إنشاء الكوبون بنجاح')
      router.push('/admin/coupons')
    } catch (error) {
      toast.error('حدث خطأ في إنشاء الكوبون')
      setIsSubmitting(false)
    }
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setValue('code', code)
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
          <h1 className="text-2xl font-bold">كوبون جديد</h1>
          <p className="text-gray-500">إنشاء كوبون خصم جديد</p>
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
              <div className="flex gap-2">
                <Input
                  id="code"
                  placeholder="مثال: SAVE20"
                  className="uppercase"
                  {...register('code')}
                />
                <Button type="button" variant="outline" onClick={generateCode}>
                  توليد
                </Button>
              </div>
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
                {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء الكوبون'}
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
