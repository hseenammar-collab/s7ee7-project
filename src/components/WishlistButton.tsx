'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWishlist } from '@/hooks/useWishlist'

interface WishlistButtonProps {
  courseId: string
  variant?: 'icon' | 'full'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function WishlistButton({
  courseId,
  variant = 'icon',
  size = 'md',
  className = '',
}: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist, isLoading } = useWishlist()
  const [isToggling, setIsToggling] = useState(false)

  const inWishlist = isInWishlist(courseId)

  const handleToggle = async () => {
    setIsToggling(true)
    await toggleWishlist(courseId)
    setIsToggling(false)
  }

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading || isToggling}
        className={`${sizeClasses[size]} rounded-xl flex items-center justify-center transition-all ${
          inWishlist
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
        } ${className}`}
      >
        <Heart
          className={`${iconSizes[size]} ${inWishlist ? 'fill-current' : ''} ${
            isToggling ? 'animate-pulse' : ''
          }`}
        />
      </button>
    )
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading || isToggling}
      variant="outline"
      className={`${
        inWishlist
          ? 'border-red-500/50 text-red-400 hover:bg-red-500/20'
          : 'border-white/10 text-white hover:bg-white/10'
      } ${className}`}
    >
      <Heart
        className={`h-4 w-4 ml-2 ${inWishlist ? 'fill-current' : ''}`}
      />
      {inWishlist ? 'في المفضلة' : 'أضف للمفضلة'}
    </Button>
  )
}
