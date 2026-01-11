'use client'

import { useState } from 'react'
import { Ticket, Loader2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface CouponData {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  description?: string
}

interface CouponInputProps {
  courseId: string
  userId: string
  originalPrice: number
  onApplyCoupon: (coupon: CouponData | null, finalPrice: number) => void
}

export default function CouponInput({
  courseId,
  userId,
  originalPrice,
  onApplyCoupon,
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const calculateDiscount = (coupon: CouponData): number => {
    if (coupon.discount_type === 'percentage') {
      return Math.round(originalPrice * (coupon.discount_value / 100))
    }
    return Math.min(coupon.discount_value, originalPrice)
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('يرجى إدخال كود الكوبون')
      return
    }

    setIsValidating(true)
    setError(null)

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          courseId,
          userId,
        }),
      })

      const data = await response.json()

      if (data.valid) {
        const coupon = data.coupon as CouponData
        const discount = calculateDiscount(coupon)
        const finalPrice = originalPrice - discount

        setAppliedCoupon(coupon)
        onApplyCoupon(coupon, finalPrice)
        toast.success(data.message)
      } else {
        setError(data.message)
        setAppliedCoupon(null)
        onApplyCoupon(null, originalPrice)
      }
    } catch (err) {
      setError('حدث خطأ، حاول مرة أخرى')
    } finally {
      setIsValidating(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode('')
    setAppliedCoupon(null)
    setError(null)
    onApplyCoupon(null, originalPrice)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-IQ').format(price)
  }

  if (appliedCoupon) {
    const discount = calculateDiscount(appliedCoupon)

    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <Check className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="font-medium text-green-400">
                تم تطبيق الكوبون: {appliedCoupon.code}
              </p>
              <p className="text-sm text-green-300/70">
                {appliedCoupon.discount_type === 'percentage'
                  ? `خصم ${appliedCoupon.discount_value}%`
                  : `خصم ${formatPrice(appliedCoupon.discount_value)} د.ع`}
                {' - '}
                وفرت {formatPrice(discount)} د.ع
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveCoupon}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Ticket className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value.toUpperCase())
              setError(null)
            }}
            placeholder="أدخل كود الخصم"
            className={cn(
              'pr-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-cyan-500',
              error && 'border-red-500/50'
            )}
            dir="ltr"
          />
        </div>
        <Button
          onClick={handleApplyCoupon}
          disabled={isValidating || !couponCode.trim()}
          className="bg-cyan-500 hover:bg-cyan-600 min-w-[100px]"
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'تطبيق'
          )}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1">
          <X className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  )
}
